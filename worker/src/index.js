const API = 'https://api.github.com';
const SESSION_TTL = 60 * 60 * 24 * 7;
const SESSION_PREFIX = 'session:v3:';
const DEFAULT_ADMIN_PATH = '/blog_test2/admin/';
const EXPECTED_GITHUB_OWNER = 'ice11123';
const EXPECTED_GITHUB_REPO = 'blog_test2';
const EXPECTED_GITHUB_BRANCH = 'main';
const GITHUB_TIMEOUT_MS = 15_000;
const PUBLIC_STATUS_CACHE_KEY = 'public-status:v1';
const PUBLIC_STATUS_CACHE_SECONDS = 90;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin(request, env)) return new Response('Forbidden', { status: 403 });
      return cors(new Response(null, { status: 204 }), env, request);
    }

    try {
      if (url.pathname === '/auth/github' && request.method === 'GET') return githubLogin(url, env);
      if (url.pathname === '/auth/callback' && request.method === 'GET') return await githubCallback(request, url, env);
      if (url.pathname === '/health' && request.method === 'GET') return await health(request, env);
      if (url.pathname === '/api/public-status' && request.method === 'GET') return await publicStatus(request, env);
      if (url.pathname === '/auth/me' && request.method === 'GET') return await authMe(request, env);
      if (url.pathname === '/api/status' && request.method === 'GET') return await adminStatus(request, env);
      if (url.pathname === '/api/sync' && request.method === 'POST') return await syncPost(request, env);
      if (url.pathname === '/api/delete' && request.method === 'POST') return await deletePost(request, env);
      return cors(json({ ok: false, message: 'Not found' }, 404), env, request);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message = error instanceof HttpError ? error.message : 'Server error';
      if (!(error instanceof HttpError)) console.error(error);
      return cors(json({ ok: false, message }, status), env, request);
    }
  },
};

function githubLogin(url, env) {
  requireEnv(env, ['GITHUB_OAUTH_CLIENT_ID', 'SESSION_SECRET']);
  const state = crypto.randomUUID();
  const auth = new URL('https://github.com/login/oauth/authorize');
  auth.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID);
  auth.searchParams.set('redirect_uri', new URL('/auth/callback', url).toString());
  auth.searchParams.set('scope', 'public_repo');
  auth.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: auth.toString(),
      'Set-Cookie': cookie('oauth_state', state, 600, { httpOnly: true, sameSite: 'Lax' }),
      'Cache-Control': 'no-store',
    },
  });
}

async function githubCallback(request, url, env) {
  try {
    requireEnv(env, ['GITHUB_OAUTH_CLIENT_ID', 'GITHUB_OAUTH_CLIENT_SECRET', 'SESSION_SECRET']);
    const stateCookie = getCookie(request.headers, 'oauth_state');
    const state = url.searchParams.get('state');
    if (!stateCookie || !state || stateCookie !== state) return oauthError('Invalid OAuth state', 400);
    const code = url.searchParams.get('code');
    if (!code) return oauthError('Missing OAuth code', 400);

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_OAUTH_CLIENT_ID, client_secret: env.GITHUB_OAUTH_CLIENT_SECRET, code }),
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    });
    const tokenData = await tokenResponse.json();
    const token = tokenData?.access_token;
    if (!token) return oauthError('OAuth token exchange failed', 502);

    const user = await githubFetch('/user', token);
    if (user?.login !== env.GITHUB_OWNER) return oauthError('该 GitHub 账号没有管理权限', 403);

    const sessionId = crypto.randomUUID();
    const csrfToken = crypto.randomUUID();
    const tokenCipher = await encryptSecret(token, env.SESSION_SECRET);
    await env.SESSIONS.put(`${SESSION_PREFIX}${sessionId}`, JSON.stringify({ tokenCipher, login: user.login, csrfToken }), { expirationTtl: SESSION_TTL });

    const response = new Response(null, { status: 302, headers: { Location: adminReturnUrl(env), 'Cache-Control': 'no-store' } });
    response.headers.append('Set-Cookie', clearCookie('oauth_state'));
    response.headers.append('Set-Cookie', cookie('blog_session', sessionId, SESSION_TTL, { httpOnly: true, sameSite: 'None' }));
    return response;
  } catch (error) {
    console.error(error);
    return oauthError('OAuth callback failed', 502);
  }
}

async function authMe(request, env) {
  requireOrigin(request, env);
  const session = await readSession(request, env);
  return cors(json(session ? { ok: true, login: session.login, csrfToken: session.csrfToken } : { ok: false }, session ? 200 : 401), env, request);
}

async function health(request, env) {
  requireOrigin(request, env);
  const checkedAt = new Date().toISOString();
  try {
    requireEnv(env, ['ALLOWED_ORIGIN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH']);
    if (!env.SESSIONS || typeof env.SESSIONS.get !== 'function') throw new Error('KV binding unavailable');
    await env.SESSIONS.get('__health__');
    return cors(json({ ok: true, checkedAt }), env, request);
  } catch {
    return cors(json({ ok: false, checkedAt }, 503), env, request);
  }
}

async function publicStatus(request, env) {
  requireOrigin(request, env);
  requireEnv(env, ['ALLOWED_ORIGIN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH']);
  if (!env.SESSIONS || typeof env.SESSIONS.get !== 'function' || typeof env.SESSIONS.put !== 'function') {
    return cors(json(publicStatusFailure(env), 503), env, request);
  }

  const cached = await readPublicStatusCache(env);
  if (cached && Date.now() - Date.parse(cached.checkedAt) < PUBLIC_STATUS_CACHE_SECONDS * 1000) {
    return cors(json(cached), env, request);
  }

  try {
    const fresh = await fetchPublicStatus(env);
    await env.SESSIONS.put(PUBLIC_STATUS_CACHE_KEY, JSON.stringify(fresh), { expirationTtl: 86_400 });
    return cors(json(fresh), env, request);
  } catch {
    if (cached) return cors(json({ ...cached, stale: true }), env, request);
    return cors(json(publicStatusFailure(env), 503), env, request);
  }
}

async function readPublicStatusCache(env) {
  try {
    const raw = await env.SESSIONS.get(PUBLIC_STATUS_CACHE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    return value?.ok === true && typeof value.checkedAt === 'string' ? value : null;
  } catch {
    return null;
  }
}

async function fetchPublicStatus(env) {
  const ref = await githubPublicFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`);
  const headSha = typeof ref?.object?.sha === 'string' ? ref.object.sha : '';
  if (!headSha) throw new Error('GitHub ref response missing SHA');

  let deployment = { status: 'unknown', updatedAt: null, url: null };
  try {
    const runs = await githubPublicFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/deploy.yml/runs`, {
      query: { branch: env.GITHUB_BRANCH, per_page: '1' },
    });
    const run = Array.isArray(runs?.workflow_runs) ? runs.workflow_runs[0] : null;
    if (run) deployment = {
      status: normalizeDeploymentStatus(run.status, run.conclusion),
      updatedAt: typeof run.updated_at === 'string' ? run.updated_at : null,
      url: typeof run.html_url === 'string' ? run.html_url : null,
    };
  } catch {
    deployment = { status: 'unavailable', updatedAt: null, url: null };
  }

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    stale: false,
    worker: { ok: true },
    repository: {
      ok: true,
      owner: env.GITHUB_OWNER,
      name: env.GITHUB_REPO,
      branch: env.GITHUB_BRANCH,
      headSha,
      commitUrl: commitUrl(env, headSha),
    },
    deployment,
  };
}

function publicStatusFailure(env) {
  return {
    ok: false,
    checkedAt: new Date().toISOString(),
    stale: false,
    worker: { ok: true },
    repository: {
      ok: false,
      owner: env.GITHUB_OWNER,
      name: env.GITHUB_REPO,
      branch: env.GITHUB_BRANCH,
      headSha: null,
      commitUrl: null,
    },
    deployment: { status: 'unavailable', updatedAt: null, url: null },
  };
}

async function adminStatus(request, env) {
  const session = await requireReadSession(request, env);
  const token = await decryptSecret(session.tokenCipher, env.SESSION_SECRET);
  let headSha = '';
  let repositoryOk = true;
  try {
    headSha = await getBranchHead(token, env);
  } catch {
    repositoryOk = false;
  }
  let deployment = { status: repositoryOk ? 'unknown' : 'unavailable', githubStatus: '', conclusion: null, updatedAt: null, url: null };
  if (repositoryOk) {
    try {
      const runs = await githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/deploy.yml/runs`, token, {
        query: { branch: env.GITHUB_BRANCH, per_page: '1' },
      });
      const run = Array.isArray(runs?.workflow_runs) ? runs.workflow_runs[0] : null;
      if (run) deployment = {
        status: normalizeDeploymentStatus(run.status, run.conclusion),
        githubStatus: String(run.status || ''),
        conclusion: run.conclusion ? String(run.conclusion) : null,
        updatedAt: typeof run.updated_at === 'string' ? run.updated_at : null,
        url: typeof run.html_url === 'string' ? run.html_url : null,
      };
    } catch {
      deployment = { status: 'unavailable', githubStatus: '', conclusion: null, updatedAt: null, url: null };
    }
  }

  return cors(json({
    ok: true,
    checkedAt: new Date().toISOString(),
    login: session.login,
    repository: {
      ok: repositoryOk,
      owner: env.GITHUB_OWNER,
      name: env.GITHUB_REPO,
      branch: env.GITHUB_BRANCH,
      headSha: headSha || null,
      commitUrl: headSha ? commitUrl(env, headSha) : null,
    },
    deployment,
  }), env, request);
}

async function syncPost(request, env) {
  requireWriteTarget(env);
  const session = await requireAdminSession(request, env);
  const payload = await readJsonBody(request, 300_000);

  const post = validatePost(payload?.post);
  const ext = post.format === 'md' ? 'md' : 'mdx';
  const parts = [post.dir1, post.dir2].filter(Boolean).map(safeSegment);
  const rawName = post.id?.split('/').pop()?.replace(/\.(md|mdx)$/i, '') || post.title;
  const name = safeSegment(rawName);
  const filePath = `src/content/blog/${[...parts, `${name}.${ext}`].join('/')}`;
  const previousPath = post.publishedPath ? safePublishedPath(post.publishedPath) : null;
  const content = draftMarkdown(post);
  const token = await decryptSecret(session.tokenCipher, env.SESSION_SECRET);
  const headSha = await getBranchHead(token, env);
  const existing = await getRepositoryFile(filePath, token, env, headSha);
  if (existing && previousPath !== filePath) throw new HttpError(409, '目标路径已存在其他文章，请修改目录或文件名');
  if (previousPath === filePath && !existing) throw new HttpError(409, '原文章已不存在，请刷新管理台后重新绑定');
  if (previousPath && previousPath !== filePath) {
    const previous = await getRepositoryFile(previousPath, token, env, headSha);
    if (!previous) throw new HttpError(409, '原文章已不存在，请刷新管理台后重新绑定');
  }

  const result = await commitArticleChanges({
    token,
    env,
    message: `更新文章：${post.title}`,
    additions: [{ path: filePath, content }],
    deletions: previousPath && previousPath !== filePath ? [previousPath] : [],
    headSha,
  });

  return cors(json({ ok: true, commitSha: result.sha, commitUrl: commitUrl(env, result.sha), path: filePath }), env, request);
}

async function deletePost(request, env) {
  requireWriteTarget(env);
  const session = await requireAdminSession(request, env);
  const payload = await readJsonBody(request, 20_000);
  const publishedPath = safePublishedPath(payload?.publishedPath);
  const title = typeof payload?.title === 'string' && payload.title.trim() ? payload.title.trim().slice(0, 200) : publishedPath.split('/').pop();
  const token = await decryptSecret(session.tokenCipher, env.SESSION_SECRET);
  const headSha = await getBranchHead(token, env);
  const existing = await getRepositoryFile(publishedPath, token, env, headSha);
  if (!existing) throw new HttpError(404, '正式文章不存在，可能已经被删除');

  const result = await commitArticleChanges({
    token,
    env,
    message: `删除文章：${title}`,
    additions: [],
    deletions: [publishedPath],
    headSha,
  });
  return cors(json({ ok: true, commitSha: result.sha, commitUrl: commitUrl(env, result.sha), path: publishedPath }), env, request);
}

async function readSession(request, env) {
  const id = getCookie(request.headers, 'blog_session');
  if (!id) return null;
  const raw = await env.SESSIONS.get(`${SESSION_PREFIX}${id}`);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    return typeof session?.login === 'string' && typeof session?.csrfToken === 'string' && typeof session?.tokenCipher === 'string' ? session : null;
  } catch { return null; }
}

async function githubFetch(path, token, options = {}) {
  const requestUrl = new URL(API + path);
  if (options.ref) requestUrl.searchParams.set('ref', options.ref);
  if (options.query) for (const [key, value] of Object.entries(options.query)) requestUrl.searchParams.set(key, String(value));
  const { ref: _ref, query: _query, ...requestOptions } = options;
  let response;
  try {
    response = await fetch(requestUrl, {
      ...requestOptions,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'blog-test2-admin-api',
        ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...(requestOptions.headers || {}),
      },
      body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new HttpError(504, 'GitHub API 请求超时，请稍后重试');
    throw error;
  }
  if (response.status === 404) return null;
  if (response.status === 409 || response.status === 422) throw new HttpError(409, '仓库内容已发生变化，请刷新管理台后重试');
  if (!response.ok) throw new Error(`GitHub API failed (${response.status})`);
  return response.json();
}

async function githubPublicFetch(path, options = {}) {
  const requestUrl = new URL(API + path);
  if (options.query) for (const [key, value] of Object.entries(options.query)) requestUrl.searchParams.set(key, String(value));
  let response;
  try {
    response = await fetch(requestUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'blog-test2-public-status',
      },
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new HttpError(504, 'GitHub API request timed out');
    throw error;
  }
  if (!response.ok) throw new Error(`GitHub public API failed (${response.status})`);
  return response.json();
}

async function requireAdminSession(request, env) {
  requireOrigin(request, env);
  const session = await readSession(request, env);
  if (!session || session.login !== env.GITHUB_OWNER) throw new HttpError(401, '请先使用授权账号登录 GitHub');
  const csrfToken = request.headers.get('X-CSRF-Token') || '';
  if (csrfToken !== session.csrfToken) throw new HttpError(403, 'CSRF 校验失败');
  return session;
}

async function requireReadSession(request, env) {
  requireOrigin(request, env);
  const session = await readSession(request, env);
  if (!session || session.login !== env.GITHUB_OWNER) throw new HttpError(401, '请先使用授权账号登录 GitHub');
  return session;
}

async function getBranchHead(token, env) {
  const head = await githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`, token);
  const headSha = head?.object?.sha;
  if (!headSha) throw new Error('GitHub ref response missing SHA');
  return headSha;
}

async function getRepositoryFile(path, token, env, ref) {
  return githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodePath(path)}`, token, { ref });
}

async function commitArticleChanges({ token, env, message, additions, deletions, headSha }) {
  const parent = await githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits/${headSha}`, token);
  const baseTree = parent?.tree?.sha;
  if (!baseTree) throw new Error('GitHub commit response missing tree SHA');

  const tree = [];
  for (const addition of additions) {
    const blob = await githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/blobs`, token, {
      method: 'POST',
      body: { content: toBase64(addition.content), encoding: 'base64' },
    });
    if (!blob?.sha) throw new Error('GitHub blob response missing SHA');
    tree.push({ path: addition.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  for (const path of deletions) tree.push({ path, mode: '100644', type: 'blob', sha: null });

  const nextTree = await githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/trees`, token, {
    method: 'POST',
    body: { base_tree: baseTree, tree },
  });
  const commit = await githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits`, token, {
    method: 'POST',
    body: { message, tree: nextTree?.sha, parents: [headSha] },
  });
  if (!commit?.sha) throw new Error('GitHub commit response missing SHA');
  await githubFetch(`/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/refs/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`, token, {
    method: 'PATCH',
    body: { sha: commit.sha, force: false },
  });
  return commit;
}

function validatePost(post) {
  if (!post || typeof post !== 'object') throw new HttpError(400, '文章数据无效');
  for (const key of ['title', 'description', 'pubDate', 'body']) {
    const max = key === 'body' ? 200_000 : 2_000;
    if (typeof post[key] !== 'string' || !post[key].trim() || post[key].length > max) throw new HttpError(400, `字段无效：${key}`);
  }
  for (const key of ['dir1', 'dir2', 'updatedDate', 'id', 'publishedPath']) {
    if (post[key] !== undefined && typeof post[key] !== 'string') throw new HttpError(400, `字段无效：${key}`);
  }
  for (const key of ['pubDate', 'updatedDate']) {
    if (post[key] !== undefined && !isIsoDate(post[key])) throw new HttpError(400, `日期无效：${key}`);
  }
  if (!['md', 'mdx'].includes(post.format)) throw new HttpError(400, '文章格式无效');
  if (post.id?.length > 500 || post.dir1?.length > 200 || post.dir2?.length > 200 || post.publishedPath?.length > 500) throw new HttpError(400, '目录或路径过长');
  if (post.tags !== undefined && (!Array.isArray(post.tags) || post.tags.some((x) => typeof x !== 'string' || !x.trim() || x.length > 100) || post.tags.length > 50)) throw new HttpError(400, '标签数据无效');
  const tags = post.tags ?? [];
  return { ...post, tags };
}

function draftMarkdown(post) {
  return `---\ntitle: ${JSON.stringify(post.title)}\ndescription: ${JSON.stringify(post.description)}\npubDate: ${post.pubDate}\n${post.updatedDate ? `updatedDate: ${post.updatedDate}\n` : ''}${post.dir1 ? `dir1: ${JSON.stringify(post.dir1)}\n` : ''}${post.dir2 ? `dir2: ${JSON.stringify(post.dir2)}\n` : ''}tags: [${post.tags.map((x) => JSON.stringify(x)).join(', ')}]\n---\n\n${post.body.trim()}\n`;
}

function safeSegment(value) {
  const result = String(value || '').trim().replace(/[^\p{L}\p{N}._-]/gu, '-');
  if (!result || result === '.' || result === '..') throw new HttpError(400, '路径无效');
  return result;
}

function safePublishedPath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  const parts = normalized.split('/');
  if (!normalized.startsWith('src/content/blog/') || parts.some((part) => !part || part === '.' || part === '..') || !/\.(?:md|mdx)$/i.test(normalized)) throw new HttpError(400, '旧文章路径无效');
  return normalized;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

async function readJsonBody(request, maxBytes) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new HttpError(413, '请求体过大');
  if (!request.body) throw new HttpError(400, '请求体不是有效 JSON');

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, '请求体过大');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, '请求体不是有效 JSON');
  }
}

function requireEnv(env, keys) {
  for (const key of keys) if (!env[key] || env[key].includes('YOUR_')) throw new Error(`服务端缺少配置：${key}`);
}

function requireWriteTarget(env) {
  if (env.GITHUB_OWNER !== EXPECTED_GITHUB_OWNER
    || env.GITHUB_REPO !== EXPECTED_GITHUB_REPO
    || env.GITHUB_BRANCH !== EXPECTED_GITHUB_BRANCH) {
    throw new HttpError(503, 'Worker 目标仓库配置不匹配，已拒绝写入');
  }
}

async function encryptionKey(secret, usages) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, usages);
}

async function encryptSecret(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await encryptionKey(secret, ['encrypt']);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(value)));
  return `${bytesToBase64Url(iv)}.${bytesToBase64Url(encrypted)}`;
}

async function decryptSecret(value, secret) {
  try {
    const [ivPart, encryptedPart] = String(value || '').split('.');
    if (!ivPart || !encryptedPart) throw new Error('Invalid cipher');
    const key = await encryptionKey(secret, ['decrypt']);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64UrlToBytes(ivPart) }, key, base64UrlToBytes(encryptedPart));
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new HttpError(401, '会话已失效，请重新授权');
  }
}

function getCookie(headers, name) {
  const raw = headers?.get('Cookie') || '';
  return raw.split(';').map((x) => x.trim()).find((x) => x.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}

function cookie(name, value, maxAge, options = {}) {
  return `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=${options.sameSite || 'Lax'}; Secure${options.httpOnly ? '; HttpOnly' : ''}`;
}

function clearCookie(name) { return `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure; HttpOnly`; }
function normalizeDeploymentStatus(status, conclusion) {
  if (status !== 'completed') return 'pending';
  return conclusion === 'success' ? 'success' : 'failure';
}
function oauthError(message, status) { const response = new Response(message, { status, headers: { 'Cache-Control': 'no-store' } }); response.headers.append('Set-Cookie', clearCookie('oauth_state')); return response; }
function adminReturnUrl(env) { return new URL(DEFAULT_ADMIN_PATH, env.ALLOWED_ORIGIN).href; }
function isAllowedOrigin(request, env) { return request.headers.get('Origin') === env.ALLOWED_ORIGIN; }
function requireOrigin(request, env) { if (!isAllowedOrigin(request, env)) throw new HttpError(403, '请求来源不被允许'); }

function cors(response, env, request) {
  const headers = new Headers(response.headers);
  headers.set('Vary', 'Origin');
  if (isAllowedOrigin(request || new Request('https://invalid.local'), env)) headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  return new Response(response.body, { status: response.status, headers });
}

function json(value, status = 200) { return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }); }
function encodePath(value) { return encodeURIComponent(value).replaceAll('%2F', '/'); }
function commitUrl(env, sha) { return `https://github.com/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/commit/${encodeURIComponent(sha)}`; }
function toBase64(value) { const bytes = new TextEncoder().encode(value); let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary); }
function bytesToBase64Url(bytes) { let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function base64UrlToBytes(value) { const normalized = value.replace(/-/g, '+').replace(/_/g, '/'); const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')); return Uint8Array.from(binary, (char) => char.charCodeAt(0)); }

export { adminReturnUrl, decryptSecret, encryptSecret, isAllowedOrigin, readJsonBody, safePublishedPath, validatePost };
