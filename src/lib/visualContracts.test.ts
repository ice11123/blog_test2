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
  assert.match(home, /\.cover-wave-track-back,\s*\.cover-wave-track-front\s*\{\s*animation:\s*none/);
});

test('高频导航即时可见且非文章页不渲染完整侧栏', () => {
  assert.doesNotMatch(readSource('layouts/BlogPost.astro'), /fade-in-on-scroll|class:list=\{\['fade-/);
  assert.doesNotMatch(readSource('layouts/PublicLayout.astro'), /SidebarLeft|sidebar-tree/);
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

test('移动文章树与 TOC 抽屉保持互斥', () => {
  const rightDrawer = readSource('scripts/sidebar-collapse.ts');
  const leftDrawer = readSource('scripts/sidebar-tree.ts');
  assert.match(rightDrawer, /getElementById\('leftSidebar'\)\?\.classList\.remove\('overlay-open'\)/);
  assert.match(leftDrawer, /classList\.remove\('mobile-sidebar-open'\)/);
});

test('中等桌面文章侧栏保留身份区最小可读宽度', () => {
  const sharedSidebar = readSource('styles/sidebar-shared.scss');
  assert.match(sharedSidebar, /max-width:\s*1099px[\s\S]*min-width:\s*900px[\s\S]*--sidebar-width:\s*180px/);
});

test('顶部栏背景全宽且导航内容保持居中约束', () => {
  const header = readSource('components/layout/Header.astro');
  assert.match(header, /header\s*\{[^}]*width:\s*100%/);
  assert.match(header, /\.site-nav\s*\{[^}]*width:\s*min\(1200px,\s*calc\(100%\s*-\s*48px\)\)[^}]*margin:\s*0 auto/);
  assert.doesNotMatch(header, /header\s*\{[^}]*width:\s*min\(1200px/);
});

test('主页使用专用个人侧栏并移除高饱和巨大字占位', () => {
  const home = readSource('pages/index.astro');
  const sidebar = readSource('components/home/HomeSidebar.astro');

  assert.match(home, /import HomeSidebar/);
  assert.match(home, /<HomeSidebar stats=\{stats\}/);
  assert.match(home, /grid-template-columns:\s*236px minmax\(0,\s*1fr\)/);
  assert.match(home, /class="document-preview"/);
  assert.doesNotMatch(home, /cover-letter|cover-grid|--cover-hue|home-intro/);

  assert.match(sidebar, /aria-current="page"/);
  assert.match(sidebar, /position:\s*sticky/);
  assert.match(sidebar, /max-width:\s*1099px[\s\S]*\.home-sidebar\s*\{\s*display:\s*none/);
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
