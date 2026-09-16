import { gzipSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_URL = 'http://127.0.0.1:4329/blog_test2/';
const DEFAULT_OUTPUT = resolve('artifacts/performance');
const profiles = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, cpuRate: 1 },
  desktopCpu4: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, cpuRate: 4 },
  wideDpr2: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, cpuRate: 1 },
  mobileCpu4: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    cpuRate: 4,
    hasTouch: true,
    isMobile: true,
  },
};

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const moduleRoot = readArg('playwright-root', process.env.PLAYWRIGHT_MODULE_ROOT);
    if (!moduleRoot) throw new Error('请通过 --playwright-root 指定已有 Playwright 包目录，无需安装项目依赖。');
    return import(pathToFileURL(join(moduleRoot, 'playwright', 'index.mjs')).href);
  }
}

function summarizeDurations(values) {
  if (values.length === 0) return { count: 0, meanMs: 0, p95Ms: 0, maxMs: 0, over16_7: 0, over33_3: 0 };
  const ordered = [...values].sort((left, right) => left - right);
  const percentile = ordered[Math.min(Math.ceil(ordered.length * 0.95) - 1, ordered.length - 1)];
  return {
    count: values.length,
    meanMs: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
    p95Ms: Number(percentile.toFixed(2)),
    maxMs: Number(ordered.at(-1).toFixed(2)),
    over16_7: values.filter((value) => value > 16.7).length,
    over33_3: values.filter((value) => value > 33.3).length,
  };
}

function summarizeTrace(trace) {
  const names = [
    'Paint',
    'PaintImage',
    'RasterTask',
    'Decode Image',
    'Layout',
    'UpdateLayerTree',
    'CompositeLayers',
    'BeginMainThreadFrame',
  ];
  const result = {};
  for (const name of names) {
    const matching = trace.traceEvents.filter((event) => event.name === name && event.ph === 'X');
    result[name] = {
      count: matching.length,
      totalMs: Number((matching.reduce((sum, event) => sum + (event.dur ?? 0), 0) / 1000).toFixed(2)),
      maxMs: Number((Math.max(0, ...matching.map((event) => event.dur ?? 0)) / 1000).toFixed(2)),
    };
  }
  return result;
}

async function readTrace(cdp, stream) {
  const chunks = [];
  while (true) {
    const response = await cdp.send('IO.read', { handle: stream });
    chunks.push(response.base64Encoded ? Buffer.from(response.data, 'base64') : Buffer.from(response.data));
    if (response.eof) break;
  }
  await cdp.send('IO.close', { handle: stream });
  return Buffer.concat(chunks).toString('utf8');
}

async function collectRaf(page, action, tailMs = 500) {
  await page.evaluate(() => { window.__homePerfRafStopAt = Number.POSITIVE_INFINITY; });
  const sample = page.evaluate(() => new Promise((resolveSample) => {
    const intervals = [];
    let previous = performance.now();
    const tick = (now) => {
      intervals.push(now - previous);
      previous = now;
      if (now >= window.__homePerfRafStopAt) resolveSample(intervals.slice(1));
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
  let actionError;
  try {
    await action();
  } catch (error) {
    actionError = error;
  }

  let stopError;
  try {
    await page.evaluate((tail) => { window.__homePerfRafStopAt = performance.now() + tail; }, tailMs);
  } catch (error) {
    stopError = error;
  }

  let intervals;
  try {
    intervals = await sample;
  } catch (sampleError) {
    if (actionError) throw actionError;
    if (stopError) throw stopError;
    throw sampleError;
  }
  if (actionError) throw actionError;
  if (stopError) throw stopError;
  return intervals;
}

async function resetPage(page, url, variant) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.waitForFunction(() => window.scrollX === 0 && window.scrollY === 0);
  if (variant === 'disableWaves') {
    await page.addStyleTag({ content: '.cover-wave-layer { animation: none !important; }' });
  }
  await page.waitForSelector('[data-home-cover][data-state="collapsed"]');
  await page.locator('[data-home-hero-photo]').evaluate((image) => image.decode().catch(() => {}));
  await page.waitForTimeout(500);
}

async function moveMouseToGestureSurface(page) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('当前页面没有可用的视口尺寸');
  await page.mouse.move(viewport.width / 2, 8);
}

const scenarios = {
  async idleWaves(page) {
    return collectRaf(page, async () => page.waitForTimeout(3000), 0);
  },
  async pageScroll(page) {
    await page.evaluate(() => window.scrollTo(0, Math.min(760, document.documentElement.scrollHeight / 4)));
    await page.waitForTimeout(150);
    await moveMouseToGestureSurface(page);
    return collectRaf(page, async () => {
      for (let index = 0; index < 72; index += 1) {
        await page.mouse.wheel(0, 18);
        await page.waitForTimeout(16);
      }
      for (let index = 0; index < 36; index += 1) {
        await page.mouse.wheel(0, -18);
        await page.waitForTimeout(16);
      }
    });
  },
  async toggleTwice(page) {
    const toggle = page.locator('[data-home-cover-toggle]');
    return collectRaf(page, async () => {
      await toggle.click();
      await page.waitForSelector('[data-home-cover][data-state="expanded"]');
      await page.waitForTimeout(220);
      await toggle.click();
      await page.waitForSelector('[data-home-cover][data-state="collapsed"]');
      await page.waitForTimeout(180);
      await toggle.click();
      await page.waitForSelector('[data-home-cover][data-state="expanded"]');
      await page.waitForTimeout(220);
      await toggle.click();
      await page.waitForSelector('[data-home-cover][data-state="collapsed"]');
    });
  },
  async reverseWheel(page) {
    await moveMouseToGestureSurface(page);
    return collectRaf(page, async () => {
      for (let index = 0; index < 12; index += 1) {
        await page.mouse.wheel(0, -24);
        await page.waitForTimeout(16);
      }
      await page.waitForFunction(() => document.querySelector('[data-home-cover]')?.getAttribute('data-state') !== 'collapsed');
      for (let index = 0; index < 12; index += 1) {
        await page.mouse.wheel(0, 24);
        await page.waitForTimeout(16);
      }
    });
  },
};
const desktopWheelScenarios = new Set(['pageScroll', 'reverseWheel']);

async function measureScenario({ page, cdp, output, profileName, scenarioName, iteration, layerSamples, traceEnabled }) {
  let traceComplete;
  if (traceEnabled) {
    traceComplete = new Promise((resolveTrace) => cdp.once('Tracing.tracingComplete', resolveTrace));
    await cdp.send('Tracing.start', {
    categories: [
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.frame',
      'disabled-by-default-devtools.timeline.layers',
      'disabled-by-default-skia.gpu',
      'blink.animations',
      'cc',
      'viz',
    ].join(','),
    transferMode: 'ReturnAsStream',
    });
  }
  const longTaskStart = await page.evaluate(() => window.__homePerfLongTasks?.length ?? 0);
  const firstLayerSample = layerSamples.length;
  const rafIntervals = await scenarios[scenarioName](page);
  let traceText;
  let trace;
  if (traceEnabled) {
    await cdp.send('Tracing.end');
    const { stream } = await traceComplete;
    traceText = await readTrace(cdp, stream);
    trace = JSON.parse(traceText);
  }
  const longTasks = await page.evaluate((start) => (window.__homePerfLongTasks ?? []).slice(start), longTaskStart);
  const scenarioLayers = layerSamples.slice(firstLayerSample);
  const layerSummary = scenarioLayers.reduce((summary, layers) => {
    const contentLayers = layers.filter((layer) => layer.drawsContent);
    const totalArea = contentLayers.reduce((sum, layer) => sum + layer.width * layer.height, 0);
    const maxArea = Math.max(0, ...contentLayers.map((layer) => layer.width * layer.height));
    return {
      samples: summary.samples + 1,
      maxContentLayers: Math.max(summary.maxContentLayers, contentLayers.length),
      maxTotalCssPixelArea: Math.max(summary.maxTotalCssPixelArea, totalArea),
      maxSingleCssPixelArea: Math.max(summary.maxSingleCssPixelArea, maxArea),
      maxPaintCount: Math.max(summary.maxPaintCount, ...contentLayers.map((layer) => layer.paintCount ?? 0), 0),
    };
  }, { samples: 0, maxContentLayers: 0, maxTotalCssPixelArea: 0, maxSingleCssPixelArea: 0, maxPaintCount: 0 });
  const tracePath = traceEnabled ? join(output, `${profileName}-${scenarioName}-${iteration}.trace.json.gz`) : null;
  if (traceEnabled) await writeFile(tracePath, gzipSync(traceText, { level: 6 }));
  return {
    raf: summarizeDurations(rafIntervals),
    longTasks: summarizeDurations(longTasks.map((entry) => entry.duration)),
    trace: traceEnabled ? summarizeTrace(trace) : null,
    layers: layerSummary,
    tracePath,
  };
}

async function main() {
  const { chromium } = await loadPlaywright();
  const url = readArg('url', DEFAULT_URL);
  const output = resolve(readArg('output', DEFAULT_OUTPUT));
  const selected = readArg('profiles', 'desktop').split(',');
  const selectedScenarios = readArg('scenarios', Object.keys(scenarios).join(',')).split(',');
  const runs = Number.parseInt(readArg('runs', '3'), 10);
  const variant = readArg('variant', 'baseline');
  const traceEnabled = readArg('trace', 'true') !== 'false';
  const headless = readArg('headless', 'true') !== 'false';
  await mkdir(output, { recursive: true });

  const browser = await chromium.launch({ channel: 'msedge', headless });
  try {
    const browserCdp = await browser.newBrowserCDPSession();
    const systemInfo = await browserCdp.send('SystemInfo.getInfo');
    const results = {
    generatedAt: new Date().toISOString(),
    url,
    browserVersion: await browser.version(),
    headless,
    variant,
    traceEnabled,
    gpu: {
      devices: systemInfo.gpu.devices,
      featureStatus: systemInfo.gpu.featureStatus,
      driverBugWorkarounds: systemInfo.gpu.driverBugWorkarounds,
    },
    profiles: {},
    };

    for (const profileName of selected) {
      const profile = profiles[profileName];
      if (!profile) throw new Error(`Unknown profile: ${profileName}`);
      const { cpuRate, ...contextOptions } = profile;
      const context = await browser.newContext(contextOptions);
      await context.addInitScript(() => {
      history.scrollRestoration = 'manual';
      window.__homePerfLongTasks = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__homePerfLongTasks.push({ startTime: entry.startTime, duration: entry.duration });
        }
      }).observe({ type: 'longtask', buffered: true });
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Performance.enable');
      await cdp.send('LayerTree.enable');
      if (cpuRate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
      const layerSamples = [];
      cdp.on('LayerTree.layerTreeDidChange', ({ layers }) => layerSamples.push(layers));
      results.profiles[profileName] = { settings: profile, scenarios: {}, skippedScenarios: {} };

      for (const scenarioName of selectedScenarios) {
        if (!scenarios[scenarioName]) throw new Error(`Unknown scenario: ${scenarioName}`);
        if (profile.isMobile && desktopWheelScenarios.has(scenarioName)) {
          results.profiles[profileName].skippedScenarios[scenarioName] = '该场景依赖桌面鼠标滚轮输入';
          continue;
        }
        results.profiles[profileName].scenarios[scenarioName] = [];
        for (let iteration = 1; iteration <= runs; iteration += 1) {
          await resetPage(page, url, variant);
          results.profiles[profileName].scenarios[scenarioName].push(await measureScenario({
            page,
            cdp,
            output,
            profileName,
            scenarioName,
            iteration,
            layerSamples,
            traceEnabled,
          }));
        }
      }

      await resetPage(page, url, variant);
      await page.locator('[data-home-cover-toggle]').click();
      await page.waitForSelector('[data-home-cover][data-state="expanded"]');
      await page.screenshot({ path: join(output, `${profileName}-expanded.png`) });
      await context.close();
    }

    const resultPath = join(output, 'home-motion-summary.json');
    await writeFile(resultPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ resultPath, profiles: results.profiles, gpu: results.gpu }, null, 2));
  } finally {
    await browser.close();
  }
}

await main();
