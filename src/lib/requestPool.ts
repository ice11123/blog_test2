interface QueueEntry<T> {
  priority: number;
  sequence: number;
  signal?: AbortSignal;
  task: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  abortListener?: () => void;
}

export interface RequestPool {
  run<T>(task: () => Promise<T>, options?: { priority?: number; signal?: AbortSignal }): Promise<T>;
  readonly activeCount: number;
  readonly pendingCount: number;
}

function abortError(): Error {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

export function createRequestPool(maxConcurrent: number): RequestPool {
  const limit = Math.max(1, Math.floor(maxConcurrent));
  const queue: QueueEntry<unknown>[] = [];
  let activeCount = 0;
  let sequence = 0;

  const drain = () => {
    while (activeCount < limit && queue.length > 0) {
      queue.sort((left, right) => right.priority - left.priority || left.sequence - right.sequence);
      const entry = queue.shift();
      if (!entry) return;
      if (entry.abortListener) entry.signal?.removeEventListener('abort', entry.abortListener);
      if (entry.signal?.aborted) {
        entry.reject(abortError());
        continue;
      }
      activeCount += 1;
      void entry.task().then(entry.resolve, entry.reject).finally(() => {
        activeCount -= 1;
        drain();
      });
    }
  };

  return {
    run<T>(task: () => Promise<T>, options: { priority?: number; signal?: AbortSignal } = {}) {
      if (options.signal?.aborted) return Promise.reject(abortError());
      return new Promise<T>((resolve, reject) => {
        const entry: QueueEntry<unknown> = {
          priority: options.priority ?? 0,
          sequence: sequence++,
          signal: options.signal,
          task,
          resolve: resolve as QueueEntry<unknown>['resolve'],
          reject,
        };
        if (options.signal) {
          entry.abortListener = () => {
            const index = queue.indexOf(entry);
            if (index === -1) return;
            queue.splice(index, 1);
            reject(abortError());
          };
          options.signal.addEventListener('abort', entry.abortListener, { once: true });
        }
        queue.push(entry);
        drain();
      });
    },
    get activeCount() { return activeCount; },
    get pendingCount() { return queue.length; },
  };
}
