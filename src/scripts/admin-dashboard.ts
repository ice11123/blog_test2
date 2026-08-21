// @ts-nocheck -- 管理台依赖构建时注入的数据和浏览器 DOM，所有入口均做运行时保护。
import { LocalStorageDraftStore, draftToMarkdown, slugifyAdminId } from '../lib/adminDrafts';
import { renderPreview, renderPreviewMermaid } from '../lib/adminPreview';

const ADMIN_UNLOCK_STORAGE_KEY = 'blog-test2-admin-unlocked';
const TREE_STORAGE_KEY = 'blog-test2-admin-tree-v1';
const PENDING_CLOUD_PUBLISH_KEY = 'blog-test2-pending-cloud-publish-v1';
const PENDING_CLOUD_DELETE_KEY = 'blog-test2-pending-cloud-delete-v1';
const LEGACY_ADMIN_SESSION_KEY = 'blog-test2-cloud-session-v1';
const REQUEST_TIMEOUT_MS = 15_000;

const app = document.querySelector('#admin-app');
if (!app) throw new Error('Admin app root is missing');
const CLOUD_PUBLISH_ENABLED = app.getAttribute('data-publish-enabled') === 'true';

const initialDrafts = JSON.parse(app.getAttribute('data-initial-drafts') || '[]');
const draftStore = new LocalStorageDraftStore(initialDrafts);
const editor = app.querySelector('[data-editor]');
const locked = app.querySelector('[data-locked]');
const form = app.querySelector('[data-form]');
const tree = app.querySelector('[data-post-tree]');
const treeScroll = app.querySelector('[data-tree-scroll]');
const preview = app.querySelector('[data-preview]');
const previewStatus = app.querySelector('[data-preview-status]');
const statusText = app.querySelector('[data-status]');
const count = app.querySelector('[data-count]');
const drawer = app.querySelector('[data-tree-drawer]');
const drawerBackdrop = app.querySelector('[data-tree-backdrop]');
const field = (name) => form?.querySelector(`[name="${name}"]`);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

let drafts = [];
let selectedId = '';
let previewTimer;
let editedAt = '';
let csrfToken = '';
let treeState = readTreeState();

function endpoint() {
  return (app.getAttribute('data-sync-endpoint') || '').replace(/\/$/, '');
}

function normalizePublishedPath(post) {
  if (typeof post.publishedPath !== 'string' || !post.publishedPath) return { ...post };
  const path = post.publishedPath.replaceAll('\\', '/');
  const parts = path.split('/');
  if (!path.startsWith('src/content/blog/') || parts.some((part) => !part || part === '.' || part === '..')) return { ...post, publishedPath: undefined };
  if (/\.(?:md|mdx)$/i.test(path)) return { ...post, publishedPath: path };
  if (!/^[^/]+(?:\/[^/]+)*$/.test(path.slice('src/content/blog/'.length))) return { ...post, publishedPath: undefined };
  return { ...post, publishedPath: `${path}.${post.format === 'md' ? 'md' : 'mdx'}` };
}

function readDrafts() {
  return draftStore.list().map(normalizePublishedPath);
}

function saveDraft(post) {
  draftStore.save(normalizePublishedPath(post));
}

function resetDrafts() {
  draftStore.reset();
}

function readTreeState() {
  try {
    const value = JSON.parse(localStorage.getItem(TREE_STORAGE_KEY) || '{}');
    return {
      mode: value.mode === 'tag' ? 'tag' : 'directory',
      expanded: Array.isArray(value.expanded) ? value.expanded.filter((item) => typeof item === 'string') : [],
      query: typeof value.query === 'string' ? value.query : '',
      scrollTop: Number.isFinite(value.scrollTop) ? value.scrollTop : 0,
    };
  } catch {
    return { mode: 'directory', expanded: [], query: '', scrollTop: 0 };
  }
}

function saveTreeState() {
  try { localStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(treeState)); } catch {}
}

function setStatus(text) {
  if (statusText) statusText.textContent = text;
}

function setCard(name, state, value, detail = '', link = '') {
  const card = app.querySelector(`[data-system-card="${name}"]`);
  if (!card) return;
  card.dataset.state = state;
  const stateLabel = { ok: '正常', error: '异常', waiting: '等待', checking: '检测中' }[state] || state;
  card.querySelector('[data-card-state]').textContent = stateLabel;
  card.querySelector('[data-card-value]').textContent = value;
  card.querySelector('[data-card-detail]').textContent = detail;
  const anchor = card.querySelector('[data-card-link]');
  if (anchor) {
    if (link) { anchor.href = link; anchor.hidden = false; }
    else { anchor.removeAttribute('href'); anchor.hidden = true; }
  }
}

function timeoutSignal() {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

async function checkBasicStatus() {
  setCard('frontend', 'ok', '页面脚本已初始化', '管理台交互模块工作正常');
  try {
    const probe = `admin-storage-probe-${Date.now()}`;
    localStorage.setItem(probe, 'ok');
    if (localStorage.getItem(probe) !== 'ok') throw new Error('read mismatch');
    localStorage.removeItem(probe);
    setCard('storage', 'ok', `${drafts.filter((post) => !post.deleted).length} 篇可编辑文章`, '本地草稿存储可正常读写');
  } catch {
    setCard('storage', 'error', '本地存储不可用', '草稿可能无法在刷新后保留');
  }

  const api = endpoint();
  if (!api) {
    setCard('worker', 'waiting', '实验版未接入发布服务', 'blog_test2 暂不部署 Worker');
    return false;
  }
  setCard('worker', 'checking', '正在检测 Worker', '检查运行环境与 KV 连接');
  try {
    const response = await fetch(`${api}/health`, { credentials: 'include', signal: timeoutSignal() });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok !== true) throw new Error('health failed');
    setCard('worker', 'ok', 'Worker 与 KV 正常', `检测于 ${formatTime(body.checkedAt)}`);
    return true;
  } catch {
    setCard('worker', 'error', 'Worker 无法连接', '请检查部署、网络或跨域配置');
    return false;
  }
}

async function checkFullStatus() {
  const workerOk = await checkBasicStatus();
  if (!workerOk) {
    setCard('github', 'waiting', '等待 Worker 恢复', '暂不检测 GitHub 会话');
    setCard('repository', 'waiting', '实验仓库未接入发布', '目标：ice11123/blog_test2 main');
    setCard('deployment', 'waiting', '等待仓库状态', '暂未读取 Pages 部署');
    return;
  }

  const api = endpoint();
  setCard('github', 'checking', '正在检查授权', '验证 HttpOnly 会话');
  setCard('repository', 'checking', '正在读取实验仓库', '目标：ice11123/blog_test2 main');
  setCard('deployment', 'checking', '正在读取部署', '检查最近一次 Pages Actions');
  try {
    const me = await fetch(`${api}/auth/me`, { credentials: 'include', signal: timeoutSignal() });
    if (me.status === 401) {
      csrfToken = '';
      setCard('github', 'waiting', '尚未授权或会话已过期', '发布时会跳转 GitHub 授权');
      setCard('repository', 'waiting', '等待 GitHub 授权', '授权后读取 main 分支');
      setCard('deployment', 'waiting', '等待 GitHub 授权', '授权后读取 Pages 部署');
      return;
    }
    const meBody = await me.json().catch(() => ({}));
    if (!me.ok || meBody.login !== 'ice11123') throw new Error('invalid login');
    csrfToken = meBody.csrfToken || '';
    setCard('github', 'ok', `已授权 ${meBody.login}`, 'HttpOnly 会话有效');

    const response = await fetch(`${api}/api/status`, { credentials: 'include', signal: timeoutSignal() });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok !== true) throw new Error('status failed');
    if (!body.repository?.ok) {
      setCard('repository', 'error', '仓库连接失败', '无法读取 main 分支');
      setCard('deployment', 'waiting', '等待仓库恢复', '暂不判断 Pages 部署');
      return;
    }
    const shortSha = String(body.repository.headSha || '').slice(0, 7);
    setCard('repository', 'ok', `${body.repository.owner}/${body.repository.name}`, `${body.repository.branch} · ${shortSha}`, body.repository.commitUrl || '');
    const deploymentState = body.deployment?.status;
    if (deploymentState === 'success') {
      setCard('deployment', 'ok', '最近部署成功', formatTime(body.deployment.updatedAt), body.deployment.url || '');
    } else if (deploymentState === 'failure') {
      setCard('deployment', 'error', '最近部署失败', formatTime(body.deployment.updatedAt), body.deployment.url || '');
    } else {
      setCard('deployment', 'waiting', deploymentState === 'pending' ? '正在构建或排队' : '暂无部署记录', formatTime(body.deployment?.updatedAt), body.deployment?.url || '');
    }
  } catch {
    setCard('github', 'error', '授权状态异常', '会话响应不符合预期');
    setCard('repository', 'error', '仓库连接失败', '无法读取 main 分支');
    setCard('deployment', 'error', '部署状态不可用', '无法读取 Pages Actions');
  }
}

function refreshSystemStatus() {
  return isUnlocked() ? checkFullStatus() : checkBasicStatus();
}

function isUnlocked() {
  return sessionStorage.getItem(ADMIN_UNLOCK_STORAGE_KEY) === 'true';
}

function formatTime(value) {
  if (!value) return '暂无更新时间';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '暂无更新时间' : date.toLocaleString('zh-CN', { hour12: false });
}

function formatEditedAt(value) {
  return value ? `最新修改于 ${formatTime(value)}` : '尚未修改';
}

function current() {
  return drafts.find((post) => post.id === selectedId);
}

function updateIdentity(post) {
  const type = app.querySelector('[data-current-type]');
  const path = app.querySelector('[data-current-path]');
  if (!type || !path) return;
  type.textContent = post.orphaned ? '待重新绑定的草稿' : post.publishedPath ? '正在编辑正式文章' : '正在编辑本地草稿';
  path.textContent = post.publishedPath || [post.dir1 || '未分类', post.dir2, post.title].filter(Boolean).join(' / ');
}

function updateDeleteButton(post) {
  const button = app.querySelector('[data-delete]');
  if (!button) return;
  button.disabled = false;
  button.removeAttribute('title');
  if (CLOUD_PUBLISH_ENABLED) {
    button.textContent = post.publishedPath ? '删除正式文章' : '删除本地草稿';
    return;
  }
  if (!post.publishedPath) {
    button.textContent = '删除本地草稿';
    return;
  }
  if (draftStore.hasLocal(post)) {
    button.textContent = '放弃本地修改';
    return;
  }
  button.textContent = '正式文章不可删除';
  button.disabled = true;
  button.title = '云端发布未启用，且当前文章没有本地修改';
}

function loadForm() {
  const post = current();
  if (!post || !form) return;
  ['id', 'title', 'description', 'pubDate', 'dir1', 'dir2', 'body', 'format'].forEach((name) => {
    const input = field(name);
    if (input) input.value = post[name] || '';
  });
  const tags = field('tags');
  if (tags) tags.value = post.tags.join(', ');
  editedAt = post.localEditedAt || '';
  const edited = app.querySelector('[data-edited-at]');
  if (edited) edited.textContent = formatEditedAt(editedAt);
  updateIdentity(post);
  updateDeleteButton(post);
  updatePreview();
}

function updatePreview() {
  const body = field('body');
  if (!preview || !body) return;
  if (previewStatus) previewStatus.textContent = '正在更新预览…';
  try {
    preview.innerHTML = renderPreview(body.value);
    void renderPreviewMermaid(preview as HTMLElement).finally(() => {
      if (previewStatus) previewStatus.textContent = `已更新于 ${formatTime(new Date().toISOString())}`;
    });
  } catch {
    preview.innerHTML = '<p class="preview-render-error">预览暂时无法生成，请检查正文格式。</p>';
    if (previewStatus) previewStatus.textContent = '预览失败';
  }
}

function queuePreviewUpdate() {
  editedAt = new Date().toISOString();
  const edited = app.querySelector('[data-edited-at]');
  if (edited) edited.textContent = formatEditedAt(editedAt);
  setStatus('有未保存修改');
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 800);
}

function collect() {
  return {
    ...current(),
    id: field('id')?.value || selectedId,
    title: field('title')?.value || '',
    description: field('description')?.value || '',
    pubDate: field('pubDate')?.value || '',
    dir1: field('dir1')?.value || '',
    dir2: field('dir2')?.value || '',
    tags: (field('tags')?.value || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    body: field('body')?.value || '',
    format: field('format')?.value || 'mdx',
    localEditedAt: editedAt,
  };
}

function sortedPosts(posts) {
  return [...posts].sort((a, b) => String(b.pubDate).localeCompare(String(a.pubDate)) || String(a.title).localeCompare(String(b.title), 'zh-CN'));
}

function articleMatches(post, query) {
  if (!query) return true;
  return `${post.title} ${post.tags.join(' ')} ${post.dir1} ${post.dir2}`.toLowerCase().includes(query.toLowerCase());
}

function articleButton(post) {
  const badges = [];
  if (post.orphaned) badges.push('<span class="admin-tree-badge danger">待重新绑定</span>');
  else if (!post.publishedPath) badges.push('<span class="admin-tree-badge">本地草稿</span>');
  if (post.id === selectedId) badges.push('<span class="admin-tree-badge active">正在编辑</span>');
  return `<li class="admin-article-item"><button type="button" class="admin-article-button ${post.id === selectedId ? 'current' : ''}" data-post-id="${escapeHtml(post.id)}"><span class="admin-article-title">${escapeHtml(post.title || '未命名文章')}</span><span class="admin-article-badges">${badges.join('')}</span></button></li>`;
}

function node(key, label, posts, children = null) {
  const matches = posts.some((post) => articleMatches(post, treeState.query));
  if (!matches) return '';
  const forced = Boolean(treeState.query) || posts.some((post) => post.id === selectedId);
  const expanded = forced || treeState.expanded.includes(key);
  const content = children === null
    ? sortedPosts(posts).filter((post) => articleMatches(post, treeState.query)).map(articleButton).join('')
    : children;
  return `<li class="admin-tree-node ${posts.some((post) => post.id === selectedId) ? 'has-current' : ''}"><button type="button" class="admin-node-header ${expanded ? 'expanded' : ''}" data-node-key="${escapeHtml(key)}" aria-expanded="${expanded}"><span class="admin-node-arrow"></span><span class="admin-node-label">${escapeHtml(label)}</span><span class="admin-node-count">${posts.length}</span></button><ul class="admin-node-children ${expanded ? '' : 'collapsed'} ${posts.some((post) => post.id === selectedId) ? 'active-path' : ''}">${content}</ul></li>`;
}

function renderDirectoryTree(posts) {
  const orphaned = posts.filter((post) => post.orphaned);
  const regular = posts.filter((post) => !post.orphaned);
  const groups = new Map();
  for (const post of regular) {
    const dir1 = post.dir1 || '未分类';
    const dir2 = post.dir2 || '';
    if (!groups.has(dir1)) groups.set(dir1, new Map());
    if (!groups.get(dir1).has(dir2)) groups.get(dir1).set(dir2, []);
    groups.get(dir1).get(dir2).push(post);
  }
  const output = [];
  if (orphaned.length) output.push(node('dir:orphaned', '待重新绑定', orphaned));
  for (const dir1 of [...groups.keys()].sort((a, b) => a.localeCompare(b, 'zh-CN'))) {
    const dir2Map = groups.get(dir1);
    const all = [...dir2Map.values()].flat();
    const children = [...dir2Map.keys()].sort((a, b) => a.localeCompare(b, 'zh-CN')).map((dir2) => {
      const articles = dir2Map.get(dir2);
      return dir2 ? node(`dir:${dir1}/${dir2}`, dir2, articles) : sortedPosts(articles).filter((post) => articleMatches(post, treeState.query)).map(articleButton).join('');
    }).join('');
    output.push(node(`dir:${dir1}`, dir1, all, children));
  }
  return output.join('');
}

function renderTagTree(posts) {
  const groups = new Map();
  for (const post of posts) {
    const tags = post.orphaned ? ['待重新绑定'] : post.tags.length ? post.tags : ['无标签'];
    for (const tag of tags) {
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push(post);
    }
  }
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh-CN')).map(([tag, posts]) => node(`tag:${tag}`, tag, posts)).join('');
}

function renderTree() {
  if (!tree) return;
  const posts = drafts.filter((post) => !post.deleted);
  tree.innerHTML = (treeState.mode === 'tag' ? renderTagTree(posts) : renderDirectoryTree(posts)) || '<p class="admin-muted">没有匹配的文章</p>';
  app.querySelectorAll('[data-tree-mode]').forEach((button) => button.classList.toggle('active', button.dataset.treeMode === treeState.mode));
  app.querySelector('[data-tree-mode-toggle]')?.classList.toggle('tag-mode', treeState.mode === 'tag');
  const search = app.querySelector('[data-search]');
  if (search && search.value !== treeState.query) search.value = treeState.query;
  tree.querySelectorAll('[data-node-key]').forEach((button) => button.addEventListener('click', () => {
    const key = button.getAttribute('data-node-key');
    treeState.expanded = treeState.expanded.includes(key) ? treeState.expanded.filter((item) => item !== key) : [...treeState.expanded, key];
    saveTreeState();
    renderTree();
  }));
  tree.querySelectorAll('[data-post-id]').forEach((button) => button.addEventListener('click', () => {
    selectedId = button.getAttribute('data-post-id') || '';
    loadForm();
    renderTree();
    closeDrawer();
  }));
  if (count) count.textContent = `共 ${posts.length} 篇`;
  requestAnimationFrame(() => { if (treeScroll) treeScroll.scrollTop = treeState.scrollTop; });
}

function save() {
  const post = collect();
  saveDraft(post);
  drafts = readDrafts();
  selectedId = post.id;
  renderTree();
  loadForm();
  setStatus('已保存到本浏览器');
  void checkBasicStatus();
}

function authHeaders() {
  return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
}

async function publishPost(post, button) {
  if (!CLOUD_PUBLISH_ENABLED) { setStatus('视觉实验版已禁用云端发布，仅支持本地草稿与导出'); return false; }
  const api = endpoint();
  if (!api) { setStatus('尚未配置云端 API'); return false; }
  if (post.orphaned) { setStatus('该草稿对应的仓库文章已不存在，请新建文章后再发布'); return false; }
  if (button) button.disabled = true;
  setStatus('正在发布…');
  try {
    const response = await fetch(`${api}/api/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, credentials: 'include', body: JSON.stringify({ post }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.message || `HTTP ${response.status}`);
    localStorage.removeItem(PENDING_CLOUD_PUBLISH_KEY);
    if (result.path) {
      const updated = { ...post, publishedPath: result.path, repositoryPending: true, orphaned: false, localEditedAt: new Date().toISOString() };
      saveDraft(updated);
      drafts = readDrafts();
      selectedId = updated.id;
      renderTree();
      loadForm();
    }
    setStatus(result.commitUrl ? `发布成功：${result.commitUrl}` : '发布成功，等待 Actions 部署');
    await checkFullStatus();
    return true;
  } catch (error) {
    setStatus(`发布失败：${error instanceof Error ? error.message : '云端请求失败'}`);
    await checkFullStatus();
    return false;
  } finally {
    if (button) button.disabled = false;
  }
}

function removeLocalPost(id, keepTombstone = false) {
  const post = drafts.find((item) => item.id === id);
  if (keepTombstone && post) draftStore.save({ ...post, deleted: true });
  else draftStore.remove(id);
  drafts = readDrafts();
  selectedId = drafts.find((post) => !post.deleted)?.id || '';
  renderTree();
  loadForm();
}

async function deleteRemotePost(post, button) {
  if (!CLOUD_PUBLISH_ENABLED) {
    if (post.publishedPath && !draftStore.hasLocal(post)) {
      setStatus('云端发布未启用，正式文章不可删除');
      return false;
    }
    removeLocalPost(post.id);
    setStatus(post.publishedPath ? '已放弃本地修改并恢复仓库版本' : '已删除本地草稿');
    await checkBasicStatus();
    return true;
  }
  const api = endpoint();
  if (!api) {
    setStatus('尚未配置云端 API，未执行删除');
    return false;
  }
  if (!post.publishedPath) {
    removeLocalPost(post.id);
    setStatus('已删除本地草稿');
    await checkBasicStatus();
    return true;
  }
  if (button) button.disabled = true;
  try {
    const me = await fetch(`${api}/auth/me`, { credentials: 'include' });
    if (!me.ok) {
      localStorage.setItem(PENDING_CLOUD_DELETE_KEY, JSON.stringify(post));
      window.location.href = `${api}/auth/github`;
      return false;
    }
    const auth = await me.json().catch(() => ({}));
    csrfToken = auth?.csrfToken || '';
    if (!csrfToken) throw new Error('未获取到 CSRF token');
    const response = await fetch(`${api}/api/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, credentials: 'include', body: JSON.stringify({ publishedPath: post.publishedPath, title: post.title }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.message || `HTTP ${response.status}`);
    localStorage.removeItem(PENDING_CLOUD_DELETE_KEY);
    removeLocalPost(post.id, true);
    setStatus(result.commitUrl ? `正式文章已删除：${result.commitUrl}` : '正式文章已删除，等待 Actions 部署');
    await checkFullStatus();
    return true;
  } catch (error) {
    setStatus(`删除失败：${error instanceof Error ? error.message : '云端请求失败'}`);
    await checkFullStatus();
    return false;
  } finally {
    if (button) button.disabled = false;
  }
}

function openDrawer() {
  drawer?.classList.add('open');
  drawerBackdrop?.classList.add('open');
  document.body.classList.add('admin-drawer-open');
}

function closeDrawer() {
  drawer?.classList.remove('open');
  drawerBackdrop?.classList.remove('open');
  document.body.classList.remove('admin-drawer-open');
}

function bindEvents() {
  form?.addEventListener('submit', (event) => { event.preventDefault(); save(); });
  form?.addEventListener('input', queuePreviewUpdate);
  app.querySelector('[data-search]')?.addEventListener('input', (event) => {
    treeState.query = event.target.value;
    saveTreeState();
    renderTree();
  });
  app.querySelectorAll('[data-tree-mode]').forEach((button) => button.addEventListener('click', () => {
    treeState.mode = button.dataset.treeMode;
    saveTreeState();
    renderTree();
  }));
  treeScroll?.addEventListener('scroll', () => {
    treeState.scrollTop = treeScroll.scrollTop;
    saveTreeState();
  }, { passive: true });
  app.querySelector('[data-tree-open]')?.addEventListener('click', openDrawer);
  app.querySelector('[data-tree-close]')?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDrawer(); });
  app.querySelector('[data-status-refresh]')?.addEventListener('click', () => { void refreshSystemStatus(); });
  app.querySelector('[data-new]')?.addEventListener('click', () => {
    const post = { id: slugifyAdminId('未命名文章'), title: '未命名文章', description: '', pubDate: new Date().toISOString().slice(0, 10), dir1: '', dir2: '', tags: [], body: '# 新文章\n\n在这里开始写作。', format: 'mdx' };
    saveDraft(post);
    drafts = readDrafts();
    selectedId = post.id;
    renderTree();
    loadForm();
    if (window.matchMedia('(max-width: 760px)').matches) openDrawer();
  });
  app.querySelector('[data-reset]')?.addEventListener('click', () => {
    if (!confirm('将清除本浏览器中的全部草稿并恢复仓库初始内容，继续吗？')) return;
    resetDrafts();
    drafts = readDrafts();
    selectedId = drafts[0]?.id || '';
    renderTree();
    loadForm();
    setStatus('已恢复初始内容');
    void checkBasicStatus();
  });
  app.querySelector('[data-export]')?.addEventListener('click', () => {
    const post = current();
    if (!post) return;
    const blob = new Blob([draftToMarkdown(collect())], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${post.title || 'untitled'}.${post.format}`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('已导出文件');
  });
  const deleteButton = app.querySelector('[data-delete]');
  deleteButton?.addEventListener('click', () => {
    const post = current();
    if (!post) return;
    const message = !CLOUD_PUBLISH_ENABLED && post.publishedPath
      ? '确定放弃这篇文章的本地修改并恢复仓库版本吗？'
      : post.publishedPath
        ? '确定从正式网站删除这篇文章吗？'
        : '确定删除当前本地草稿吗？';
    if (!confirm(message)) return;
    void deleteRemotePost(post, deleteButton);
  });
  const cloudPublishButton = app.querySelector('[data-cloud-publish]');
  cloudPublishButton?.addEventListener('click', async () => {
    if (!CLOUD_PUBLISH_ENABLED) { setStatus('视觉实验版已禁用云端发布，仅支持本地草稿与导出'); return; }
    const api = endpoint();
    if (!api) { setStatus('尚未配置云端 API'); return; }
    const post = collect();
    if (!post.title.trim() || !post.pubDate) { setStatus('请先填写标题和发布日期'); return; }
    if (!confirm('确认通过云端提交当前文章并触发正式网站部署吗？')) return;
    try {
      const me = await fetch(`${api}/auth/me`, { credentials: 'include' });
      if (!me.ok) {
        localStorage.setItem(PENDING_CLOUD_PUBLISH_KEY, JSON.stringify(post));
        window.location.href = `${api}/auth/github`;
        return;
      }
      const auth = await me.json().catch(() => ({}));
      csrfToken = auth?.csrfToken || '';
      if (!csrfToken) throw new Error('未获取到 CSRF token');
      await publishPost(post, cloudPublishButton);
    } catch (error) {
      setStatus(`登录检查失败：${error instanceof Error ? error.message : '云端请求失败'}`);
      await checkFullStatus();
    }
  });
}

async function initializeCloudSession() {
  localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
  if (!endpoint() || !isUnlocked()) return;
  try {
    const me = await fetch(`${endpoint()}/auth/me`, { credentials: 'include' });
    if (!me.ok) return;
    const auth = await me.json().catch(() => ({}));
    csrfToken = auth?.csrfToken || '';
    if (!csrfToken) return;
    const pendingRaw = localStorage.getItem(PENDING_CLOUD_PUBLISH_KEY);
    if (pendingRaw) await publishPost(JSON.parse(pendingRaw), app.querySelector('[data-cloud-publish]'));
    const pendingDeleteRaw = localStorage.getItem(PENDING_CLOUD_DELETE_KEY);
    if (pendingDeleteRaw) await deleteRemotePost(JSON.parse(pendingDeleteRaw), app.querySelector('[data-delete]'));
  } catch (error) {
    setStatus(`恢复待发布文章失败：${error instanceof Error ? error.message : '云端请求失败'}`);
  }
}

function initialize() {
  drafts = readDrafts();
  selectedId = drafts.find((post) => !post.deleted)?.id || '';
  const search = app.querySelector('[data-search]');
  if (search) search.value = treeState.query;
  if (isUnlocked()) {
    locked?.setAttribute('hidden', '');
    editor?.removeAttribute('hidden');
  }
  bindEvents();
  renderTree();
  loadForm();
  void refreshSystemStatus();
  void initializeCloudSession();
}

initialize();
