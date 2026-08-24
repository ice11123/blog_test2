import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));
const readSource = (path: string) => readFileSync(join(srcRoot, path), 'utf8');

test('GitHub Languages 近视口加载、限制并发并使用会话缓存', () => {
  const source = readSource('components/github/GitHubLanguages.astro');
  assert.match(source, /LANGUAGE_CONCURRENCY\s*=\s*3/);
  assert.match(source, /mapWithConcurrency\(ownRepos,\s*LANGUAGE_CONCURRENCY/);
  assert.match(source, /sessionStorage\.getItem/);
  assert.match(source, /rootMargin:\s*'120px 0px'/);
  assert.match(source, /astro:before-swap/);
  assert.match(source, /controller\.abort\(\)/);
});

test('GitHub Contributions 仅在折叠区首次展开后加载', () => {
  const source = readSource('components/github/GitHubContributions.astro');
  assert.match(source, /root\.closest\('details'\)/);
  assert.match(source, /details\.addEventListener\('toggle'/);
  assert.match(source, /if \(!details \|\| details\.open\) begin\(\)/);
  assert.match(source, /astro:before-swap/);
  assert.match(source, /controller\.abort\(\)/);
});

test('PublicStatus 可见或手动触发，共享请求且初次不连续重试', () => {
  const source = readSource('scripts/public-status.ts');
  assert.match(source, /WORKER_INITIAL_ATTEMPTS\s*=\s*1/);
  assert.match(source, /WORKER_MANUAL_ATTEMPTS\s*=\s*3/);
  assert.match(source, /new IntersectionObserver/);
  assert.match(source, /runRefresh\(true\)/);
  assert.match(source, /if \(refreshInFlight\) return refreshInFlight/);
  assert.match(source, /astro:before-swap/);
  assert.match(source, /controller\.abort\(\)/);
});
