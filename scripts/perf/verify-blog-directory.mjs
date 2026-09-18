import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const baseUrl = arg('url', 'http://127.0.0.1:4331/blog_test2/');
const output = resolve(arg('output', 'artifacts/performance/blog-directory'));
const directoryUrl = new URL('blog/', baseUrl).href;
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
    const context = await browser.newContext({ viewport, deviceScaleFactor: viewport.width < 680 ? 2 : 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(directoryUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.directory-post');

    const metrics = await page.evaluate(() => ({
      title: document.querySelector('.blog-directory-hero h1')?.textContent?.trim(),
      sections: document.querySelectorAll('.directory-section').length,
      rows: document.querySelectorAll('.directory-post').length,
      displayedTotal: Number.parseInt(document.querySelector('.blog-directory-total strong')?.textContent ?? '', 10),
      fakeDateCount: document.querySelectorAll('.public-content-page > .prose > .title .date').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      rowHeights: [...document.querySelectorAll('.directory-post-link')].map((node) => node.getBoundingClientRect().height),
    }));

    assert.equal(metrics.title, '文章目录');
    assert.ok(metrics.sections >= 1, '应至少渲染一个分类面板');
    assert.ok(metrics.rows > 0, '目录页应至少渲染一篇文章');
    assert.equal(metrics.rows, metrics.displayedTotal, '文章行数量应与页面统计一致');
    assert.equal(metrics.fakeDateCount, 0, '目录页不应显示伪造的页面日期');
    assert.equal(metrics.overflow, false, `${viewport.width}px 视口出现横向溢出`);
    assert.ok(Math.max(...metrics.rowHeights) < (viewport.width < 680 ? 190 : 150), '文章行不够紧凑');

    await page.screenshot({ path: join(output, `${viewport.width}-light.png`), fullPage: true });
    await page.locator('#theme-switcher-btn').click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(output, `${viewport.width}-dark.png`), fullPage: true });

    report.push({ viewport, metrics, errors });
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ directoryUrl, report }, null, 2));
