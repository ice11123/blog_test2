import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const arg = (name, fallback) => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const output = resolve(arg('output', 'artifacts/performance/reading-ui-2026-10-05/directory'));
const root = arg('playwright-root', process.env.PLAYWRIGHT_MODULE_ROOT);
const { chromium } = await import(pathToFileURL(join(root, 'playwright', 'index.mjs')).href);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const variant = arg('variant', 'baseline');
const report = { browser: browser.version(), cpu: 4, variant, rounds: [] };

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(arg('url', 'http://127.0.0.1:4337/blog_test2/blog/category/学习笔记/'));
  if (variant === 'wrap') await page.addStyleTag({ content: '.directory-post h4 { text-wrap: wrap !important; }' });
  if (variant === 'contain') await page.addStyleTag({ content: '.directory-post { content-visibility: auto; contain-intrinsic-size: auto 132px; }' });
  if (variant === 'layout') await page.addStyleTag({ content: '.directory-subsection-panel-inner { contain: inline-size layout style; } .directory-post { contain: layout style; }' });
  if (variant === 'flex') await page.addStyleTag({ content: '.directory-groups, .directory-subsection-stack, .directory-post-list { display: flex; flex-direction: column; }' });
  const summary = page.locator('[data-directory-accordion] summary').first();
  await page.waitForSelector('[data-accordion-ready="true"]');
  await page.evaluate(() => document.fonts.ready);
  await summary.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const details = document.querySelector('[data-directory-accordion]');
    window.__directoryPerf = { frames: [], tasks: [], windows: [] };
    const data = window.__directoryPerf;
    let previous = 0;
    const tick = time => {
      if (previous) data.frames.push({ start: previous, end: time, duration: time - previous });
      previous = time;
      window.__directoryFrame = requestAnimationFrame(tick);
    };
    window.__directoryFrame = requestAnimationFrame(tick);
    window.__directoryTaskObserver = new PerformanceObserver(list => {
      data.tasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, duration: entry.duration })));
    });
    window.__directoryTaskObserver.observe({ entryTypes: ['longtask'] });
    details.querySelector('summary').addEventListener('click', () => {
      const sample = { start: performance.now(), end: null, action: details.open ? 'close' : 'open' };
      data.windows.push(sample);
      performance.mark(`directory-${data.windows.length}-start`);
    }, { capture: true });
    window.__directoryMutationObserver = new MutationObserver(() => {
      const current = data.windows.at(-1);
      if (current && current.end === null && ['open', 'closed'].includes(details.dataset.state)) {
        current.end = performance.now();
        performance.mark(`directory-${data.windows.length}-end`);
      }
    });
    window.__directoryMutationObserver.observe(details, { attributes: true, attributeFilter: ['data-state'] });
  });
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,blink.user_timing', transferMode: 'ReturnAsStream' });
  for (let round = 0; round < 3; round++) {
    await summary.click();
    await page.waitForFunction(() => document.querySelector('[data-directory-accordion]').dataset.state === 'open');
    await page.waitForTimeout(150);
    await summary.click();
    await page.waitForFunction(() => document.querySelector('[data-directory-accordion]').dataset.state === 'closed');
    await page.waitForTimeout(150);
  }
  const complete = new Promise(resolveComplete => cdp.once('Tracing.tracingComplete', resolveComplete));
  await cdp.send('Tracing.end');
  const { stream } = await complete;
  let traceText = '';
  while (true) {
    const chunk = await cdp.send('IO.read', { handle: stream });
    traceText += chunk.base64Encoded ? Buffer.from(chunk.data, 'base64').toString('utf8') : chunk.data;
    if (chunk.eof) break;
  }
  await cdp.send('IO.close', { handle: stream });
  await writeFile(join(output, 'directory.trace.json.gz'), gzipSync(traceText));
  const trace = JSON.parse(traceText);
  report.timeline = Object.fromEntries(['Layout', 'Paint', 'UpdateLayoutTree', 'FunctionCall', 'EventDispatch'].map(name => {
    const events = trace.traceEvents.filter(event => event.name === name && event.ph === 'X');
    return [name, { count: events.length, totalMs: events.reduce((total, event) => total + (event.dur ?? 0), 0) / 1000, maxMs: Math.max(0, ...events.map(event => (event.dur ?? 0) / 1000)) }];
  }));
  report.rounds = await page.evaluate(() => {
    cancelAnimationFrame(window.__directoryFrame);
    window.__directoryTaskObserver.disconnect();
    window.__directoryMutationObserver.disconnect();
    const data = window.__directoryPerf;
    return data.windows.map(window => {
      const frames = data.frames.filter(frame => frame.end >= window.start && frame.start <= window.end).map(frame => frame.duration).sort((a, b) => a - b);
      return { ...window, count: frames.length, maxMs: frames.at(-1), p95Ms: frames[Math.max(0, Math.ceil(frames.length * .95) - 1)], longTasks: data.tasks.filter(task => task.start < window.end && task.start + task.duration > window.start) };
    });
  });
  assert.equal(report.rounds.length, 6);
  assert.ok(report.rounds.every(round => round.end !== null));
  report.budget = { maxFrameMs: 33, p95FrameMs: 16.7, animationLongTasks: 0 };
  report.withinBudget = report.rounds.every(round => round.maxMs < 33 && round.p95Ms < 16.7 && round.longTasks.length === 0);
  await context.close();
} finally {
  await browser.close();
  await writeFile(join(output, 'measurement.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
