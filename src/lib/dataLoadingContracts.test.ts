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
    readSource(`content/blog/电控/TI小车实战/${filename}`),
  );

  posts.forEach((post, index) => {
    const articleNumber = String(index + 1).padStart(2, '0');
    assert.match(post, new RegExp(`^title: "${articleNumber}｜`, 'm'));
    assert.match(post, /dir1: "电控"/);
    assert.match(post, /dir2: "TI小车实战"/);
    assert.match(post, /MSPM0G35XX/);
    assert.match(post, /^## 本篇总结$/m);
    assert.doesNotMatch(post, /MSPM0G3507|MSPM0G3519/);
    assert.doesNotMatch(post, /^## (动手练习|读完后应该能回答|本篇验收清单)$/m);
  });

  assert.match(posts[0], /整体—部分—整体/);
  assert.match(posts[0], /非抢占式任务调度器/);
  assert.match(posts[1], /优先级不等于抢占/);
  assert.match(posts[2], /TB6612/);
  assert.match(posts[3], /硬件 QEI/);
  assert.match(posts[4], /速度内环/);
  assert.match(posts[5], /五路循迹/);
  assert.match(posts[6], /ICM42688_ENABLE = 0U/);
  assert.match(posts[6], /当前模块默认关闭/);
  assert.match(posts[7], /阻塞串口/);
  assert.match(posts[8], /统一停机/);
  assert.match(posts[9], /初始化—启动—感知—决策—控制—观测—完成/);

  const directory = readSource('components/blog/BlogList.astro');
  const ordering = readSource('lib/postOrdering.ts');
  const categoryPage = readSource('pages/blog/category/[...slug].astro');
  const astroConfig = readFileSync(join(srcRoot, '..', 'astro.config.mjs'), 'utf8');
  assert.match(directory, /function sortDirectoryPosts/);
  assert.match(directory, /compareDirectoryPostMetadata/);
  assert.match(ordering, /Number\(aOrder\) - Number\(bOrder\)/);
  assert.match(directory, /sort\?: 'time' \| 'oldest' \| 'dir' \| 'overview'/);
  assert.match(categoryPage, /<BlogList posts=\{filtered\} sort="oldest" \/>/);
  assert.match(astroConfig, /const tiCarRedirects = Object\.fromEntries\(tiCarArticleSlugs\.map/);
  assert.match(astroConfig, /`\/blog\/小车组\/ti小车实战\/\$\{slug\}`/);
  assert.match(astroConfig, /`\$\{publicBaseUrl\}\/blog\/电控\/ti小车实战\/\$\{slug\}\/`/);
  assert.match(astroConfig, /'\/blog\/category\/小车组': `\$\{publicBaseUrl\}\/blog\/category\/电控\/`/);
  assert.match(astroConfig, /'\/blog\/category\/小车组\/TI小车实战': `\$\{publicBaseUrl\}\/blog\/category\/电控\/TI小车实战\/`/);
});

test('电控每份资料独立成文并保留代码审查结论', () => {
  const paths = [
    'content/blog/电控/PID算法/01-positional-incremental-pid.md',
    'content/blog/电控/PID算法/02-low-pass-incremental-speed-pid.md',
    'content/blog/电控/PID算法/03-feedforward-anti-windup-cascade-pid.md',
    'content/blog/电控/RTOS-任务调度器/01-cooperative-scheduler.md',
    'content/blog/电控/灰度及循迹环PID/01-eight-channel-tracker.md',
    'content/blog/电控/灰度及循迹环PID/02-mspm0g35xx-line-tracking-project.md',
    'content/blog/电控/滤波算法与陀螺仪驱动/01-kalman-fusion-design.md',
    'content/blog/电控/滤波算法与陀螺仪驱动/02-two-state-kalman-filter.md',
    'content/blog/电控/滤波算法与陀螺仪驱动/03-mspm0-mpu6050-balance-control.md',
    'content/blog/电控/滤波算法与陀螺仪驱动/04-mpu6050-dmp-package.md',
    'content/blog/电控/滤波算法与陀螺仪驱动/05-jy901s-uart-driver.md',
    'content/blog/电控/滤波算法与陀螺仪驱动/06-bno080-uart-rvc-project.md',
    'content/blog/电控/滤波算法与陀螺仪驱动/07-bno080-datasheet-rvc.md',
  ];
  const posts = paths.map(readSource);

  posts.forEach((post) => {
    assert.match(post, /dir1: "电控"/);
    assert.match(post, /^## 本篇总结$/m);
    assert.doesNotMatch(post, /^## (动手练习|读完后应该能回答|本篇验收清单)$/m);
  });

  assert.equal(paths.length, 13);
  assert.match(posts[0], /`pid_set_target\(\)` 会重置历史状态/);
  assert.match(posts[1], /航向差速代码仍被注释/);
  assert.match(posts[2], /条件积分、积分限幅和饱和方向判断/);
  assert.match(posts[3], /任务名使用指针比较/);
  assert.match(posts[4], /备用未调用/);
  assert.match(posts[5], /速度 PID 文件存在，但当前调用链仍被注释/);
  assert.match(posts[6], /四状态模型/);
  assert.match(posts[7], /固定 5 ms/);
  assert.match(posts[8], /I²C 等待没有超时/);
  assert.match(posts[9], /当前 `IMU\.c` 使用 DMP FIFO 输出 \| 否/);
  assert.match(posts[10], /100 组独立同步样本 \| 否/);
  assert.match(posts[11], /新数据标志被正确消费 \| 否/);
  assert.match(posts[12], /RVC 帧固定为 19 字节/);

  const astroConfig = readSource('../astro.config.mjs');
  assert.match(astroConfig, /01-pid-algorithms.*01-positional-incremental-pid/);
  assert.match(astroConfig, /01-line-tracking-control.*01-eight-channel-tracker/);
  assert.match(astroConfig, /01-filtering-and-imu-drivers.*01-kalman-fusion-design/);

  const constants = readSource('consts.ts');
  assert.match(constants, /'电控': \['TI小车实战', 'PID算法', 'RTOS-任务调度器', '灰度及循迹环PID', '滤波算法与陀螺仪驱动'\]/);
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
