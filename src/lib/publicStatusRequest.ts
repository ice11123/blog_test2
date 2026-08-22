export interface StatusRequestOptions {
  attempts?: number;
  timeoutMs?: number;
  retryDelaysMs?: number[];
  fetchImpl?: typeof fetch;
}

export type StatusRequestResult =
  | { kind: 'ok'; status: number; body: any; attempts: number }
  | { kind: 'http-error'; status: number; body: any; attempts: number }
  | { kind: 'network-error'; reason: 'timeout' | 'network'; attempts: number };

export type StatusWaitResult =
  | { kind: 'resolved'; result: StatusRequestResult }
  | { kind: 'slow' };

export type GitHubStatusFailure =
  | { kind: 'limited'; severity: 'waiting'; status: number }
  | { kind: 'timeout'; severity: 'waiting' }
  | { kind: 'network'; severity: 'waiting' }
  | { kind: 'upstream'; severity: 'waiting'; status: number }
  | { kind: 'configuration'; severity: 'error'; status: number };

const DEFAULT_RETRY_DELAYS_MS = [450, 1_100];

export function shouldRefreshFromGitHub(result: StatusRequestResult): boolean {
  return result.kind !== 'ok' || result.body?.ok !== true || result.body?.stale === true;
}

export function classifyGitHubStatusFailure(result: StatusRequestResult): GitHubStatusFailure | null {
  if (result.kind === 'ok') return null;
  if (result.kind === 'network-error') return { kind: result.reason, severity: 'waiting' };

  const message = typeof result.body?.message === 'string' ? result.body.message : '';
  if (result.status === 429 || (result.status === 403 && /rate limit|abuse/i.test(message))) {
    return { kind: 'limited', severity: 'waiting', status: result.status };
  }
  if (result.status >= 500) return { kind: 'upstream', severity: 'waiting', status: result.status };
  return { kind: 'configuration', severity: 'error', status: result.status };
}

export function waitForStatusResult(
  request: Promise<StatusRequestResult>,
  delayMs: number,
): Promise<StatusWaitResult> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      resolve({ kind: 'slow' });
    }, Math.max(0, delayMs));

    request.then((result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ kind: 'resolved', result });
    });
  });
}

export async function requestStatusJson(url: string, options: StatusRequestOptions = {}): Promise<StatusRequestResult> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const timeoutMs = Math.max(100, options.timeoutMs ?? 4_500);
  const retryDelaysMs = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  let lastHttp: Extract<StatusRequestResult, { kind: 'http-error' }> | null = null;
  let lastNetworkReason: 'timeout' | 'network' = 'network';

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok || body?.stale === true) return { kind: 'ok', status: response.status, body, attempts: attempt };

      lastHttp = { kind: 'http-error', status: response.status, body, attempts: attempt };
      if (response.status < 500 || attempt === attempts) return lastHttp;
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      lastNetworkReason = name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network';
      if (attempt === attempts) return { kind: 'network-error', reason: lastNetworkReason, attempts: attempt };
    }

    const delayMs = retryDelaysMs[Math.min(attempt - 1, retryDelaysMs.length - 1)] ?? 0;
    if (delayMs > 0) await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return lastHttp ?? { kind: 'network-error', reason: lastNetworkReason, attempts };
}
