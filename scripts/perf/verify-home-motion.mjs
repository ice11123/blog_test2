import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const url = arg('url', 'http://127.0.0.1:4329/blog_test2/');
const output = resolve(arg('output', 'artifacts/performance/review'));
let playwright;
try {
  playwright = await import('playwright');
} catch {
  const root = arg('playwright-root', process.env.PLAYWRIGHT_MODULE_ROOT);
  if (!root) throw new Error('请通过 --playwright-root 指定已有 Playwright 包目录，无需安装项目依赖。');
  playwright = await import(pathToFileURL(join(root, 'playwright', 'index.mjs')).href);
}
await mkdir(output, { recursive: true });
const browser = await playwright.chromium.launch({
  channel: arg('channel', 'msedge'),
  headless: true,
  ...(arg('proxy', '') ? { proxy: { server: arg('proxy', '') } } : {}),
});
const report = { url, browser: browser.version(), results: [] };

try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      deviceScaleFactor: width === 390 ? 3 : 1,
      isMobile: width === 390,
      hasTouch: width === 390,
      colorScheme: 'light',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const state = (value) => page.waitForFunction((expected) => document.querySelector('[data-home-cover]')?.dataset.state === expected, value);
    await state('collapsed');
    await page.locator('[data-home-hero-photo]').evaluate((image) => image.decode());
    if (width > 999) await page.locator('.profile-avatar img').evaluate((image) => image.decode());
    const toggle = page.locator('[data-home-cover-toggle]');
    const header = await page.locator('#site-header').boundingBox();
    const sidebar = width > 999 ? await page.locator('[data-persistent-sidebar]').boundingBox() : null;
    await page.screenshot({ path: join(output, `${width}-light-collapsed.png`) });

    const initialCull = await page.evaluate(() => {
      const candidates = [...document.querySelectorAll('[data-home-motion-cull]')];
      const hidden = candidates.filter((node) => node.getAttribute('data-home-motion-offscreen') === 'true');
      const hiddenInViewport = hidden.filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.bottom >= 0 && rect.top <= window.innerHeight;
      });
      return { candidates: candidates.length, hidden: hidden.length, hiddenInViewport: hiddenInViewport.length };
    });
    assert.ok(initialCull.candidates > 0 && initialCull.hidden > 0, '稳定首屏应跳过视口外主页模块绘制');
    assert.equal(initialCull.hiddenInViewport, 0, '视口内模块不得被性能优化隐藏');

    const lastCullCandidate = page.locator('[data-home-motion-cull]').last();
    await lastCullCandidate.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    assert.notEqual(
      await lastCullCandidate.getAttribute('data-home-motion-offscreen'),
      'true',
      '模块接近视口时必须恢复绘制',
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => window.scrollY <= 1);

    if (width > 999) {
      // 鼠标停在顶栏，验证全局滚轮入口，而非图片坐标命中。
      await page.mouse.move(720, 30);
      await page.mouse.wheel(0, -600);
    } else {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 230 }] });
      for (let y = 250; y <= 410; y += 20) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y }] });
        await page.waitForTimeout(25);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await cdp.detach();
    }
    await state('expanded');
    await page.waitForTimeout(100);
    const expandedHeader = await page.locator('#site-header').boundingBox();
    assert.ok(Math.abs(header.y - expandedHeader.y) < 1, '展开期间顶栏必须固定');
    if (sidebar) {
      const expandedSidebar = await page.locator('[data-persistent-sidebar]').boundingBox();
      assert.ok(Math.abs(sidebar.x - expandedSidebar.x) < 1 && Math.abs(sidebar.y - expandedSidebar.y) < 1, '左栏必须固定');
    }
    await page.screenshot({ path: join(output, `${width}-light-expanded.png`) });
    await page.locator('#theme-switcher-btn').click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark' && !document.documentElement.dataset.themeTransition);
    await page.locator('[data-home-hero-photo]').evaluate((image) => image.decode());
    await page.screenshot({ path: join(output, `${width}-dark-expanded.png`) });
    await page.keyboard.press('Escape');
    await state('collapsed');

    // 连续中断同一个真实点击处理器，避免自动化工具等到动画停止才点击。
    for (let index = 0; index < 10; index += 1) {
      await toggle.dispatchEvent('click', { detail: 1 });
      await page.waitForTimeout(40);
    }
    await state('collapsed');
    await page.waitForTimeout(150);
    const stable = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      inert: document.querySelector('[data-home-lower-motion]').inert,
      hidden: getComputedStyle(document.querySelector('[data-home-lower-motion]')).visibility === 'hidden',
      locked: getComputedStyle(document.documentElement).overflowY === 'hidden',
      runningWaves: [...document.querySelectorAll('.cover-wave-layer')].every((layer) => getComputedStyle(layer).animationPlayState === 'running'),
    }));
    assert.deepEqual(stable, { overflow: false, inert: false, hidden: false, locked: false, runningWaves: true });
    await page.screenshot({ path: join(output, `${width}-dark-collapsed.png`) });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await toggle.click();
    await state('expanded');
    await page.keyboard.press('Escape');
    await state('collapsed');
    assert.equal(await page.locator('.cover-wave-layer').first().evaluate((node) => getComputedStyle(node).animationName), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('#site-header a[href$="/about/"]').click();
    await page.waitForURL('**/about/');
    assert.equal(await page.locator('[data-home-cover]').count(), 0);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY === 'hidden'), false);
    assert.deepEqual(errors, []);
    report.results.push({ width, gestures: true, reverseClicks: 10, theme: true, reducedMotion: true, routeCleanup: true, errors });
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(join(output, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
