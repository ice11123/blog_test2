import {
  classifyGitHubStatusFailure,
  requestStatusJson,
  shouldRefreshFromGitHub,
  waitForStatusResult,
  type StatusRequestResult,
} from '../lib/publicStatusRequest';

const REQUEST_TIMEOUT_MS = 15_000;
const WORKER_TIMEOUT_MS = 4_500;
const WORKER_INITIAL_ATTEMPTS = 1;
const WORKER_MANUAL_ATTEMPTS = 3;
const PUBLIC_STATUS_HEDGE_DELAY_MS = 900;
const GITHUB_API = 'https://api.github.com';
const REPOSITORY = 'ice11123/blog_test2';
const BRANCH = 'main';

let cleanupCurrentPublicStatus: (() => void) | undefined;

function initPublicStatus(): void {
  const root = document.querySelector<HTMLElement>('[data-public-status]');
  if (!root || root.dataset.bound === 'true') return;
  cleanupCurrentPublicStatus?.();
  root.dataset.bound = 'true';
  const endpoint = (root.dataset.statusEndpoint || '').replace(/\/$/, '');
  const controller = new AbortController();

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

  ['frontend', 'worker', 'repository', 'deployment'].forEach((key) => {
    setCard(key, 'waiting', '等待按需检测', '滚动到运行状态区域或点击刷新开始检测');
  });

  const formatTime = (value?: string | null) => {
    if (!value) return '暂无更新时间';
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? '暂无更新时间' : date.toLocaleString('zh-CN', { hour12: false });
  };

  const refreshFromGitHub = async (): Promise<boolean> => {
    const [refResult, runsResult] = await Promise.all([
      requestStatusJson(`${GITHUB_API}/repos/${REPOSITORY}/git/ref/heads/${BRANCH}`, {
        attempts: 1,
        timeoutMs: REQUEST_TIMEOUT_MS,
        signal: controller.signal,
      }),
      requestStatusJson(`${GITHUB_API}/repos/${REPOSITORY}/actions/workflows/deploy.yml/runs?branch=${BRANCH}&per_page=1`, {
        attempts: 1,
        timeoutMs: REQUEST_TIMEOUT_MS,
        signal: controller.signal,
      }),
    ]);

    const renderGitHubFailure = (card: 'repository' | 'deployment', result: StatusRequestResult) => {
      const failure = classifyGitHubStatusFailure(result);
      const subject = card === 'repository' ? '仓库' : '部署记录';
      if (!failure) {
        setCard(card, 'waiting', `${subject}状态暂未确认`, 'GitHub 返回的数据暂时无法识别，可稍后手动刷新');
        return;
      }
      if (failure.kind === 'limited') {
        setCard(card, 'waiting', 'GitHub API 检测受限', `代理出口或匿名额度已限流，不代表${subject}异常`);
        return;
      }
      if (failure.kind === 'timeout' || failure.kind === 'network') {
        const reason = failure.kind === 'timeout' ? '请求超时' : '当前网络无法访问 GitHub API';
        setCard(card, 'waiting', `${subject}状态暂未确认`, `${reason}，不代表${subject}异常`);
        return;
      }
      if (failure.kind === 'upstream') {
        setCard(card, 'waiting', 'GitHub 服务暂不可用', `${subject}状态未确认，可稍后手动刷新`);
        return;
      }
      setCard(card, 'error', `${subject}配置异常`, `GitHub 返回 HTTP ${failure.status}，请检查仓库、分支或工作流配置`);
    };

    let repositoryConfirmed = false;
    if (refResult.kind === 'ok') {
      const sha = typeof refResult.body?.object?.sha === 'string' ? refResult.body.object.sha : '';
      if (sha) {
        repositoryConfirmed = true;
        setCard('repository', 'waiting', REPOSITORY, `${BRANCH} · ${sha.slice(0, 7)} · GitHub 直连降级`, `https://github.com/${REPOSITORY}/commit/${sha}`);
      } else {
        renderGitHubFailure('repository', refResult);
      }
    } else {
      renderGitHubFailure('repository', refResult);
    }

    let deploymentConfirmed = false;
    if (runsResult.kind === 'ok') {
      const run = Array.isArray(runsResult.body?.workflow_runs) ? runsResult.body.workflow_runs[0] : null;
      if (!run) {
        deploymentConfirmed = true;
        setCard('deployment', 'waiting', '暂无部署记录', 'GitHub 直连降级');
      } else {
        deploymentConfirmed = true;
        const status = run.status !== 'completed' ? 'pending' : run.conclusion === 'success' ? 'success' : 'failure';
        if (status === 'success') setCard('deployment', 'waiting', '最近部署成功', `${formatTime(run.updated_at)} · GitHub 直连降级`, run.html_url || '');
        else if (status === 'pending') setCard('deployment', 'waiting', '正在构建或排队', `${formatTime(run.updated_at)} · GitHub 直连降级`, run.html_url || '');
        else setCard('deployment', 'error', '最近部署失败', formatTime(run.updated_at), run.html_url || '');
      }
    } else {
      renderGitHubFailure('deployment', runsResult);
    }

    return repositoryConfirmed || deploymentConfirmed;
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

  const refreshRepositoryStatus = async (workerAttempts: number) => {
    const publicRequest = requestStatusJson(`${endpoint}/api/public-status`, {
      attempts: workerAttempts,
      timeoutMs: WORKER_TIMEOUT_MS,
      signal: controller.signal,
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

  const refresh = async (manual: boolean) => {
    const workerAttempts = manual ? WORKER_MANUAL_ATTEMPTS : WORKER_INITIAL_ATTEMPTS;
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
      attempts: workerAttempts,
      timeoutMs: WORKER_TIMEOUT_MS,
      signal: controller.signal,
    }).then(setWorkerStatus);
    await Promise.all([healthTask, refreshRepositoryStatus(workerAttempts)]);
  };

  const refreshButton = root.closest<HTMLElement>('.status-block')
    ?.querySelector<HTMLButtonElement>('[data-public-status-refresh]');
  const refreshLabel = refreshButton?.querySelector<HTMLElement>('[data-public-status-refresh-label]');
  let refreshInFlight: Promise<void> | null = null;
  const runRefresh = (manual = false) => {
    if (refreshInFlight) return refreshInFlight;
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.dataset.loading = 'true';
      refreshButton.setAttribute('aria-busy', 'true');
    }
    if (refreshLabel) refreshLabel.textContent = '检测中';
    refreshInFlight = refresh(manual).finally(() => {
      refreshInFlight = null;
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.removeAttribute('data-loading');
        refreshButton.removeAttribute('aria-busy');
      }
      if (refreshLabel) refreshLabel.textContent = '刷新';
    });
    return refreshInFlight;
  };

  const handleRefreshClick = () => { void runRefresh(true); };
  refreshButton?.addEventListener('click', handleRefreshClick);

  let observer: IntersectionObserver | undefined;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer?.disconnect();
      observer = undefined;
      void runRefresh(false);
    }, { threshold: 0.1 });
    observer.observe(root);
  } else {
    void runRefresh(false);
  }

  cleanupCurrentPublicStatus = () => {
    observer?.disconnect();
    controller.abort();
    refreshButton?.removeEventListener('click', handleRefreshClick);
  };
}

document.addEventListener('DOMContentLoaded', initPublicStatus);
document.addEventListener('astro:page-load', initPublicStatus);
document.addEventListener('astro:before-swap', () => {
  cleanupCurrentPublicStatus?.();
  cleanupCurrentPublicStatus = undefined;
});
