import assert from 'node:assert/strict';
import test from 'node:test';
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
