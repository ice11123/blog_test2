import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const baseUrl = arg('url', 'http://127.0.0.1:4329/blog_test2/');
const output = resolve(arg('output', 'artifacts/performance/mobile-sidebars'));
const articleUrl = new URL('blog/博客功能介绍与演示/欢迎使用/', baseUrl).href;
let playwright;
try {
  playwright = await import('playwright');
} catch {
  const root = arg('playwright-root', process.env.PLAYWRIGHT_MODULE_ROOT);
  if (!root) throw new Error('请通过 --playwright-root 指定已有 Playwright 包目录，无需安装项目依赖。');
  playwright = await import(pathToFileURL(join(root, 'playwright', 'index.mjs')).href);
}

await mkdir(output, { recursive: true });
const browser = await playwright.chromium.launch({ channel: arg('channel', 'msedge'), headless: true });
const report = { baseUrl, browser: browser.version(), results: [] };

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-mobile-sidebar-toggle="left"]:not([disabled])');
    await page.locator('[data-home-hero-photo]').evaluate((image) => image.decode());
    assert.equal(await page.locator('[data-mobile-sidebar-toggle="right"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    assert.equal(await page.locator('[data-persistent-sidebar]').evaluate((node) => node.inert), true);
    await page.screenshot({ path: join(output, `${viewport.width}-home-collapsed.png`) });

    const headerBefore = await page.locator('#site-header').boundingBox();
    await page.locator('[data-mobile-sidebar-toggle="left"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.mobileSidebar === 'left');
    await page.waitForTimeout(280);
    const [drawer, headerAfter] = await Promise.all([
      page.locator('[data-persistent-sidebar]').boundingBox(),
      page.locator('#site-header').boundingBox(),
    ]);
    const drawerDebug = await page.locator('[data-persistent-sidebar]').evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        position: style.position,
        top: style.top,
        bottom: style.bottom,
        height: style.height,
        transform: style.transform,
        headerVariable: getComputedStyle(document.documentElement).getPropertyValue('--public-header-height'),
        scrollY: window.scrollY,
        rect: node.getBoundingClientRect().toJSON(),
        innerHeight: window.innerHeight,
        visualViewport: window.visualViewport ? { height: window.visualViewport.height, offsetTop: window.visualViewport.offsetTop, scale: window.visualViewport.scale } : null,
      };
    });
    assert.ok(drawer && headerBefore && headerAfter);
    assert.ok(
      Math.abs(drawer.x) < 1 && Math.abs(drawer.y - (headerAfter.y + headerAfter.height)) < 1,
      `移动抽屉位置异常：${JSON.stringify({ drawer, headerAfter, drawerDebug })}`,
    );
    assert.ok(Math.abs(headerBefore.y - headerAfter.y) < 1);
    assert.equal(await page.locator('[data-persistent-sidebar]').evaluate((node) => node.inert), false);
    await page.locator('[data-sidebar-tab="catalog"]').click();
    assert.equal(await page.locator('#sidebar-panel-catalog').isVisible(), true);
    await page.locator('[data-sidebar-tab="tags"]').click();
    assert.equal(await page.locator('#sidebar-panel-tags').isVisible(), true);
    await page.screenshot({ path: join(output, `${viewport.width}-home-left-open.png`) });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-mobile-sidebar'));

    await page.goto(articleUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-mobile-sidebar-toggle="right"]:not([disabled])');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    await page.locator('[data-mobile-sidebar-toggle="right"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.mobileSidebar === 'right');
    await page.waitForTimeout(280);
    assert.ok(await page.locator('#toc-list button').count() > 0);
    assert.equal(await page.locator('[data-article-toc-sidebar]').evaluate((node) => node.inert), false);
    await page.screenshot({ path: join(output, `${viewport.width}-article-right-open.png`) });
    await page.locator('#toc-list button').first().click();
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-mobile-sidebar'));

    await page.locator('[data-mobile-sidebar-toggle="left"]').click();
    await page.locator('[data-mobile-sidebar-toggle="right"]').click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.mobileSidebar), 'right');
    assert.equal(await page.locator('[data-mobile-sidebar-toggle="left"]').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('[data-mobile-sidebar-toggle="right"]').getAttribute('aria-expanded'), 'true');
    assert.deepEqual(errors, []);

    report.results.push({ viewport, homeLeft: true, articleRight: true, noOverflow: true, errors });
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(articleUrl, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('[data-mobile-sidebar-toggle="left"]').isVisible(), false);
  assert.equal(await page.locator('[data-persistent-sidebar]').evaluate((node) => node.inert), false);
  report.results.push({ viewport: { width: 1440, height: 900 }, desktopUnchanged: true });
  await context.close();
} finally {
  await browser.close();
}

await writeFile(join(output, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
