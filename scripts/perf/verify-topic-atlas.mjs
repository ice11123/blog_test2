import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const baseUrl = arg('url', 'http://127.0.0.1:4331/blog_test2/');
const output = resolve(arg('output', 'artifacts/performance/topic-atlas'));
const proxy = arg('proxy', '');

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
  ...(proxy ? { proxy: { server: proxy } } : {}),
});
const report = [];

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.width < 680 ? 2 : 1 });
      await context.addInitScript((selectedTheme) => localStorage.setItem('blog-test2-theme', selectedTheme), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.topic-card');
      await page.locator('.control-art img').evaluate((image) => image.decode());

      const metrics = await page.evaluate(() => ({
        names: [...document.querySelectorAll('.topic-card h3')].map((node) => node.textContent?.trim()),
        cardLinks: [...document.querySelectorAll('.topic-card-link')].map((node) => node.getAttribute('href')),
        recentLinks: [...document.querySelectorAll('.topic-recent li a')].map((node) => node.getAttribute('href')),
        emptyCards: document.querySelectorAll('.topic-empty').length,
        codexMarks: document.querySelectorAll('.codex-emblem').length,
        controlImages: document.querySelectorAll('.control-art img').length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }));

      assert.deepEqual(metrics.names, ['AI/Agent协作与开发', '电控', '电源', '其他']);
      assert.equal(metrics.cardLinks.length, 4);
      assert.ok(metrics.cardLinks.every((href) => href?.includes('/blog/category/')));
      assert.ok(metrics.recentLinks.every((href) => href?.includes('/blog/') && !href.includes('/category/')));
      assert.equal(metrics.codexMarks, 1);
      assert.equal(metrics.controlImages, 1);
      assert.equal(metrics.overflow, false, `${viewport.width}px ${theme} 主题出现横向溢出`);

      const firstCard = page.locator('.topic-card').first();
      if (viewport.width >= 900) {
        await firstCard.locator('.topic-card-link').hover();
        const cardTransform = await firstCard.evaluate((node) => getComputedStyle(node).transform);
        assert.notEqual(cardTransform, 'none', '整卡悬停应提供明确视觉反馈');

        await firstCard.locator('.topic-recent a').first().hover();
        const nestedState = await firstCard.evaluate((node) => ({
          cardTransform: getComputedStyle(node).transform,
          linkBackground: getComputedStyle(node.querySelector('.topic-recent a')).backgroundColor,
        }));
        assert.equal(nestedState.cardTransform, 'none', '内部文章悬停不应错误抬起父卡片');
        assert.notEqual(nestedState.linkBackground, 'rgba(0, 0, 0, 0)', '内部文章应有独立视觉反馈');
      }

      await page.screenshot({ path: join(output, `${viewport.width}-${theme}.png`), fullPage: true });
      report.push({ viewport, theme, metrics, errors });
      assert.deepEqual(errors, []);
      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ baseUrl, report }, null, 2));
