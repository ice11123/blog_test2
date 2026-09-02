import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchPublicData, PublicDataRequestError } from './publicDataFetch.ts';
import { createRequestPool } from './requestPool.ts';

test('请求池限制全局并发并优先处理高优先级队列', async () => {
  const pool = createRequestPool(2);
  const releases: Array<() => void> = [];
  const started: string[] = [];
  const task = (name: string) => pool.run(() => new Promise<void>((resolve) => {
    started.push(name);
    releases.push(resolve);
  }));

  const first = task('first');
  const second = task('second');
  const low = pool.run(() => Promise.resolve().then(() => { started.push('low'); }));
  const high = pool.run(() => Promise.resolve().then(() => { started.push('high'); }), { priority: 10 });
  assert.deepEqual(started, ['first', 'second']);
  releases.shift()?.();
  await high;
  assert.ok(started.indexOf('high') > started.indexOf('second'));
  assert.ok(started.indexOf('low') === -1 || started.indexOf('high') < started.indexOf('low'));
  while (releases.length > 0) releases.shift()?.();
  await Promise.all([first, second, high, low]);
});

test('排队前已取消的请求不会占用并发槽', async () => {
  const pool = createRequestPool(1);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    pool.run(async () => 'never', { signal: controller.signal }),
    (error: Error) => error.name === 'AbortError',
  );
  assert.equal(pool.activeCount, 0);
  assert.equal(pool.pendingCount, 0);
});

test('等待中的请求取消后立即出队', async () => {
  const pool = createRequestPool(1);
  let releaseActive!: () => void;
  const active = pool.run(() => new Promise<void>((resolve) => { releaseActive = resolve; }));
  const controller = new AbortController();
  const queued = pool.run(async () => 'never', { signal: controller.signal });

  assert.equal(pool.pendingCount, 1);
  controller.abort();
  await assert.rejects(queued, (error: Error) => error.name === 'AbortError');
  assert.equal(pool.pendingCount, 0);
  releaseActive();
  await active;
});

test('公开数据请求统一应用有限超时并保留调用方取消语义', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal;
    if (!signal) return reject(new Error('missing signal'));
    const abort = () => reject(signal.reason);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });

  const keepAlive = setTimeout(() => {}, 100);
  try {
    await assert.rejects(
      fetchPublicData('https://example.test/timeout', {}, 0, 10),
      (error) => error instanceof PublicDataRequestError && error.kind === 'timeout',
    );

    const controller = new AbortController();
    const request = fetchPublicData('https://example.test/cancel', { signal: controller.signal });
    controller.abort();
    await assert.rejects(request, (error) => error instanceof PublicDataRequestError && error.kind === 'cancelled');
  } finally {
    clearTimeout(keepAlive);
    globalThis.fetch = originalFetch;
  }
});

test('公开数据请求仅对瞬时失败执行一次有限重试', async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    if (attempts === 1) throw new TypeError('temporary network failure');
    return new Response('ok', { status: 200 });
  };

  try {
    const response = await fetchPublicData('https://example.test/retry');
    assert.equal(await response.text(), 'ok');
    assert.equal(attempts, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('公开数据请求把最终网络失败归类为 network', async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    throw new TypeError('offline');
  };

  try {
    await assert.rejects(
      fetchPublicData('https://example.test/offline'),
      (error) => error instanceof PublicDataRequestError && error.kind === 'network',
    );
    assert.equal(attempts, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
