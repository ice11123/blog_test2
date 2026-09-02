import { createRequestPool } from './requestPool';

const publicDataPool = createRequestPool(3);

export function fetchPublicData(
  input: RequestInfo | URL,
  init: RequestInit = {},
  priority = 0,
): Promise<Response> {
  return publicDataPool.run(
    () => fetch(input, init),
    { priority, signal: init.signal ?? undefined },
  );
}

export const fetchPriorityPublicData: typeof fetch = (input, init) => fetchPublicData(input, init, 10);
