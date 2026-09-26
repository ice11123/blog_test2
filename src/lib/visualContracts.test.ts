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
  const home = readSource('pages/index.astro');
  assert.match(globalStyles, /--ease-out:\s*cubic-bezier\(0\.23,\s*1,\s*0\.32,\s*1\)/);
  assert.match(globalStyles, /--ease-in-out:\s*cubic-bezier\(0\.77,\s*0,\s*0\.175,\s*1\)/);
  assert.match(globalStyles, /--ease-drawer:\s*cubic-bezier\(0\.32,\s*0\.72,\s*0,\s*1\)/);
  assert.match(globalStyles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  assert.match(home, /\.cover-wave-layer\s*\{\s*animation:\s*none/);
  assert.equal((home.match(/<div class="cover-waves"/g) ?? []).length, 1);
  assert.equal((home.match(/<div class="cover-wave-layer/g) ?? []).length, 3);
  assert.equal((home.match(/<svg class="cover-wave-shape"/g) ?? []).length, 3);
  assert.equal((home.match(/<path d=\{homeGentleWavePath\}/g) ?? []).length, 3);
  assert.match(home, /transform="translate\(0 0\)"/);
  assert.match(home, /transform="translate\(0 6\)"/);
  assert.match(home, /transform="translate\(0 12\)"/);
  assert.doesNotMatch(home, /<use class="cover-wave-layer/);
  assert.doesNotMatch(home, /\.cover-wave-layer\s*\{[\s\S]*contain:\s*paint/);
  assert.match(home, /cover-wave-layer-back[\s\S]*animation-duration:\s*12s/);
  assert.match(home, /cover-wave-layer-middle[\s\S]*animation-duration:\s*7s/);
  assert.match(home, /cover-wave-layer-front[\s\S]*animation-duration:\s*4s/);
  assert.match(home, /cover-wave-layer-back[\s\S]*animation-delay:\s*-2s/);
  assert.match(home, /cover-wave-layer-middle[\s\S]*animation-delay:\s*-3s/);
  assert.match(home, /cover-wave-layer-front[\s\S]*animation-delay:\s*-4s/);
  assert.match(home, /\.cover-waves\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(home, /@keyframes cover-wave-drift\s*\{[\s\S]*translate3d\(-50%,[\s\S]*translate3d\(0,/);
  assert.doesNotMatch(home, /cover-wave-layer[^}]*filter:/);
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
  const tocStyles = readSource('styles/article-toc-sidebar.scss');
  assert.doesNotMatch(toc, /\.style\.height/);
  assert.match(toc, /scaleY\(\$\{length\}\)/);
  assert.match(toc, /createElement\('button'\)/);
  assert.match(toc, /astro:before-swap', teardownToc/);
  assert.match(toc, /headingResizeObserver/);
  assert.match(toc, /findActiveHeadingIndex/);
  assert.match(toc, /getHeadingScrollOffset/);
  assert.match(toc, /document\.fonts\?\.ready/);
  assert.match(toc, /window\.addEventListener\('resize', scheduleGeometryRefresh/);
  assert.match(tocStyles, /\.position-indicator\s*\{[\s\S]*top:\s*0/);
  assert.doesNotMatch(tocStyles, /\.position-indicator\s*\{[\s\S]*top:\s*78px/);

  const search = readSource('scripts/search.ts');
  const searchModal = readSource('components/blog/SearchModal.astro');
  assert.match(search, /openModal\('keyboard'\)/);
  assert.match(search, /openModal\('pointer'\)/);
  assert.match(searchModal, /role="combobox"/);
  assert.match(searchModal, /aria-controls="search-results"/);
  assert.match(searchModal, /aria-expanded="false"/);
  assert.match(search, /aria-activedescendant/);
  assert.match(search, /id="search-result-\$\{i\}"/);

  const spoiler = readSource('components/widgets/Spoiler.astro');
  assert.match(spoiler, /<button class="spoiler-overlay"/);
  assert.match(spoiler, /dataset\.revealed\s*=\s*'true'/);
});

test('左侧栏固定为个人、目录、标签目录，文章 TOC 独立位于右栏', () => {
  const sidebar = readSource('components/layout/PersistentSidebar.astro');
  const articleToc = readSource('components/layout/ArticleTocSidebar.astro');
  const layout = readSource('layouts/PublicLayout.astro');
  const interaction = readSource('scripts/persistent-sidebar.ts');

  assert.match(sidebar, /role="tablist"/);
  assert.match(sidebar, /data-sidebar-tab="profile"/);
  assert.match(sidebar, /data-sidebar-tab="catalog"/);
  assert.match(sidebar, /data-sidebar-tab="tags"/);
  assert.match(sidebar, /aria-label="个人"/);
  assert.match(sidebar, /aria-label="全站文章目录"/);
  assert.match(sidebar, /aria-label="标签目录"/);
  assert.doesNotMatch(sidebar, /id="toc-list"|data-sidebar-tab="toc"|data-sidebar-tab="series"/);
  assert.match(sidebar, /aria-current=\{post\.slug === currentSlug/);
  assert.match(articleToc, /class="article-toc-sidebar"/);
  assert.match(articleToc, /aria-label="当前文章目录"/);
  assert.match(articleToc, /id="toc-list"/);
  assert.match(layout, /sidebarMode === 'article' && <ArticleTocSidebar \/>/);
  assert.match(layout, /grid-template-columns:\s*248px minmax\(0,\s*1fr\) 236px/);
  assert.match(interaction, /ArrowLeft/);
  assert.match(interaction, /ArrowRight/);
  assert.match(interaction, /aria-selected/);
});

test('统一侧栏在桌面常驻并在移动端复用为边缘抽屉', () => {
  const styles = readSource('styles/persistent-sidebar.scss');
  const mobileStyles = readSource('styles/mobile-sidebars.scss');
  const mobileControls = readSource('components/layout/MobileSidebarControls.astro');
  const mobileScript = readSource('scripts/mobile-sidebars.ts');
  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /top:\s*81px/);
  assert.match(styles, /height:\s*calc\(100dvh\s*-\s*81px\)/);
  assert.doesNotMatch(styles, /max-width:\s*999\.98px[\s\S]*\.persistent-sidebar\s*\{\s*display:\s*none/);
  assert.match(mobileControls, /data-mobile-sidebar-toggle="left"/);
  assert.match(mobileControls, /data-mobile-sidebar-toggle="right"/);
  assert.match(mobileControls, /aria-controls="persistent-site-sidebar"/);
  assert.match(mobileControls, /aria-controls="article-toc-sidebar"/);
  assert.match(mobileStyles, /\.persistent-sidebar,[\s\S]*\.article-toc-sidebar\s*\{[\s\S]*position:\s*fixed/);
  assert.match(mobileStyles, /transform:\s*translate3d\(-100%,\s*0,\s*0\)/);
  assert.match(mobileStyles, /transform:\s*translate3d\(100%,\s*0,\s*0\)/);
  assert.match(mobileStyles, /transition:\s*transform 240ms var\(--ease-drawer\)/);
  assert.match(mobileStyles, /bottom:\s*24px/);
  assert.doesNotMatch(mobileStyles, /transition:\s*all/);
  assert.match(mobileScript, /ResizeObserver\(updateHeaderHeight\)/);
  assert.match(mobileScript, /max-width:\s*1099\.98px/);
  assert.match(mobileScript, /leftDrawer\.inert|siteSidebar\.inert/);
  assert.match(mobileScript, /event\.key === 'Escape'/);
  assert.match(mobileScript, /astro:before-swap/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test('文章页使用紧凑导语层级与独立正文版心', () => {
  const layout = readSource('layouts/BlogPost.astro');
  const styles = readSource('styles/blog-post.scss');

  assert.match(layout, /class="article-breadcrumbs"/);
  assert.match(layout, /class="article-description"/);
  assert.match(layout, /class="article-meta"/);
  assert.match(layout, /class="post-author-link" href=\{withBase\('\/'\)\}/);
  assert.match(layout, /class="prose article-content"/);
  assert.match(layout, /查看源文件/);
  assert.doesNotMatch(layout, /class="post-meta" aria-label="文章信息"/);
  assert.match(styles, /\.article-header h1\s*\{[\s\S]*width:\s*100%[\s\S]*max-width:\s*none/);
  assert.match(styles, /\.article-header h1\s*\{[\s\S]*text-align:\s*center[\s\S]*text-wrap:\s*pretty/);
  assert.match(styles, /\.post-author-link\s*\{[\s\S]*color:\s*#b4232c/);
  assert.match(styles, /\.blog-post-page \.prose\s*\{[\s\S]*font-size:\s*17px[\s\S]*line-height:\s*1\.86/);
  assert.match(styles, /@media \(max-width:\s*680px\)[\s\S]*font-size:\s*clamp\(1\.75rem,\s*8vw,\s*2\.15rem\)/);
  assert.match(readSource('styles/mobile-sidebars.scss'), /\.mobile-sidebar-toggle\s*\{[\s\S]*height:\s*42px/);
});

test('非首屏样式与搜索引擎按需加载', () => {
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
  assert.doesNotMatch(sidebarScript, /if \(!desktopSidebarQuery\.matches\) return/);
  assert.match(sidebarScript, /document\.querySelectorAll<HTMLElement>\('\[data-persistent-sidebar\]'\)/);
  assert.match(publicStatus, /import ['"]\.\.\/\.\.\/styles\/system-status\.scss['"]/);
  assert.match(adminPage, /import ['"]\.\.\/\.\.\/styles\/system-status\.scss['"]/);
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
  assert.doesNotMatch(header, /@media\s*\(max-width:\s*999px\)[\s\S]*header\s*\{[\s\S]*backdrop-filter:\s*none/);
  assert.match(header, /class="mobile-social-menu"/);
  assert.match(header, /@media \(max-width: 680px\)[\s\S]*#header-social \{ display: none; \}[\s\S]*\.mobile-social-menu \{[^}]*display: block;[^}]*margin: 0;[^}]*padding: 0;[^}]*border: 0/);
  assert.match(header, /\.mobile-social-menu\[open\] > summary \{ margin-bottom: 0; \}/);
  assert.match(header, /\.nav-links \{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)[^}]*padding: 3px/);
  assert.match(header, /\.nav-links :global\(a\.active\) \{[^}]*background: var\(--surface\)/);
});

test('主页复用统一侧栏并移除高饱和巨大字占位', () => {
  const home = readSource('pages/index.astro');
  const recentPosts = readSource('components/home/RecentPosts.astro');
  const topicAtlas = readSource('components/home/TopicAtlas.astro');
  const layout = readSource('layouts/PublicLayout.astro');
  const sidebar = readSource('components/layout/PersistentSidebar.astro');

  assert.doesNotMatch(home, /HomeSidebar/);
  assert.match(layout, /<PersistentSidebar/);
  assert.match(layout, /grid-template-columns:\s*248px minmax\(0,\s*1fr\)/);
  assert.match(home, /<RecentPosts posts=\{recentPosts\}/);
  assert.match(home, /<TopicAtlas posts=\{allPosts\}/);
  assert.match(recentPosts, /class="home-post-sequence"/);
  assert.match(topicAtlas, /class="topic-grid"/);
  assert.doesNotMatch(recentPosts, /class="document-sheet"/);
  assert.doesNotMatch(home, /cover-letter|cover-grid|--cover-hue|home-intro/);

  assert.match(sidebar, /aria-current=\{isHome \? 'page'/);
  assert.match(sidebar, /data-sidebar-tab="profile"[\s\S]*data-sidebar-tab="catalog"[\s\S]*data-sidebar-tab="tags"/);
  assert.match(sidebar, /全部文章[\s\S]*全部标签/);
});

test('主页技术星图固定五个真实分类并分离整卡与近期文章交互', () => {
  const constants = readSource('consts.ts');
  const atlas = readSource('components/home/TopicAtlas.astro');
  const categoryPage = readSource('pages/blog/category/[...slug].astro');
  const list = readSource('components/blog/BlogList.astro');

  assert.match(constants, /DIR1_ORDER:\s*string\[\]\s*=\s*\['AI\/Agent协作与开发', '电控', '电源', '学习笔记', '其他'\]/);
  assert.match(atlas, /import controlPlatform from '\.\.\/\.\.\/assets\/topics\/control-platform\.png'/);
  assert.match(atlas, /class="codex-emblem"/);
  assert.match(atlas, /class="control-art"/);
  assert.match(atlas, /class="study-emblem"/);
  assert.match(atlas, /format: 'avif'/);
  assert.match(atlas, /format: 'webp'/);
  assert.match(atlas, /class="topic-card-link"[\s\S]*blogCategoryPath\(topic\.name\)/);
  assert.match(atlas, /href=\{blogPostPath\(post\.id\)\}/);
  assert.match(atlas, /\.topic-copy[\s\S]*pointer-events:\s*none/);
  assert.match(atlas, /\.topic-recent a[\s\S]*pointer-events:\s*auto/);
  assert.match(atlas, /\.topic-card:has\(\.topic-card-link:hover\)/);
  assert.doesNotMatch(atlas, /\.topic-card:has\(a:hover\)/);
  assert.match(atlas, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(atlas, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(categoryPage, /new Set<string>\(DIR1_ORDER\.map\(blogCategorySegment\)\)/);
  assert.match(list, /if \(sort === 'overview'\)[\s\S]*for \(const dir1 of dirOrder\.dir1\) grouped\[dir1\] \?\?= \{\}/);
  assert.match(readSource('pages/blog/index.astro'), /dir1:\s*DIR1_ORDER/);
});

test('主题按钮直接切换并提供双向可降级圆形过渡', () => {
  const tools = readSource('components/ui/HeaderTools.astro');
  const theme = readSource('scripts/theme.ts');
  const globalStyles = readSource('styles/global.scss');
  const search = readSource('scripts/search.ts');

  assert.doesNotMatch(tools, /theme-dropdown|aria-haspopup|role="menu"/);
  assert.doesNotMatch(search, /theme-dropdown/);
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
  assert.doesNotMatch(publicStatus, /<button[^>]*data-public-status-refresh/);
  assert.match(statusScript, /refreshInFlight/);
});

test('主页壁纸支持可访问的点击、触屏手势与桌面滚轮展开', () => {
  const home = readSource('pages/index.astro');
  const motion = readSource('scripts/home-hero-motion.ts');
  const gesture = readSource('lib/homeCoverGesture.ts');
  const geometry = readSource('lib/homeCoverMotionGeometry.ts');

  assert.match(home, /data-home-cover-toggle/);
  assert.match(home, /data-home-cover-gesture/);
  assert.match(home, /aria-controls="home-cover"/);
  assert.match(home, /aria-expanded="false"/);
  assert.doesNotMatch(home, /view-transition-name:\s*home-wallpaper/);
  assert.match(home, /data-home-lower-motion/);
  assert.match(home, /data-home-cover-viewport/);
  assert.match(home, /\.cover-full-stage[\s\S]*overflow:\s*hidden[\s\S]*transform-origin:\s*0 0/);
  assert.match(home, /\.cover-full-viewport\s*>\s*:global\(\.cover-full-photo\)[\s\S]*transform-origin:\s*0 0/);
  assert.match(home, /prefers-reduced-motion:\s*reduce/);
  assert.match(home, /const homeHeroWidths = \[640, 960, 1440\]/);
  assert.match(home, /const homeHeroFullWidths = \[1440, 1920, 2560, 3840\]/);
  assert.match(home, /width:\s*64,\s*format:\s*'webp'/);
  assert.match(home, /data-light-type="image\/webp"/);
  assert.match(home, /data-dark-type="image\/avif"/);
  assert.match(home, /document\.currentScript/);
  assert.match(home, /fetchpriority="high"/);
  assert.doesNotMatch(home, /homeHeroAvifSources/);
  assert.doesNotMatch(home, /\.cover-expand-toggle\s*\{[^}]*backdrop-filter:\s*none/);
  assert.match(home, /data-full-srcset/);
  assert.match(home, /\.cover-full-viewport::after/);
  assert.match(home, /max-width:\s*none/);
  assert.match(home, /\.home-drawer\[data-waves-visible='true'\]/);
  assert.doesNotMatch(home, /\.home-cover\[data-waves-visible='true'\]/);

  assert.match(gesture, /HOME_COVER_DIRECTION_LOCK_DISTANCE\s*=\s*12/);
  assert.match(gesture, /HOME_COVER_DIRECTION_RATIO\s*=\s*1\.25/);
  assert.match(gesture, /HOME_COVER_SWIPE_DISTANCE\s*=\s*56/);
  assert.match(gesture, /HOME_COVER_SWIPE_MIN_DISTANCE\s*=\s*20/);
  assert.match(gesture, /HOME_COVER_SWIPE_VELOCITY\s*=\s*0\.11/);
  assert.match(gesture, /resolveHomeCoverProgress/);
  assert.match(gesture, /resolveHomeCoverRelease/);
  assert.match(gesture, /HOME_COVER_SETTLE_MIN_MS\s*=\s*140/);
  assert.match(gesture, /HOME_COVER_SETTLE_MAX_MS\s*=\s*240/);
  assert.match(gesture, /resolveHomeCoverTakeover/);
  assert.match(gesture, /Positive intent expands the wallpaper/);
  assert.match(gesture, /normalizeHomeCoverWheelIntent/);
  assert.match(motion, /ResizeObserver/);
  assert.match(motion, /\.animate\(/);
  assert.match(motion, /animation\.currentTime\s*=/);
  assert.match(motion, /cubicBezierCoordinate\(parameter, 0\.72, 1\)/);
  assert.match(motion, /DRAWER_EASING\s*=\s*'cubic-bezier\(0\.32, 0\.72, 0, 1\)'/);
  assert.match(motion, /settleAnimations\[0\]/);
  assert.match(motion, /scheduleLayoutUpdate/);
  assert.doesNotMatch(motion, /function tick|requestAnimationFrame\(tick\)/);
  assert.match(motion, /setPointerCapture/);
  assert.match(motion, /releasePointerCapture/);
  assert.match(motion, /trackedPenPointers\.size\s*>\s*1/);
  assert.match(motion, /event\.pointerType\s*!==\s*'pen'/);
  assert.match(motion, /\(hover:\s*hover\) and \(pointer:\s*fine\)/);
  assert.match(motion, /addEventListener\('wheel',\s*handleWheel,\s*\{\s*passive:\s*false\s*\}\)/);
  assert.match(motion, /addEventListener\('touchmove',\s*handleTouchMove,\s*\{\s*passive:\s*false\s*\}\)/);
  assert.match(motion, /pageScrollY:\s*window\.scrollY/);
  assert.doesNotMatch(motion, /isPointInside/);
  assert.doesNotMatch(motion, /clipPath|clip-path/);
  assert.match(motion, /createProgressAnimation\(stage/);
  assert.match(motion, /createProgressAnimation\(viewport/);
  assert.match(motion, /scale3d\(\$\{1 \/ scaleX\}, \$\{1 \/ scaleY\}/);
  assert.doesNotMatch(motion, /for \(const animation of dragAnimations\.splice\(0\)\) animation\.cancel\(\);[\s\S]{0,400}settleStable/);
  assert.match(geometry, /drawerDistance:\s*Math\.max\(input\.stageRect\.bottom\s*-\s*input\.sourceRect\.bottom/);
  assert.match(motion, /createProgressAnimation\(drawer/);
  assert.match(motion, /createProgressAnimation\(fullImage/);
  assert.doesNotMatch(motion, /createProgressAnimation\(source/);
  assert.doesNotMatch(motion, /opacity:\s*1\s*-\s*value/);
  assert.doesNotMatch(motion, /96\s*\*\s*value/);
  assert.match(motion, /requestHighResolution\(\)/);
  assert.match(motion, /IntersectionObserver/);
  assert.doesNotMatch(motion, /startViewTransition/);
  assert.match(motion, /addEventListener\('scroll', syncWheelListener, \{ passive: true \}\)/);
  assert.doesNotMatch(motion, /aria-modal|event\.key\s*===\s*'Tab'/);
  assert.match(motion, /prefers-reduced-motion:\s*reduce/);
  assert.match(motion, /event\.detail\s*===\s*0\s*\?\s*0/);
  assert.match(motion, /event\.key\s*!==\s*'Escape'/);
  assert.match(motion, /settleTo\(0,\s*0\)/);
  assert.doesNotMatch(motion, /createProgressAnimation\(sidebar/);
  assert.doesNotMatch(motion, /setElementUnavailable\(sidebar/);
  assert.match(motion, /stageLeft\s*=\s*sidebarIsVisible[\s\S]*sidebar\.getBoundingClientRect\(\)\.right\s*:\s*0/);
  assert.ok(motion.indexOf('const blueprint = cachedMotionBlueprint') < motion.indexOf('setElementUnavailable(drawer, false)'));
  assert.match(motion, /releaseHighResolution\(\)/);
  assert.match(home, /content-visibility:\s*auto/);
  assert.match(home, /\.home-drawer\s*\{[^}]*display:\s*flow-root/);
});

test('Worker 状态服务由 Pages 构建变量注入且写入开关独立', () => {
  const constants = readSource('consts.ts');
  const workflow = readFileSync(join(srcRoot, '..', '.github', 'workflows', 'deploy.yml'), 'utf8');

  assert.match(constants, /import\.meta\.env\.PUBLIC_ADMIN_SYNC_API_URL/);
  assert.match(constants, /import\.meta\.env\.PUBLIC_CLOUD_PUBLISH_ENABLED\s*===\s*'true'/);
  assert.match(workflow, /PUBLIC_ADMIN_SYNC_API_URL:\s*https:\/\/blog-test2-admin-api\.2799587522\.workers\.dev/);
  assert.match(workflow, /PUBLIC_CLOUD_PUBLISH_ENABLED:\s*'false'/);
});

test('首页维护记录有固定上限并提供完整归档页', () => {
  const home = readSource('pages/index.astro');
  const archive = readSource('pages/maintenance.astro');

  assert.match(home, /maintenanceEntries\.slice\(0, 3\)/);
  assert.match(home, /withBase\('\/maintenance\/'\)/);
  assert.match(archive, /parseMaintenance\(maintenanceSource\)/);
  assert.match(archive, /entries\.map/);
});

test('静态公共页不伪装成文章日期且单友链保持适宜宽度', () => {
  const layout = readSource('layouts/PublicContentLayout.astro');
  const about = readSource('pages/about.astro');
  const friends = readSource('pages/friends.astro');
  const friendLinks = readSource('components/widgets/FriendLinks.astro');

  assert.match(layout, /showDate\?: boolean/);
  assert.match(layout, /showDate = true/);
  assert.match(layout, /\{showDate && <div class="date">/);
  assert.match(about, /showDate=\{false\}/);
  assert.match(friends, /showDate=\{false\}/);
  assert.match(friends, /withBase\('\/friends\/guet-428\.svg'\)/);
  assert.doesNotMatch(friends, /GUET_428\/favicon\.svg/);
  assert.match(friendLinks, /data-count=\{links\.length\}/);
  assert.match(friendLinks, /\.friend-links\[data-count='1'\][\s\S]*grid-template-columns:\s*minmax\(0, 720px\)/);
});

test('文章总目录使用真实统计并将每个一级分类压缩为近期更新总览', () => {
  const page = readSource('pages/blog/index.astro');
  const list = readSource('components/blog/BlogList.astro');
  const recentLink = readSource('components/blog/DirectoryRecentLink.astro');
  const homeRecent = readSource('components/home/RecentPosts.astro');

  assert.match(page, /const posts = await getCollection\('blog'\)/);
  assert.match(page, /pubDate=\{latestPostDate\}/);
  assert.match(page, /hidePageHeader=\{true\}/);
  assert.doesNotMatch(page, /pubDate=\{new Date\(\)\}/);
  assert.match(page, /class="blog-directory-hero"/);
  assert.match(page, /\{posts\.length\}<\/strong> 篇文章/);
  assert.match(page, /<BlogList posts=\{posts\} sort="overview"/);

  assert.match(list, /class="directory-groups"/);
  assert.match(list, /class="directory-section"/);
  assert.match(list, /sort\?: 'time' \| 'oldest' \| 'dir' \| 'overview'/);
  assert.match(list, /const recentPosts = categoryPosts\.slice\(0, 3\)/);
  assert.match(list, /href=\{sort === 'overview' \? categoryHref : undefined\}/);
  assert.match(list, /<DirectoryRecentLink post=\{post\} \/>/);
  assert.match(list, /查看完整分类/);
  assert.match(list, /sort === 'overview' \? \([\s\S]*directory-overview-body/);

  assert.match(recentLink, /href=\{blogPostPath\(post\.id\)\}/);
  assert.match(recentLink, /plainDescription/);
  assert.match(recentLink, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(recentLink, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(homeRecent, /class="home-post-link" href=\{blogPostPath\(post\.id\)\}/);
});

test('文章目录以图案、一级分类和二级分类建立稳定层级', () => {
  const constants = readSource('consts.ts');
  const list = readSource('components/blog/BlogList.astro');
  const categoryHeader = readSource('components/blog/DirectoryCategoryHeader.astro');
  const row = readSource('components/blog/DirectoryPostRow.astro');
  const accordion = readSource('scripts/directory-accordion.ts');

  assert.match(constants, /'AI\/Agent协作与开发': \['Agent 工具链', 'Codex 故障排查'\]/);
  assert.match(constants, /'电控': \['TI小车实战', 'PID算法', 'RTOS-任务调度器', '灰度及循迹环PID', '滤波算法与陀螺仪驱动'\]/);
  assert.match(constants, /'电源': \[\]/);
  assert.match(constants, /'学习笔记': \['高等数学笔记'\]/);
  assert.match(constants, /'其他': \['站点指南'\]/);
  assert.match(list, /if \(\/学习\|笔记\/.test\(name\)\) return 'study'/);
  assert.match(list, /data-visual=\{resolveCategoryVisual\(dir1, displayIndex\)\}/);
  assert.match(list, /<DirectoryCategoryHeader/);
  assert.match(list, /<details class="directory-subsection" data-directory-accordion data-state="closed">/);
  assert.match(list, /directory-subsection-label">二级分类/);
  assert.match(list, /class="directory-third-level-heading"/);
  assert.match(list, /<ol class="directory-post-list">/);
  assert.match(list, /dir2 \|\| '未归入二级分类'/);
  assert.match(categoryHeader, /一级分类/);
  assert.match(categoryHeader, /data-visual=\{visual\}/);
  assert.match(categoryHeader, /visual === 'window'/);
  assert.match(categoryHeader, /visual === 'network'/);
  assert.match(categoryHeader, /visual === 'study'/);
  assert.match(categoryHeader, /directory-category-mark/);
  assert.match(row, /class="directory-post-order"/);
  assert.match(row, /class="directory-post-level">三级文章/);
  assert.match(row, /--directory-accent/);
  assert.match(accordion, /event\.detail === 0 \|\| reduceMotion\.matches/);
  assert.match(accordion, /duration = Math\.round\(Math\.max\(90, fullDuration \* distanceRatio\)\)/);
  assert.match(accordion, /cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.doesNotMatch(list, /max-height/);
});

test('高等数学文章归入明确的二级分类', () => {
  const importer = readSource('../scripts/import-calculus-notes.mjs');
  const noteRoot = join(srcRoot, 'content', 'blog', '学习笔记');
  const notes = readdirSync(noteRoot)
    .filter((name) => name.endsWith('.md'))
    .map((name) => readFileSync(join(noteRoot, name), 'utf8'));

  assert.match(importer, /const SUBCATEGORY = '高等数学笔记'/);
  assert.match(importer, /dir2: "\$\{SUBCATEGORY\}"/);
  assert.equal(notes.length, 4);
  for (const note of notes) assert.match(note, /^dir2: "高等数学笔记"$/m);
});

test('壁纸抽屉在进入视口前跳过远端模块绘制且保留键盘访问', () => {
  const home = readSource('pages/index.astro');
  const topics = readSource('components/home/TopicAtlas.astro');
  const recent = readSource('components/home/RecentPosts.astro');
  const motion = readSource('scripts/home-hero-motion.ts');

  assert.match(topics, /data-home-motion-cull/);
  assert.match(recent, /data-home-motion-cull/);
  assert.match(home, /class="home-info-strip"[^>]*data-home-motion-cull/);
  assert.match(home, /data-home-motion-offscreen='true'/);
  assert.match(motion, /cullOffscreenDrawerContent/);
  assert.match(motion, /restoreDrawerContent/);
  assert.match(motion, /handleKeyboardReveal/);
  assert.match(motion, /KEYBOARD_REVEAL_KEYS\.has\(event\.key\)/);
});

test('一级分类页展开二级目录与完整文章且不伪造页面日期', () => {
  const categoryPage = readSource('pages/blog/category/[...slug].astro');
  const urls = readSource('lib/urls.ts');
  const publicLayout = readSource('layouts/PublicContentLayout.astro');
  const postLayout = readSource('layouts/BlogPost.astro');

  assert.match(categoryPage, /pubDate=\{latestPostDate\}/);
  assert.match(categoryPage, /showDate=\{false\}/);
  assert.doesNotMatch(categoryPage, /pubDate=\{new Date\(\)\}/);
  assert.match(categoryPage, /hidePageHeader=\{!filterDir2\}/);
  assert.match(categoryPage, /<BlogList posts=\{filtered\} sort="dir" dirOrder=\{dirOrder\} \/>/);
  assert.match(categoryPage, /filterDir2 \? \([\s\S]*sort="oldest"/);
  assert.match(categoryPage, /返回全部分类/);
  assert.match(urls, /export function blogCategoryPath/);
  assert.match(urls, /export function blogCategorySegment/);
  assert.match(urls, /replaceAll\('\/', '~2F'\)/);
  assert.match(urls, /export function parseBlogCategorySegment/);
  assert.match(categoryPage, /blogCategorySegment\(dir1\)/);
  assert.match(categoryPage, /parseBlogCategorySegment\(segments\[0\]\)/);
  assert.match(publicLayout, /blogCategoryPath\(dir1, dir2\)/);
  assert.match(postLayout, /blogCategoryPath\(dir1, dir2\)/);
  assert.doesNotMatch(publicLayout, /encodeURIComponent\(dir1\)/);
  assert.doesNotMatch(postLayout, /encodeURIComponent\(dir1\)/);
});
