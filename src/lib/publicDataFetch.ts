import { createRequestPool } from './requestPool.ts';

const publicDataPool = createRequestPool(3);
export const PUBLIC_DATA_TIMEOUT_MS = 12_000;
export const PUBLIC_DATA_RETRY_COUNT = 1;

export type PublicDataFailureKind = 'cancelled' | 'timeout' | 'network';

export class PublicDataRequestError extends Error {
  readonly kind: PublicDataFailureKind;

  constructor(kind: PublicDataFailureKind, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PublicDataRequestError';
    this.kind = kind;
  }
}

function requestSignal(callerSignal: AbortSignal | null | undefined, timeoutMs: number): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(Math.max(1, Math.floor(timeoutMs)));
  return callerSignal ? AbortSignal.any([callerSignal, timeoutSignal]) : timeoutSignal;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function waitForRetry(signal: AbortSignal, delayMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal.reason);
    };
    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function runWithRetry(input: RequestInfo | URL, init: RequestInit, signal: AbortSignal): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= PUBLIC_DATA_RETRY_COUNT; attempt += 1) {
    try {
      const response = await fetch(input, { ...init, signal });
      if (attempt < PUBLIC_DATA_RETRY_COUNT && isRetryableStatus(response.status)) {
        await response.body?.cancel();
        await waitForRetry(signal, 160);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (signal.aborted || attempt >= PUBLIC_DATA_RETRY_COUNT) throw error;
      await waitForRetry(signal, 160);
    }
  }
  throw lastError;
}

function classifyFailure(error: unknown, callerSignal: AbortSignal | null | undefined, request: AbortSignal): never {
  if (callerSignal?.aborted) {
    throw new PublicDataRequestError('cancelled', '公开数据请求已取消', { cause: error });
  }
  if (request.aborted) {
    throw new PublicDataRequestError('timeout', '公开数据请求超时', { cause: error });
  }
  throw new PublicDataRequestError('network', '公开数据请求失败', { cause: error });
}

export async function fetchPublicData(
  input: RequestInfo | URL,
  init: RequestInit = {},
  priority = 0,
  timeoutMs = PUBLIC_DATA_TIMEOUT_MS,
): Promise<Response> {
  const signal = requestSignal(init.signal, timeoutMs);
  return publicDataPool.run(
    () => runWithRetry(input, init, signal),
    { priority, signal },
  ).catch((error) => classifyFailure(error, init.signal, signal));
}

export const fetchPriorityPublicData: typeof fetch = (input, init) => fetchPublicData(input, init, 10);
