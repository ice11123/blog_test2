import test from 'node:test';
import assert from 'node:assert/strict';
import { mapWithConcurrency } from './boundedConcurrency.ts';

test('并发映射限制活动任务数量并保持结果顺序', async () => {
  let active = 0;
  let peak = 0;

  const results = await mapWithConcurrency([30, 5, 20, 10, 15], 3, async (delay, index) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, delay));
    active -= 1;
    return index * 2;
  });

  assert.equal(peak, 3);
  assert.deepEqual(results, [0, 2, 4, 6, 8]);
});

test('空列表不会启动任务，非法并发下限按一处理', async () => {
  let calls = 0;
  assert.deepEqual(await mapWithConcurrency([], 3, async () => 1), []);

  const results = await mapWithConcurrency([1, 2], 0, async value => {
    calls += 1;
    return value;
  });
  assert.equal(calls, 2);
  assert.deepEqual(results, [1, 2]);
});
