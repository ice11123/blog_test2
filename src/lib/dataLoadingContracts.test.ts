import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));
const readSource = (path: string) => readFileSync(join(srcRoot, path), 'utf8');

test('TI 小车专题保持十篇顺序、统一芯片口径与总结结尾', () => {
  const filenames = [
    '01-ti-car-start.md',
    '02-system-architecture.md',
    '03-first-motor-run.md',
    '04-software-architecture.md',
    '05-motor-execution-chain.md',
    '06-encoder-motion-metrics.md',
    '07-speed-position-control.md',
    '08-line-tracking-system.md',
    '09-observability-and-hmi.md',
    '10-integration-and-delivery.md',
  ];

  const posts = filenames.map((filename) =>
    readSource(`content/blog/小车组/TI小车实战/${filename}`),
  );

  posts.forEach((post, index) => {
    const articleNumber = String(index + 1).padStart(2, '0');
    assert.match(post, new RegExp(`^title: "${articleNumber}｜`, 'm'));
    assert.match(post, /dir1: "小车组"/);
    assert.match(post, /dir2: "TI小车实战"/);
    assert.match(post, /MSPM0G35XX/);
    assert.match(post, /^## 本篇总结$/m);
    assert.doesNotMatch(post, /MSPM0G3507|MSPM0G3519/);
    assert.doesNotMatch(post, /^## (动手练习|读完后应该能回答|本篇验收清单)$/m);
  });

  const directory = readSource('components/blog/BlogList.astro');
  const ordering = readSource('lib/postOrdering.ts');
  const categoryPage = readSource('pages/blog/category/[...slug].astro');
  assert.match(directory, /function sortDirectoryPosts/);
  assert.match(directory, /compareDirectoryPostMetadata/);
  assert.match(ordering, /Number\(aOrder\) - Number\(bOrder\)/);
  assert.match(directory, /sort\?: 'time' \| 'oldest' \| 'dir' \| 'overview'/);
  assert.match(categoryPage, /<BlogList posts=\{filtered\} sort="oldest" \/>/);
});

test('GitHub Languages 近视口加载、限制并发并使用跨会话定时缓存', () => {
  const source = readSource('components/github/GitHubLanguages.astro');
  const publicFetch = readSource('lib/publicDataFetch.ts');
  assert.match(source, /LANGUAGE_CONCURRENCY\s*=\s*3/);
  assert.match(source, /mapWithConcurrency\(ownRepos,\s*LANGUAGE_CONCURRENCY/);
  assert.match(source, /languageMaps\.some\(function\(languages\) \{ return languages === null; \}\)/);
  assert.match(source, /if \(!incomplete\) writeCache\(USERNAME/);
  assert.match(source, /readTimedCache\(localStorage/);
  assert.match(source, /CACHE_TTL_MS\s*=\s*12 \* 60 \* 60 \* 1000/);
  assert.match(source, /rootMargin:\s*'120px 0px'/);
  assert.match(source, /astro:before-swap/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(publicFetch, /PUBLIC_DATA_TIMEOUT_MS\s*=\s*12_000/);
  assert.match(publicFetch, /PUBLIC_DATA_RETRY_COUNT\s*=\s*1/);
  assert.match(publicFetch, /PublicDataRequestError/);
  assert.match(publicFetch, /AbortSignal\.any\(\[callerSignal, timeoutSignal\]\)/);
});

test('GitHub Contributions 仅在折叠区首次展开后加载', () => {
  const source = readSource('components/github/GitHubContributions.astro');
  assert.match(source, /root\.closest\('details'\)/);
  assert.match(source, /details\.addEventListener\('toggle'/);
  assert.match(source, /if \(!details \|\| details\.open\) begin\(\)/);
  assert.match(source, /astro:before-swap/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(source, /readTimedCache\(localStorage/);
  assert.match(source, /writeTimedCache\(localStorage/);
});

test('PublicStatus 可见或手动触发，共享请求且初次不连续重试', () => {
  const source = readSource('scripts/public-status.ts');
  const component = readSource('components/home/PublicStatus.astro');
  assert.match(source, /WORKER_INITIAL_ATTEMPTS\s*=\s*1/);
  assert.match(source, /WORKER_MANUAL_ATTEMPTS\s*=\s*3/);
  assert.match(source, /new IntersectionObserver/);
  assert.match(source, /runRefresh\(true\)/);
  assert.match(source, /if \(refreshInFlight\) return refreshInFlight/);
  assert.match(source, /astro:before-swap/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(source, /initPublicStatus\(\);/);
  assert.match(component, /import\(['"]\.\.\/\.\.\/scripts\/public-status['"]\)/);
  assert.match(component, /rootMargin:\s*['"]240px 0px['"]/);
  assert.doesNotMatch(component, /<script src="\.\.\/\.\.\/scripts\/public-status"/);
  assert.ok(component.indexOf("if (!root || root.dataset.loaderBound === 'true') return") < component.indexOf('cleanupPublicStatusLoader?.()'));
  assert.match(component, /stopImmediatePropagation\(\)/);
  assert.match(component, /refreshButton\?\.click\(\)/);
  assert.match(source, /deployment\.status === 'failure'/);
  assert.match(source, /部署状态暂未确认/);
  assert.match(source, /不代表部署失败/);
});

test('Plot3D 与 MiniBrowser 不在文章首载抢占外部资源', () => {
  const plotComponent = readSource('components/widgets/Plot3D.astro');
  const plotRuntime = readSource('scripts/plot3d.ts');
  const miniBrowser = readSource('components/widgets/MiniBrowser.astro');

  assert.doesNotMatch(plotComponent, /<script[^>]+src="https:\/\/cdn\.plot\.ly/);
  assert.match(plotComponent, /data-plot3d/);
  assert.match(plotRuntime, /new IntersectionObserver/);
  assert.match(plotRuntime, /rootMargin:\s*'240px 0px'/);
  assert.match(plotRuntime, /document\.head\.appendChild\(script\)/);
  assert.match(plotRuntime, /Plotly\?\.purge\?\.\(root\)/);
  assert.match(plotRuntime, /PLOTLY_TIMEOUT_MS\s*=\s*10_000/);
  assert.match(plotRuntime, /responsive:\s*true/);
  assert.match(plotRuntime, /new ResizeObserver/);
  assert.match(plotRuntime, /Plotly\?\.Plots\?\.resize\(root\)/);
  assert.match(plotRuntime, /Plotly\.relayout/);
  assert.match(plotRuntime, /script\.remove\(\)/);
  assert.match(plotRuntime, /attributeFilter:\s*\['data-theme'\]/);
  assert.match(miniBrowser, /loading="lazy"/);
  assert.match(miniBrowser, /document\.addEventListener\('astro:page-load', initMiniBrowsers\)/);
});

test('Mermaid 在每次文章路由挂载并释放主题观察器', () => {
  const source = readSource('scripts/mermaid.ts');
  assert.match(source, /document\.addEventListener\('astro:page-load', initMermaidPage\)/);
  assert.match(source, /document\.addEventListener\('astro:before-swap', cleanupMermaidPage\)/);
  assert.match(source, /observer\?\.disconnect\(\)/);
  assert.match(source, /renderGen \+= 1/);
  assert.match(source, /MERMAID_TIMEOUT_MS\s*=\s*10_000/);
  assert.match(source, /script\.remove\(\)/);
});
