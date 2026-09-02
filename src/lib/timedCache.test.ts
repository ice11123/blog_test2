import assert from 'node:assert/strict';
import test from 'node:test';
import { readTimedCache, writeTimedCache } from './timedCache.ts';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    values,
  };
}

test('定时缓存只返回版本匹配且未过期的数据', () => {
  const storage = createStorage();
  assert.equal(writeTimedCache(storage, 'status', 2, 1_000, { ok: true }, 10_000), true);
  assert.deepEqual(readTimedCache(storage, 'status', 2, 10_999), { ok: true });
  assert.equal(readTimedCache(storage, 'status', 1, 10_999), null);
  assert.equal(storage.values.has('status'), false);
});

test('过期、损坏和不可写缓存均安全降级', () => {
  const storage = createStorage();
  writeTimedCache(storage, 'expired', 1, 100, ['cached'], 1_000);
  assert.equal(readTimedCache(storage, 'expired', 1, 1_100), null);

  storage.values.set('broken', '{');
  assert.equal(readTimedCache(storage, 'broken', 1, 1_000), null);

  const blockedStorage = {
    getItem: () => null,
    setItem: () => { throw new Error('blocked'); },
  };
  assert.equal(writeTimedCache(blockedStorage, 'key', 1, 100, 'value', 1_000), false);
});
