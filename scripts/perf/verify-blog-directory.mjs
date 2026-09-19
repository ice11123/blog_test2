import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const baseUrl = arg('url', 'http://127.0.0.1:4331/blog_test2/');
const output = resolve(arg('output', 'artifacts/performance/blog-directory'));
const directoryUrl = new URL('blog/', baseUrl).href;
const categoryUrl = new URL('blog/category/AI~2FAgent%E5%8D%8F%E4%BD%9C%E4%B8%8E%E5%BC%80%E5%8F%91/', baseUrl).href;
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
    await page.waitForSelector('.directory-recent-item');

    const metrics = await page.evaluate(() => ({
      title: document.querySelector('.blog-directory-hero h1')?.textContent?.trim(),
      sections: document.querySelectorAll('.directory-section').length,
      recentRows: document.querySelectorAll('.directory-recent-item').length,
      displayedTotal: Number.parseInt(document.querySelector('.blog-directory-total strong')?.textContent ?? '', 10),
      levelOneLabels: document.querySelectorAll('.directory-level-label').length,
      levelTwoLabels: document.querySelectorAll('.directory-subsection-label').length,
      recentRowsPerSection: [...document.querySelectorAll('.directory-section')].map((section) => section.querySelectorAll('.directory-recent-item').length),
      categoryLinks: [...document.querySelectorAll('.directory-header-content.is-link')].map((link) => link.getAttribute('href')),
      articleLinks: [...document.querySelectorAll('.directory-recent-link')].map((link) => link.getAttribute('href')),
      categoryVisuals: [...document.querySelectorAll('.directory-section')].map((node) => node.getAttribute('data-visual')),
      fakeDateCount: document.querySelectorAll('.public-content-page > .prose > .title .date').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));

    assert.equal(metrics.title, '文章目录');
    assert.ok(metrics.sections >= 1, '应至少渲染一个分类面板');
    assert.ok(metrics.recentRows > 0, '目录页应至少渲染一篇近期文章');
    assert.ok(metrics.recentRows <= metrics.displayedTotal, '总览近期文章不应超过文章总数');
    assert.ok(metrics.recentRowsPerSection.every((count) => count <= 3), '每个分类最多展示 3 篇近期文章');
    assert.equal(metrics.levelOneLabels, metrics.sections, '每个一级分类都应具有明确层级标签');
    assert.equal(metrics.levelTwoLabels, 0, '总目录不应展开二级分类');
    assert.equal(metrics.categoryLinks.length, metrics.sections, '每个一级分类应可进入分类页');
    assert.ok(metrics.categoryLinks.every((href) => href?.includes('/blog/category/')), '一级分类入口应指向分类页');
    assert.ok(metrics.articleLinks.every((href) => href?.includes('/blog/') && !href.includes('/category/')), '近期文章应直达正文');
    assert.equal(new Set(metrics.categoryVisuals).size, metrics.sections, '当前一级分类应使用不同身份图案');
    assert.equal(metrics.fakeDateCount, 0, '目录页不应显示伪造的页面日期');
    assert.equal(metrics.overflow, false, `${viewport.width}px 视口出现横向溢出`);

    await page.goto(categoryUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.directory-post');
    const categoryMetrics = await page.evaluate(() => ({
      sections: document.querySelectorAll('.directory-section').length,
      levelTwoLabels: document.querySelectorAll('.directory-subsection-label').length,
      rows: document.querySelectorAll('.directory-post').length,
      fakeDateCount: document.querySelectorAll('.public-content-page > .prose > .title .date').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      backHref: document.querySelector('.category-context a')?.getAttribute('href'),
    }));
    assert.equal(categoryMetrics.sections, 1, '一级分类页只应展开当前分类');
    assert.ok(categoryMetrics.levelTwoLabels >= 1, '一级分类页应展示二级目录');
    assert.ok(categoryMetrics.rows > 0, '一级分类页应展示完整文章列表');
    assert.equal(categoryMetrics.fakeDateCount, 0, '分类页不应显示伪造日期');
    assert.equal(categoryMetrics.overflow, false, `${viewport.width}px 分类页出现横向溢出`);
    assert.ok(categoryMetrics.backHref?.endsWith('/blog/'), '分类页应能返回总目录');

    await page.screenshot({ path: join(output, `${viewport.width}-category-light.png`), fullPage: true });
    await page.goto(directoryUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.directory-recent-item');
    await page.screenshot({ path: join(output, `${viewport.width}-light.png`), fullPage: true });
    await page.locator('#theme-switcher-btn').click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(output, `${viewport.width}-dark.png`), fullPage: true });

    report.push({ viewport, metrics, categoryMetrics, errors });
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ directoryUrl, report }, null, 2));
