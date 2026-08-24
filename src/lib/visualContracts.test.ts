import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceExtensions = new Set(['.astro', '.css', '.scss', '.ts']);

function readSource(relativePath: string): string {
  return readFileSync(join(srcRoot, relativePath), 'utf8');
}

function collectSources(directory = srcRoot): Array<{ path: string; source: string }> {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSources(path);
    if (!sourceExtensions.has(extname(entry.name))) return [];
    return [{ path, source: readFileSync(path, 'utf8') }];
  });
}

test('交互样式不重新引入 transition: all 或布局属性动画', () => {
  const violations: string[] = [];
  for (const file of collectSources()) {
    if (file.path.endsWith('visualContracts.test.ts')) continue;
    if (/transition\s*:\s*all\b/i.test(file.source)) violations.push(`${file.path}: transition: all`);
    if (/transition\s*:[^;]*(?:max-height|height|width|left|right|top|bottom)\b/i.test(file.source)) {
      violations.push(`${file.path}: layout transition`);
    }
    if (/\bease-in(?=\s*[,;])/i.test(file.source)) violations.push(`${file.path}: ease-in`);
  }
  assert.deepEqual(violations, []);
});

test('全局动效令牌与降低动态契约保持稳定', () => {
  const globalStyles = readSource('styles/global.scss');
  assert.match(globalStyles, /--ease-out:\s*cubic-bezier\(0\.23,\s*1,\s*0\.32,\s*1\)/);
  assert.match(globalStyles, /--ease-in-out:\s*cubic-bezier\(0\.77,\s*0,\s*0\.175,\s*1\)/);
  assert.match(globalStyles, /--ease-drawer:\s*cubic-bezier\(0\.32,\s*0\.72,\s*0,\s*1\)/);
  assert.match(globalStyles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  const home = readSource('pages/index.astro');
  assert.match(home, /\.cover-wave-track-front\s*\{\s*animation:\s*none/);
  assert.doesNotMatch(home, /cover-wave-track-back/);
});

test('高频导航即时可见且公共页面复用统一侧栏', () => {
  assert.doesNotMatch(readSource('layouts/BlogPost.astro'), /fade-in-on-scroll|class:list=\{\['fade-/);
  assert.match(readSource('layouts/PublicLayout.astro'), /PersistentSidebar/);
  assert.doesNotMatch(readSource('layouts/PublicLayout.astro'), /SidebarLeft|SidebarRight|sidebar-tree/);
  for (const page of ['pages/blog/index.astro', 'pages/blog/tags.astro', 'pages/friends.astro', 'pages/about.astro', 'pages/404.astro']) {
    assert.doesNotMatch(readSource(page), /layouts\/BlogPost\.astro/);
  }
});

test('TOC、搜索与 Spoiler 使用新的交互契约', () => {
  const toc = readSource('scripts/toc.ts');
  assert.doesNotMatch(toc, /\.style\.height/);
  assert.match(toc, /scaleY\(\$\{length\}\)/);

  const search = readSource('scripts/search.ts');
  assert.match(search, /openModal\('keyboard'\)/);
  assert.match(search, /openModal\('pointer'\)/);

  const spoiler = readSource('components/widgets/Spoiler.astro');
  assert.match(spoiler, /<button class="spoiler-overlay"/);
  assert.match(spoiler, /dataset\.revealed\s*=\s*'true'/);
});

test('文章页侧栏三个内容槽支持点击、键盘和 ARIA 切换', () => {
  const sidebar = readSource('components/layout/PersistentSidebar.astro');
  const interaction = readSource('scripts/persistent-sidebar.ts');
  const postLayout = readSource('layouts/BlogPost.astro');

  assert.match(sidebar, /role="tablist"/);
  assert.match(sidebar, /data-sidebar-tab="overview"/);
  assert.match(sidebar, /data-sidebar-tab="toc"/);
  assert.match(sidebar, /data-sidebar-tab="series"/);
  assert.match(sidebar, /aria-label="站点概览"/);
  assert.match(sidebar, /id="toc-list"/);
  assert.match(sidebar, /aria-current=\{post\.slug === currentSlug/);
  assert.match(interaction, /ArrowLeft/);
  assert.match(interaction, /ArrowRight/);
  assert.match(interaction, /aria-selected/);
  assert.doesNotMatch(postLayout, /SidebarLeft|SidebarRight|sidebar-gutter|three-col-layout/);
});

test('统一侧栏在桌面常驻并在小屏让位给正文', () => {
  const styles = readSource('styles/persistent-sidebar.scss');
  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /top:\s*81px/);
  assert.match(styles, /height:\s*calc\(100dvh\s*-\s*81px\)/);
  assert.match(styles, /max-width:\s*999\.98px[\s\S]*\.persistent-sidebar\s*\{\s*display:\s*none/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test('非首屏样式、搜索引擎与移动端侧栏按需加载', () => {
  const globalStyles = readSource('styles/global.scss');
  const htmlHead = readSource('components/layout/HtmlHead.astro');
  const sidebar = readSource('components/layout/PersistentSidebar.astro');
  const sidebarScript = readSource('scripts/persistent-sidebar.ts');
  const publicStatus = readSource('components/home/PublicStatus.astro');
  const publicContentLayout = readSource('layouts/PublicContentLayout.astro');
  const blogPostLayout = readSource('layouts/BlogPost.astro');
  const adminPage = readSource('pages/admin/index.astro');
  const search = readSource('scripts/search.ts');

  assert.doesNotMatch(globalStyles, /@import\s+url\(/);
  assert.doesNotMatch(globalStyles, /MaoKenTangYuan/);
  assert.match(globalStyles, /--font-sans-zh:[^;]*PingFang SC[^;]*Microsoft YaHei/);

  assert.doesNotMatch(htmlHead, /persistent-sidebar\.scss|blog-post\.scss|system-status\.scss|katex\/dist/);
  assert.match(sidebar, /import ['"]\.\.\/\.\.\/styles\/persistent-sidebar\.scss['"]/);
  assert.match(sidebar, /loading="lazy" decoding="async"/);
  assert.match(sidebarScript, /matchMedia\(['"]\(min-width:\s*1000px\)['"]\)/);
  assert.match(sidebarScript, /if \(!desktopSidebarQuery\.matches\) return/);
  assert.match(publicStatus, /import ['"]\.\.\/\.\.\/styles\/system-status\.scss['"]/);
  assert.match(publicContentLayout, /import blogPostCss from ['"]\.\.\/styles\/blog-post\.scss\?url['"]/);
  assert.match(publicContentLayout, /<link slot="head" rel="stylesheet" href=\{blogPostCss\}/);
  assert.match(blogPostLayout, /import katexCss from ['"]katex\/dist\/katex\.min\.css\?url['"]/);
  assert.match(blogPostLayout, /<link slot="head" rel="stylesheet" href=\{katexCss\}/);
  assert.match(adminPage, /import katexCss from ['"]katex\/dist\/katex\.min\.css\?url['"]/);

  assert.doesNotMatch(search, /^import Fuse\b/m);
  assert.match(search, /await import\(['"]fuse\.js['"]\)/);
  assert.match(search, /void ensureFuse\(\)/);
  assert.ok(search.indexOf("input.focus({ preventScroll: true })") < search.indexOf('void ensureFuse()'));
  assert.match(search, /搜索功能加载失败，请稍后重试/);
});

test('顶部栏背景全宽且导航内容保持居中约束', () => {
  const header = readSource('components/layout/Header.astro');
  const globalStyles = readSource('styles/global.scss');
  assert.match(header, /header\s*\{[^}]*width:\s*100%/);
  assert.match(header, /\.site-nav\s*\{[^}]*width:\s*min\(1200px,\s*calc\(100%\s*-\s*48px\)\)[^}]*margin:\s*0 auto/);
  assert.doesNotMatch(header, /header\s*\{[^}]*width:\s*min\(1200px/);
  assert.doesNotMatch(globalStyles, /scrollbar-gutter:\s*stable both-edges/);
});

test('主页复用统一侧栏并移除高饱和巨大字占位', () => {
  const home = readSource('pages/index.astro');
  const layout = readSource('layouts/PublicLayout.astro');
  const sidebar = readSource('components/layout/PersistentSidebar.astro');

  assert.doesNotMatch(home, /HomeSidebar/);
  assert.match(layout, /<PersistentSidebar/);
  assert.match(layout, /grid-template-columns:\s*248px minmax\(0,\s*1fr\)/);
  assert.match(home, /class="document-preview"/);
  assert.doesNotMatch(home, /cover-letter|cover-grid|--cover-hue|home-intro/);

  assert.match(sidebar, /aria-current=\{isHome \? 'page'/);
  assert.match(sidebar, /全部文章[\s\S]*标签索引/);
});

test('主题按钮直接切换并提供双向可降级圆形过渡', () => {
  const tools = readSource('components/ui/HeaderTools.astro');
  const theme = readSource('scripts/theme.ts');
  const globalStyles = readSource('styles/global.scss');
  const search = readSource('scripts/search.ts');

  assert.doesNotMatch(tools, /theme-dropdown|aria-haspopup|role="menu"/);
  assert.doesNotMatch(search, /theme-dropdown|aria-expanded/);
  assert.match(tools, /theme-icon-sun/);
  assert.match(tools, /theme-icon-moon/);
  assert.match(tools, /theme-icon-sun icon/);
  assert.match(tools, /header-tool-button > span:not\(\.theme-icon\)/);
  assert.match(tools, /aria-pressed="false"/);

  assert.match(theme, /event\.detail\s*>\s*0/);
  assert.match(theme, /prefers-reduced-motion:\s*reduce/);
  assert.match(theme, /startViewTransition/);
  assert.match(theme, /skipTransition\(\)/);
  assert.match(theme, /TRANSITION_WATCHDOG_MS\s*=\s*700/);
  assert.match(theme, /requestedTheme\s*\?\?\s*getEffectiveTheme\(\)/);
  assert.doesNotMatch(theme, /transition\.finished\.finally/);
  assert.match(theme, /transition\.ready\.catch/);
  assert.match(theme, /next === 'dark' \? 'expand' : 'contract'/);

  assert.match(globalStyles, /theme-circle-expand 280ms var\(--ease-in-out\)/);
  assert.match(globalStyles, /theme-circle-contract 240ms var\(--ease-in-out\)/);
  assert.match(globalStyles, /clip-path:\s*circle\(0 at var\(--theme-transition-x\) var\(--theme-transition-y\)\)/);
});

test('主页运行状态提供可见的手动刷新入口', () => {
  const home = readSource('pages/index.astro');
  const publicStatus = readSource('components/home/PublicStatus.astro');
  const statusScript = readSource('scripts/public-status.ts');

  assert.match(home, /data-public-status-refresh/);
  assert.doesNotMatch(home, /system-status-heading\)\s*\{\s*display:\s*none/);
  assert.doesNotMatch(publicStatus, /data-public-status-refresh/);
  assert.match(statusScript, /refreshInFlight/);
});

test('主页壁纸支持可访问的点击、触屏手势与桌面滚轮展开', () => {
  const home = readSource('pages/index.astro');
  const motion = readSource('scripts/home-hero-motion.ts');
  const gesture = readSource('lib/homeCoverGesture.ts');

  assert.match(home, /data-home-cover-toggle/);
  assert.match(home, /data-home-cover-gesture/);
  assert.match(home, /aria-controls="home-cover"/);
  assert.match(home, /aria-expanded="false"/);
  assert.doesNotMatch(home, /view-transition-name:\s*home-wallpaper/);
  assert.match(home, /object-fit:\s*contain/);
  assert.match(home, /prefers-reduced-motion:\s*reduce/);
  assert.match(home, /const homeHeroWidths = \[640, 960, 1440\]/);
  assert.match(home, /const homeHeroFullWidths = \[1440, 1920, 2560, 3840\]/);
  assert.match(home, /width:\s*64,\s*format:\s*'webp'/);
  assert.match(home, /data-full-srcset/);
  assert.match(home, /\.cover-full-stage::after/);
  assert.match(home, /\.cover-full-stage\s*>\s*:global\(\.cover-full-photo\)[\s\S]*height:\s*100%/);
  assert.match(home, /max-width:\s*none/);

  assert.match(gesture, /HOME_COVER_DIRECTION_LOCK_DISTANCE\s*=\s*12/);
  assert.match(gesture, /HOME_COVER_DIRECTION_RATIO\s*=\s*1\.25/);
  assert.match(gesture, /HOME_COVER_SWIPE_DISTANCE\s*=\s*56/);
  assert.match(gesture, /HOME_COVER_SWIPE_MIN_DISTANCE\s*=\s*20/);
  assert.match(gesture, /HOME_COVER_SWIPE_VELOCITY\s*=\s*0\.11/);
  assert.match(gesture, /resolveHomeCoverProgress/);
  assert.match(gesture, /resolveHomeCoverRelease/);
  assert.match(gesture, /HOME_COVER_SETTLE_MIN_MS\s*=\s*140/);
  assert.match(gesture, /HOME_COVER_SETTLE_MAX_MS\s*=\s*240/);
  assert.match(gesture, /HOME_COVER_WHEEL_THRESHOLD\s*=\s*40/);
  assert.match(gesture, /resolveHomeCoverWheelTarget/);
  assert.match(motion, /ResizeObserver/);
  assert.match(motion, /\.animate\(/);
  assert.match(motion, /animation\.currentTime\s*=/);
  assert.match(motion, /cubicBezierCoordinate\(parameter, 0\.77, 0\.175\)/);
  assert.match(motion, /easing:\s*'cubic-bezier\(0\.77, 0, 0\.175, 1\)'/);
  assert.match(motion, /settleAnimations\[0\]/);
  assert.doesNotMatch(motion, /requestAnimationFrame/);
  assert.match(motion, /setPointerCapture/);
  assert.match(motion, /releasePointerCapture/);
  assert.match(motion, /trackedPointers\.size\s*>\s*1/);
  assert.match(motion, /event\.pointerType\s*!==\s*'pen'/);
  assert.match(motion, /\(hover:\s*hover\) and \(pointer:\s*fine\)/);
  assert.match(motion, /addEventListener\('wheel',\s*handleWheel,\s*\{\s*passive:\s*false\s*\}\)/);
  assert.match(motion, /deltaY\s*<\s*0\s*&&\s*isPointInside\(event,\s*source\)/);
  assert.match(motion, /deltaY\s*>\s*0\s*&&\s*event\.clientY\s*>=\s*measuredHeaderHeight/);
  assert.match(motion, /requestHighResolution\(\)/);
  assert.match(motion, /IntersectionObserver/);
  assert.doesNotMatch(motion, /startViewTransition/);
  assert.doesNotMatch(motion, /addEventListener\('scroll'/);
  assert.doesNotMatch(motion, /aria-modal|event\.key\s*===\s*'Tab'/);
  assert.match(motion, /prefers-reduced-motion:\s*reduce/);
  assert.match(motion, /event\.detail\s*===\s*0\s*\?\s*0/);
  assert.match(motion, /event\.key\s*!==\s*'Escape'/);
  assert.match(motion, /settleTo\(0,\s*0\)/);
  assert.doesNotMatch(motion, /createProgressAnimation\(sidebar/);
  assert.doesNotMatch(motion, /setElementUnavailable\(sidebar/);
  assert.match(motion, /stageLeft\s*=\s*sidebarIsVisible[\s\S]*sidebar\.getBoundingClientRect\(\)\.right\s*:\s*0/);
});

test('Worker 状态服务由 Pages 构建变量注入且写入开关独立', () => {
  const constants = readSource('consts.ts');
  const workflow = readFileSync(join(srcRoot, '..', '.github', 'workflows', 'deploy.yml'), 'utf8');

  assert.match(constants, /import\.meta\.env\.PUBLIC_ADMIN_SYNC_API_URL/);
  assert.match(constants, /import\.meta\.env\.PUBLIC_CLOUD_PUBLISH_ENABLED\s*===\s*'true'/);
  assert.match(workflow, /PUBLIC_ADMIN_SYNC_API_URL:\s*https:\/\/blog-test2-admin-api\.2799587522\.workers\.dev/);
  assert.match(workflow, /PUBLIC_CLOUD_PUBLISH_ENABLED:\s*'false'/);
});
