import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const arg = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const baseUrl = arg('url', 'http://127.0.0.1:4337/blog_test2/');
const output = resolve(arg('output', 'artifacts/performance/reading-ui-2026-10-05'));
const root = arg('playwright-root', process.env.PLAYWRIGHT_MODULE_ROOT);
const { chromium } = await import(pathToFileURL(join(root, 'playwright', 'index.mjs')).href);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { baseUrl, browser: browser.version(), layout: [], interactions: {}, directoryPerformance: {} };
const articlePath = 'blog/学习笔记/09-analytic-geometry-vector-analysis/';
const git = args => execFileSync('git', ['-c', 'core.quotepath=false', ...args], { encoding: 'utf8' }).trim();
const sources = [...new Set(`${git(['diff', '--name-only', 'HEAD'])}\n${git(['ls-files', '--others', '--exclude-standard'])}`.split('\n'))]
  .filter(path => path.startsWith('src/') || path === 'package.json').sort();
const sourceHash = createHash('sha256');
for (const path of sources) sourceHash.update(path).update('\0').update(await readFile(path)).update('\0');
report.subject = { baseCommit: git(['rev-parse', 'HEAD']), kind: 'local-uncommitted-worktree', changedSourceSha256: sourceHash.digest('hex'), sources };

try {
  for (const width of [1440, 1100, 1024, 390, 320]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: width < 680 ? 844 : 900 } });
      await context.addInitScript(theme => localStorage.setItem('blog-test2-theme', theme), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseUrl);
      await page.locator('.topic-control').scrollIntoViewIfNeeded();
      await page.locator('.control-art img').evaluate(image => image.decode());
      const geometry = await page.locator('.topic-card').evaluateAll(cards => cards.map(card => {
        const rect = element => element.getBoundingClientRect();
        const intro = rect(card.querySelector('.topic-intro'));
        const art = rect(card.querySelector('.topic-art'));
        const recent = rect(card.querySelector('.topic-recent'));
        return { name: card.dataset.topic, gap: art.left - intro.right, verticalGap: recent.top - art.bottom };
      }));
      for (const card of geometry) {
        assert.ok(card.gap >= -1, `${width}/${theme}/${card.name} 素材侵入文字安全区`);
        assert.ok(card.verticalGap >= -1, `${width}/${theme}/${card.name} 素材侵入近期入口`);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: join(output, `atlas-${width}-${theme}.png`) });
      await page.goto(new URL(articlePath, baseUrl).href);
      await page.waitForSelector('#toc-list li', { state: 'attached' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('.article-kicker time').count(), 0);
      assert.equal(await page.locator('[rel="prev"]').count(), 1);
      assert.equal(await page.locator('[rel="next"]').count(), 1);
      if (width < 1100) {
        await page.locator('[data-reading-toc]').click();
        await page.waitForTimeout(260);
        assert.equal(await page.locator('[data-reading-toc]').getAttribute('aria-expanded'), 'true');
        const targetText = await page.locator('#toc-list a').nth(3).innerText();
        await page.locator('#toc-list a').nth(3).click();
        await page.waitForFunction(text => document.querySelector('[data-reading-section]')?.textContent === text, targetText);
        assert.equal(await page.locator('html').getAttribute('data-mobile-sidebar'), null);
        assert.equal(await page.locator('[data-reading-section]').innerText(), targetText);
        assert.ok((await page.locator('[data-reading-percent]').innerText()) !== '0%');
      }
      await page.screenshot({ path: join(output, `article-${width}-${theme}.png`) });
      assert.deepEqual(errors, []);
      report.layout.push({ width, theme, geometry, errors });
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const requests = [];
  const interactionErrors = [];
  page.on('pageerror', error => interactionErrors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto(baseUrl);
  assert.equal(requests.some(url => /image-viewer.*\.js/.test(url)), false);
  await page.locator('[data-sidebar-tab="tags"]').click();
  await page.locator('[data-tag-filter]').fill('GitHub');
  assert.equal(await page.locator('[data-tag-name]:visible').count(), 2);
  assert.equal(await page.locator('[data-tag-count]').innerText(), '2 / 151 个标签');
  const tagOverflow = await page.locator('[data-tag-name]:visible span').evaluateAll(spans => spans.some(span => span.scrollWidth > span.clientWidth + 1));
  assert.equal(tagOverflow, false);
  await page.screenshot({ path: join(output, 'tag-filter.png') });
  await page.locator('[data-sidebar-tab="profile"]').click();
  await page.locator('[data-sidebar-tab="profile"]').press('End');
  assert.equal(await page.locator('[data-sidebar-tab="tags"]').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('.sidebar-active-track').evaluate(track => getComputedStyle(track).transitionDuration), '0s');

  // 真实网络失败与原位重试，不只验证模板中的状态文字。
  await page.route('**/search/*.json', route => route.abort());
  await page.keyboard.press('Control+k');
  await page.waitForSelector('#search-modal[data-search-state="error"]');
  await page.unroute('**/search/*.json');
  await page.locator('[data-search-retry]').click();
  await page.waitForSelector('#search-modal[data-search-state="idle"]');
  await page.locator('#search-input').fill('向量');
  await page.waitForSelector('.search-result-item');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#search-input').getAttribute('aria-activedescendant'), 'search-result-0');
  await page.locator('#search-input').fill('zzzxxyy-no-result');
  await page.waitForSelector('#search-modal[data-search-state="empty"]');
  await page.keyboard.press('Escape');

  await page.goto(new URL(articlePath, baseUrl).href);
  const image = page.locator('.article-image-zoomable').first();
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(image => image.decode());
  await image.focus();
  const scrollBefore = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.article-image-viewer[open]');
  await page.screenshot({ path: join(output, 'image-viewer.png') });
  await page.locator('[data-action="zoom"]').click();
  assert.match(await page.locator('.image-viewer-stage img').getAttribute('style'), /scale\(2\)/);
  assert.equal(await page.locator('[data-action="zoom"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('[data-action="zoom"]').getAttribute('aria-label'), '恢复原始缩放');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.article-image-viewer').count(), 0);
  assert.ok(await image.evaluate(image => document.activeElement === image));
  const scrollAfter = await page.evaluate(() => scrollY);
  assert.ok(Math.abs(scrollAfter - scrollBefore) < 1, `关闭图片查看器后位置偏移：${scrollBefore} → ${scrollAfter}`);
  await image.click();
  await page.waitForSelector('.article-image-viewer[open]');
  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  assert.equal(await page.locator('.article-image-viewer').count(), 0);
  assert.notEqual(await page.evaluate(() => document.documentElement.style.overflow), 'hidden');

  // 真实 Astro 导航后不能重复生成阅读入口或图片交互。
  await page.locator('[rel="prev"]').click();
  await page.waitForURL(/08-infinite-series/);
  await page.waitForSelector('.article-image-zoomable');
  assert.equal(await page.locator('[data-reading-toc]').count(), 1);
  assert.equal(await page.locator('.series-reading-nav').count(), 1);
  assert.equal(await page.locator('.article-image-viewer').count(), 0);

  // 验证失败的正文图片能够原位重新请求，而不是仅存在一个重试模板。
  await page.goto(new URL(articlePath, baseUrl).href);
  const failedImage = page.locator('.article-image-zoomable').first();
  const imageUrl = await failedImage.getAttribute('src');
  const failedUrl = new URL(imageUrl, page.url()).href;
  await page.route(failedUrl, route => route.abort());
  await page.reload();
  await failedImage.scrollIntoViewIfNeeded();
  const retry = failedImage.locator('xpath=following-sibling::button[contains(@class,"article-image-retry")]');
  await retry.waitFor({ state: 'visible' });
  await page.unroute(failedUrl);
  await retry.click();
  await failedImage.evaluate(image => image.decode());
  await retry.waitFor({ state: 'detached' });
  report.interactions = { tags: true, keyboardTabs: true, searchFailureRetry: true, searchEmpty: true, imageZoomFocusScrollRestore: true, routeCleanup: true, actualAstroNavigation: true, imageFailureRetry: true };

  await page.goto(new URL('blog/category/学习笔记/', baseUrl).href);
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => {
    window.__motion = { frames: [], tasks: [] };
    let previous = 0;
    window.__observer = new PerformanceObserver(list => window.__motion.tasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, duration: entry.duration }))));
    window.__observer.observe({ entryTypes: ['longtask'] });
    const step = time => { if (previous) window.__motion.frames.push({ time, duration: time - previous }); previous = time; window.__frame = requestAnimationFrame(step); };
    window.__frame = requestAnimationFrame(step);
  });
  const summary = page.locator('[data-directory-accordion] summary').first();
  const start = await page.evaluate(() => performance.now());
  await summary.click();
  await page.waitForTimeout(300);
  await summary.click();
  await page.waitForTimeout(250);
  const metrics = await page.evaluate(start => {
    cancelAnimationFrame(window.__frame);
    window.__observer.disconnect();
    const frames = window.__motion.frames.filter(frame => frame.time >= start).map(frame => frame.duration).sort((a, b) => a - b);
    return { max: frames.at(-1), p95: frames[Math.floor(frames.length * .95)], longTasks: window.__motion.tasks.filter(task => task.start >= start) };
  }, start);
  report.directoryPerformance = { cpu: 4, ...metrics, withinBudget: metrics.max < 33 && metrics.p95 < 16.7 && metrics.longTasks.length === 0 };
  await session.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await context.close();

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  reducedPage.on('pageerror', error => interactionErrors.push(error.message));
  await reducedPage.goto(new URL(articlePath, baseUrl).href);
  await reducedPage.locator('[data-reading-toc]').click();
  assert.equal(await reducedPage.locator('html').getAttribute('data-mobile-sidebar'), 'right');
  assert.equal(await reducedPage.locator('.article-toc-sidebar').evaluate(element => getComputedStyle(element).transitionDuration), '0s');
  await reducedPage.keyboard.press('Escape');
  assert.equal(await reducedPage.locator('html').getAttribute('data-mobile-sidebar'), null);
  await reducedPage.goto(new URL('blog/category/学习笔记/', baseUrl).href);
  const reducedSummary = reducedPage.locator('[data-directory-accordion] summary').first();
  await reducedSummary.click();
  assert.equal(await reducedPage.locator('[data-directory-accordion]').first().getAttribute('data-state'), 'open');
  assert.equal(await reducedPage.evaluate(() => document.querySelector('[data-directory-panel]').getAnimations().length), 0);
  report.interactions.reducedMotion = true;
  report.interactions.runtimeErrors = interactionErrors;
  assert.deepEqual(interactionErrors, []);
  await reduced.close();
} finally {
  await browser.close();
  await writeFile(join(output, 'verification.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
