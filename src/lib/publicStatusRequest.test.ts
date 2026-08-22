import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyGitHubStatusFailure,
  requestStatusJson,
  shouldRefreshFromGitHub,
  waitForStatusResult,
} from './publicStatusRequest.ts';

test('短暂网络失败会重试并恢复成功', async () => {
  let calls = 0;
  const result = await requestStatusJson('https://worker.test/health', {
    attempts: 3,
    timeoutMs: 50,
    retryDelaysMs: [0, 0],
    fetchImpl: async () => {
      calls += 1;
      if (calls < 3) throw new TypeError('Failed to fetch');
      return Response.json({ ok: true });
    },
  });

  assert.equal(result.kind, 'ok');
  assert.equal(result.attempts, 3);
  assert.equal(calls, 3);
});

test('网络超时与 HTTP 服务错误使用不同结果', async () => {
  const network = await requestStatusJson('https://worker.test/health', {
    attempts: 2,
    timeoutMs: 50,
    retryDelaysMs: [0],
    fetchImpl: async () => { throw new TypeError('Failed to fetch'); },
  });
  assert.equal(network.kind, 'network-error');
  assert.equal(network.attempts, 2);

  const timeout = await requestStatusJson('https://worker.test/health', {
    attempts: 1,
    timeoutMs: 50,
    fetchImpl: async () => { throw new DOMException('The operation timed out', 'TimeoutError'); },
  });
  assert.deepEqual(timeout, { kind: 'network-error', reason: 'timeout', attempts: 1 });

  let calls = 0;
  const http = await requestStatusJson('https://worker.test/health', {
    attempts: 3,
    timeoutMs: 50,
    retryDelaysMs: [0, 0],
    fetchImpl: async () => {
      calls += 1;
      return Response.json({ ok: false }, { status: 403 });
    },
  });
  assert.equal(http.kind, 'http-error');
  assert.equal(http.status, 403);
  assert.equal(calls, 1);
});

test('服务端 503 会重试，最终仍失败时保留 HTTP 状态', async () => {
  let calls = 0;
  const result = await requestStatusJson('https://worker.test/api/public-status', {
    attempts: 2,
    timeoutMs: 50,
    retryDelaysMs: [0],
    fetchImpl: async () => {
      calls += 1;
      return Response.json({ ok: false }, { status: 503 });
    },
  });

  assert.equal(result.kind, 'http-error');
  assert.equal(result.status, 503);
  assert.equal(result.attempts, 2);
  assert.equal(calls, 2);
});

test('Worker 返回旧缓存时继续刷新 GitHub，而新鲜缓存直接采用', () => {
  assert.equal(shouldRefreshFromGitHub({
    kind: 'ok',
    status: 200,
    body: { ok: true, stale: true },
    attempts: 1,
  }), true);
  assert.equal(shouldRefreshFromGitHub({
    kind: 'ok',
    status: 200,
    body: { ok: true, stale: false },
    attempts: 1,
  }), false);
  assert.equal(shouldRefreshFromGitHub({
    kind: 'network-error',
    reason: 'timeout',
    attempts: 3,
  }), true);
});

test('Worker 状态请求过慢时提前触发 GitHub 降级', async () => {
  const slowRequest = new Promise<never>(() => {});
  assert.deepEqual(await waitForStatusResult(slowRequest, 5), { kind: 'slow' });

  const immediate = {
    kind: 'ok' as const,
    status: 200,
    body: { ok: true, stale: false },
    attempts: 1,
  };
  assert.deepEqual(await waitForStatusResult(Promise.resolve(immediate), 50), {
    kind: 'resolved',
    result: immediate,
  });
});

test('GitHub 限流、网络不可达与上游故障不会被误判为仓库故障', () => {
  assert.deepEqual(classifyGitHubStatusFailure({
    kind: 'http-error',
    status: 403,
    body: { message: 'API rate limit exceeded' },
    attempts: 1,
  }), { kind: 'limited', severity: 'waiting', status: 403 });

  assert.deepEqual(classifyGitHubStatusFailure({
    kind: 'network-error',
    reason: 'timeout',
    attempts: 1,
  }), { kind: 'timeout', severity: 'waiting' });

  assert.deepEqual(classifyGitHubStatusFailure({
    kind: 'http-error',
    status: 503,
    body: {},
    attempts: 1,
  }), { kind: 'upstream', severity: 'waiting', status: 503 });
});

test('GitHub 资源不存在仍归类为真实配置错误', () => {
  assert.deepEqual(classifyGitHubStatusFailure({
    kind: 'http-error',
    status: 404,
    body: {},
    attempts: 1,
  }), { kind: 'configuration', severity: 'error', status: 404 });
});
