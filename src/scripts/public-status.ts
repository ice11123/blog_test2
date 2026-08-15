import {
  requestStatusJson,
  shouldRefreshFromGitHub,
  waitForStatusResult,
  type StatusRequestResult,
} from '../lib/publicStatusRequest';

const REQUEST_TIMEOUT_MS = 15_000;
const WORKER_TIMEOUT_MS = 4_500;
const WORKER_ATTEMPTS = 3;
const PUBLIC_STATUS_HEDGE_DELAY_MS = 900;
const GITHUB_API = 'https://api.github.com';
const REPOSITORY = 'ice11123/blog_test2';
const BRANCH = 'main';

function initPublicStatus(): void {
  const root = document.querySelector<HTMLElement>('[data-public-status]');
  if (!root || root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';
  const endpoint = (root.dataset.statusEndpoint || '').replace(/\/$/, '');

  const setCard = (name: string, state: string, value: string, detail = '', link = '') => {
    const card = root.querySelector<HTMLElement>(`[data-public-card="${name}"]`);
    if (!card) return;
    card.dataset.state = state;
    const labels: Record<string, string> = { ok: '正常', error: '异常', waiting: '等待', checking: '检测中' };
    const stateNode = card.querySelector<HTMLElement>('[data-card-state]');
    const valueNode = card.querySelector<HTMLElement>('[data-card-value]');
    const detailNode = card.querySelector<HTMLElement>('[data-card-detail]');
    const anchor = card.querySelector<HTMLAnchorElement>('[data-card-link]');
    if (stateNode) stateNode.textContent = labels[state] || state;
    if (valueNode) valueNode.textContent = value;
    if (detailNode) detailNode.textContent = detail;
    if (anchor) {
      if (link) { anchor.href = link; anchor.hidden = false; }
      else { anchor.removeAttribute('href'); anchor.hidden = true; }
    }
  };

  const formatTime = (value?: string | null) => {
    if (!value) return '暂无更新时间';
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? '暂无更新时间' : date.toLocaleString('zh-CN', { hour12: false });
  };

  const refreshFromGitHub = async (): Promise<boolean> => {
    try {
      const [refResponse, runsResponse] = await Promise.all([
        fetch(`${GITHUB_API}/repos/${REPOSITORY}/git/ref/heads/${BRANCH}`, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }),
        fetch(`${GITHUB_API}/repos/${REPOSITORY}/actions/workflows/deploy.yml/runs?branch=${BRANCH}&per_page=1`, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }),
      ]);
      if (!refResponse.ok) throw new Error('repository status failed');
      const ref = await refResponse.json();
      const sha = typeof ref?.object?.sha === 'string' ? ref.object.sha : '';
      if (!sha) throw new Error('repository SHA missing');
      setCard('repository', 'waiting', REPOSITORY, `${BRANCH} · ${sha.slice(0, 7)} · GitHub 直连降级`, `https://github.com/${REPOSITORY}/commit/${sha}`);

      if (!runsResponse.ok) {
        setCard('deployment', 'waiting', 'Worker 不可用，部署状态待刷新', '仓库 HEAD 已通过 GitHub 直连读取');
        return true;
      }
      const runs = await runsResponse.json();
      const run = Array.isArray(runs?.workflow_runs) ? runs.workflow_runs[0] : null;
      if (!run) {
        setCard('deployment', 'waiting', '暂无部署记录', 'GitHub 直连降级');
        return true;
      }
      const status = run.status !== 'completed' ? 'pending' : run.conclusion === 'success' ? 'success' : 'failure';
      if (status === 'success') setCard('deployment', 'waiting', '最近部署成功', `${formatTime(run.updated_at)} · GitHub 直连降级`, run.html_url || '');
      else if (status === 'pending') setCard('deployment', 'waiting', '正在构建或排队', `${formatTime(run.updated_at)} · GitHub 直连降级`, run.html_url || '');
      else setCard('deployment', 'error', '最近部署失败', formatTime(run.updated_at), run.html_url || '');
      return true;
    } catch {
      setCard('repository', 'error', '仓库状态不可用', 'Worker 与 GitHub 公共 API 均无法连接');
      setCard('deployment', 'error', '部署状态不可用', 'Worker 与 GitHub 公共 API 均无法连接');
      return false;
    }
  };

  const setWorkerStatus = (result: StatusRequestResult) => {
    if (result.kind === 'ok' && result.body?.ok === true) {
      setCard('worker', 'ok', 'Worker 与 KV 正常', `检测于 ${formatTime(result.body.checkedAt)} · 尝试 ${result.attempts} 次`);
      return;
    }
    if (result.kind === 'network-error') {
      const reason = result.reason === 'timeout' ? 'DNS 或网络连接超时' : '当前网络无法访问 Worker 域名';
      setCard('worker', 'waiting', '当前网络无法直连 Worker', `${reason}，服务状态未确认`);
      return;
    }
    if (result.kind === 'http-error') {
      setCard('worker', 'error', `Worker 返回 HTTP ${result.status}`, '服务、KV 或跨域配置异常');
    } else {
      setCard('worker', 'error', 'Worker 状态异常', '未收到可识别的健康检查结果');
    }
  };

  const renderRepositoryStatus = (result: StatusRequestResult) => {
    if (result.kind !== 'ok' || result.body?.ok !== true) return false;
    const body = result.body;
    const stale = body.stale === true;
    if (body.repository?.ok) {
      const sha = String(body.repository.headSha || '').slice(0, 7);
      setCard('repository', stale ? 'waiting' : 'ok', `${body.repository.owner}/${body.repository.name}`, `${body.repository.branch} · ${sha}${stale ? ' · 数据暂未刷新' : ''}`, body.repository.commitUrl || '');
    } else {
      setCard('repository', 'error', '仓库连接失败', '无法读取 main 分支');
    }
    const deployment = body.deployment || {};
    if (deployment.status === 'success') setCard('deployment', stale ? 'waiting' : 'ok', '最近部署成功', formatTime(deployment.updatedAt), deployment.url || '');
    else if (deployment.status === 'pending') setCard('deployment', 'waiting', '正在构建或排队', formatTime(deployment.updatedAt), deployment.url || '');
    else if (deployment.status === 'unknown') setCard('deployment', 'waiting', '暂无部署记录', formatTime(deployment.updatedAt));
    else setCard('deployment', 'error', '最近部署失败', formatTime(deployment.updatedAt), deployment.url || '');
    return true;
  };

  const refreshRepositoryStatus = async () => {
    const publicRequest = requestStatusJson(`${endpoint}/api/public-status`, {
      attempts: WORKER_ATTEMPTS,
      timeoutMs: WORKER_TIMEOUT_MS,
    });
    const earlyResult = await waitForStatusResult(publicRequest, PUBLIC_STATUS_HEDGE_DELAY_MS);

    if (earlyResult.kind === 'resolved') {
      const rendered = renderRepositoryStatus(earlyResult.result);
      if (!shouldRefreshFromGitHub(earlyResult.result)) return;
      if (!rendered) {
        setCard('repository', 'checking', '正在尝试 GitHub 直连', 'Worker 状态不可用，启用公共只读降级');
        setCard('deployment', 'checking', '正在尝试 GitHub 直连', 'Worker 状态不可用，启用公共只读降级');
      }
      await refreshFromGitHub();
      return;
    }

    setCard('repository', 'checking', '正在尝试 GitHub 直连', 'Worker 响应较慢，提前启用公共只读降级');
    setCard('deployment', 'checking', '正在尝试 GitHub 直连', 'Worker 响应较慢，提前启用公共只读降级');
    const githubOk = await refreshFromGitHub();
    if (githubOk) return;

    // GitHub 直连也失败时，仍等待 Worker 的最终结果，避免丢失可用缓存。
    renderRepositoryStatus(await publicRequest);
  };

  const refresh = async () => {
    setCard('frontend', 'ok', '首页脚本已初始化', '公开状态模块工作正常');
    if (!endpoint) {
      setCard('worker', 'waiting', '实验版未接入发布服务', 'blog_test2 暂不部署 Worker');
      setCard('repository', 'checking', '正在尝试 GitHub 直连', 'Worker 未配置，启用公共只读降级');
      setCard('deployment', 'checking', '正在尝试 GitHub 直连', 'Worker 未配置，启用公共只读降级');
      await refreshFromGitHub();
      return;
    }
    ['worker', 'repository', 'deployment'].forEach((key) => setCard(key, 'checking', '正在检测', '请稍候'));
    const healthTask = requestStatusJson(`${endpoint}/health`, {
      attempts: WORKER_ATTEMPTS,
      timeoutMs: WORKER_TIMEOUT_MS,
    }).then(setWorkerStatus);
    await Promise.all([healthTask, refreshRepositoryStatus()]);
  };

  const refreshButton = root.querySelector<HTMLButtonElement>('[data-public-status-refresh]');
  let refreshInFlight: Promise<void> | null = null;
  const runRefresh = () => {
    if (refreshInFlight) return refreshInFlight;
    if (refreshButton) refreshButton.disabled = true;
    refreshInFlight = refresh().finally(() => {
      refreshInFlight = null;
      if (refreshButton) refreshButton.disabled = false;
    });
    return refreshInFlight;
  };

  refreshButton?.addEventListener('click', () => { void runRefresh(); });
  void runRefresh();
}

document.addEventListener('DOMContentLoaded', initPublicStatus);
document.addEventListener('astro:page-load', initPublicStatus);
