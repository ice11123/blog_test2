import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as draftModule from '../src/lib/adminDrafts.ts';
import * as gestureModule from '../src/lib/homeCoverGesture.ts';
import * as geometryModule from '../src/lib/homeCoverMotionGeometry.ts';
import * as statusModule from '../src/lib/publicStatusRequest.ts';
import { normalizeDeploymentStatus } from '../src/lib/deploymentStatus.js';

// 执行实际浏览器模块，仅替换 DOM、下载和外部渲染边界，避免测试复制业务逻辑。
function loadRuntime(relativePath, globals = {}, dependencies = {}, exposed = '') {
  const source = fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = vm.createContext({
    exports: {}, console, AbortController, DOMException, setTimeout, clearTimeout, Blob,
    require: (name) => {
      if (!(name in dependencies)) throw new Error(`测试未提供依赖：${name}`);
      return dependencies[name];
    },
    ...globals,
  });
  vm.runInContext(`${outputText}\n${exposed}`, context);
  return context.exports;
}

class ElementStub {
  handlers = new Map();
  dataset = {};
  value = '';
  innerHTML = '';
  textContent = '';
  classList = { add() {}, remove() {}, toggle() {} };
  addEventListener(type, callback, options = {}) {
    const entries = this.handlers.get(type) || [];
    entries.push({ callback, signal: options.signal });
    this.handlers.set(type, entries);
  }
  fire(type, extra = {}) {
    const event = { target: this, preventDefault() {}, ...extra };
    for (const { callback, signal } of this.handlers.get(type) || []) {
      if (!signal?.aborted) callback(event);
    }
    return event;
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  setAttribute() {}
  getAttribute(_name) { return null; }
  removeAttribute() {}
}

function mountHeroRuntime() {
  const frames = new Map();
  let frameId = 0;
  let writes = 0;
  let guardCalls = 0;
  const nodes = new Map();
  const makeNode = () => {
    const element = new ElementStub();
    element.style = { setProperty() {}, removeProperty() {} };
    element.getBoundingClientRect = () => ({ top: 80, bottom: 680, left: 0, right: 1200, width: 1200, height: 600 });
    element.naturalWidth = 1920;
    element.naturalHeight = 1080;
    element.offsetHeight = 44;
    element.animate = () => {
      let time = 0;
      return { get currentTime() { return time; }, set currentTime(value) { time = value; writes++; },
        pause() {}, cancel() {}, finished: new Promise(() => {}) };
    };
    element.removeEventListener = (type, callback) => {
      element.handlers.set(type, (element.handlers.get(type) || []).filter(entry => entry.callback !== callback));
    };
    return element;
  };
  for (const selector of ['[data-home-cover]', '.home-cover', '[data-home-hero-photo]', '[data-home-hero-source]', '[data-home-cover-stage]', '[data-home-hero-full]', '[data-home-cover-toggle]', '[data-home-lower-motion]', '[data-home-cover-status]', '#site-header', 'svg']) nodes.set(selector, makeNode());
  nodes.get('[data-home-cover]').querySelector = selector => nodes.get(selector) || null;
  nodes.get('[data-home-cover-toggle]').querySelector = selector => nodes.get(selector) || null;
  const document = makeNode();
  document.documentElement = makeNode();
  document.querySelector = selector => nodes.get(selector) || null;
  document.contains = () => true;
  const media = Object.assign(makeNode(), { matches: false });
  const desktop = Object.assign(makeNode(), { matches: true });
  const window = Object.assign(makeNode(), {
    innerHeight: 900, innerWidth: 1200, scrollY: 0,
    matchMedia: query => query.includes('hover') ? desktop : media,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); }, setTimeout() { return 1; }, clearTimeout() {},
  });
  class Observer { observe() {} disconnect() {} }
  loadRuntime('../src/scripts/home-hero-motion.ts', {
    document, window, performance: { now: () => 100 },
    getComputedStyle: () => ({ display: 'block', objectPosition: '50% 50%' }),
    ResizeObserver: Observer, IntersectionObserver: Observer, MutationObserver: Observer,
  }, {
    '../lib/homeCoverGesture': { ...gestureModule, shouldIgnoreHomeCoverGesture() { guardCalls++; return false; } },
    '../lib/homeCoverMotionGeometry': geometryModule,
  });
  const flush = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(16)); };
  flush();
  writes = 0;
  return { document, window, nodes, frames, flush, writes: () => writes, guards: () => guardCalls,
    wheel(deltaY) { return document.fire('wheel', { deltaY, deltaX: 0, deltaMode: 0 }); } };
}

test('普通向下浏览不执行壁纸祖先元素布局检查', () => {
  const hero = mountHeroRuntime();
  for (let i = 0; i < 40; i++) hero.wheel(2);
  assert.equal(hero.guards(), 0);
  assert.equal(hero.writes(), 0);
});

test('同帧滚轮突发只提交一次最新动画进度，下一帧可反向', () => {
  const hero = mountHeroRuntime();
  for (let i = 0; i < 40; i++) hero.wheel(-2);
  hero.flush();
  assert.ok(hero.writes() <= 10, `同帧产生了 ${hero.writes()} 次动画写入`);
  const previous = hero.writes();
  for (let i = 0; i < 10; i++) hero.wheel(2);
  hero.flush();
  assert.equal(hero.writes() - previous, 5);
});

test('离开首页取消尚未提交的手势帧并移除监听', () => {
  const hero = mountHeroRuntime();
  hero.wheel(-10);
  const previous = hero.writes();
  hero.document.fire('astro:before-swap');
  hero.flush();
  assert.equal(hero.writes(), previous);
  assert.equal(hero.document.handlers.get('wheel')?.length, 0);
});

test('阅读正文时释放阻塞式滚轮监听，回到顶部恢复接管', () => {
  const hero = mountHeroRuntime();
  assert.equal(hero.document.handlers.get('wheel').length, 2);
  hero.window.scrollY = 500;
  hero.window.fire('scroll');
  assert.equal(hero.document.handlers.get('wheel').length, 1);
  hero.wheel(120);
  assert.equal(hero.guards(), 0);
  hero.window.scrollY = 0;
  hero.window.fire('scroll');
  assert.equal(hero.document.handlers.get('wheel').length, 2);
  hero.wheel(-20);
  hero.flush();
  assert.ok(hero.writes() > 0);
});

test('触摸移动监听只在顶部单指会话挂载并在结束后释放', () => {
  const hero = mountHeroRuntime();
  const touch = { identifier: 1, clientX: 50, clientY: 650 };
  assert.equal(hero.document.handlers.get('touchmove')?.length ?? 0, 0);
  hero.window.scrollY = 300;
  hero.document.fire('touchstart', { touches: [touch] });
  assert.equal(hero.document.handlers.get('touchmove')?.length ?? 0, 0);
  hero.window.scrollY = 0;
  hero.document.fire('touchstart', { touches: [touch] });
  assert.equal(hero.document.handlers.get('touchmove').length, 1);
  hero.document.fire('touchend', { changedTouches: { length: 1, item: () => touch } });
  assert.equal(hero.document.handlers.get('touchmove').length, 0);
});

test('首页 GitHub 直连成功时显示正常，而不是等待', async () => {
  const cards = Object.fromEntries(['frontend', 'worker', 'repository', 'deployment'].map((name) => {
    const card = new ElementStub();
    const nodes = new Map();
    card.querySelector = (selector) => {
      if (!nodes.has(selector)) nodes.set(selector, new ElementStub());
      return nodes.get(selector);
    };
    return [name, card];
  }));
  const root = new ElementStub();
  root.closest = () => null;
  root.querySelector = (selector) => cards[selector.match(/data-public-card="([^"]+)"/)?.[1]];
  const document = new ElementStub();
  document.querySelector = () => root;
  loadRuntime('../src/scripts/public-status.ts', { document, window: {} }, {
    '../lib/publicStatusRequest': statusModule,
    '../lib/deploymentStatus.js': { normalizeDeploymentStatus },
    '../lib/publicDataFetch': {
      fetchPriorityPublicData: async (url) => String(url).includes('/git/ref/')
        ? Response.json({ object: { sha: 'abcdef1234567' } })
        : Response.json({ workflow_runs: [{ status: 'completed', conclusion: 'success' }] }),
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(cards.repository.dataset.state, 'ok');
  assert.equal(cards.deployment.dataset.state, 'ok');
  assert.equal(cards.deployment.querySelector('[data-card-state]').textContent, '正常');
});

function mountEditor(t, empty = false) {
  const values = new Map();
  const storage = {
    failWrites: false,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (this.failWrites) throw new DOMException('Quota exceeded', 'QuotaExceededError');
      values.set(key, value);
    },
    removeItem(key) { values.delete(key); },
  };
  const posts = (empty ? [] : ['a', 'b']).map((id) => ({
    id, title: `title-${id}`, description: '', pubDate: '2026-09-08',
    dir1: '', dir2: '', tags: [], body: `original ${id}`, format: 'md',
  }));
  const fields = Object.fromEntries(['id', 'title', 'description', 'pubDate', 'author', 'sourceUrl', 'dir1', 'dir2', 'tags', 'body', 'format'].map((key) => [key, new ElementStub()]));
  const form = new ElementStub();
  form.reportValidity = () => true;
  form.querySelector = (selector) => fields[selector.match(/name="([^"]+)"/)?.[1]] || null;
  const tree = new ElementStub();
  let articleButtons = [];
  tree.querySelectorAll = (selector) => {
    if (selector !== '[data-post-id]') return [];
    articleButtons = [...tree.innerHTML.matchAll(/data-post-id="([^"]+)"/g)].map((match) => {
      const button = new ElementStub();
      button.getAttribute = () => match[1];
      return button;
    });
    return articleButtons;
  };
  const controls = Object.fromEntries(['new', 'export', 'status', 'delete'].map((key) => [key, new ElementStub()]));
  const app = new ElementStub();
  app.getAttribute = (name) => name === 'data-initial-drafts' ? JSON.stringify(posts) : '';
  app.querySelector = (selector) => ({ '[data-form]': form, '[data-post-tree]': tree, ...Object.fromEntries(Object.entries(controls).map(([key, value]) => [`[data-${key}]`, value])) })[selector] || null;
  const document = new ElementStub();
  document.body = new ElementStub();
  let download;
  let downloadedBlob;
  document.createElement = () => {
    const link = { click() { download = this.download; } };
    return link;
  };
  const window = Object.assign(new ElementStub(), { localStorage: storage, matchMedia: () => ({ matches: false }) });
  const runtime = loadRuntime('../src/scripts/admin-dashboard.ts', {
    document, window, localStorage: storage, sessionStorage: { getItem: () => null },
    requestAnimationFrame: () => 0, confirm: () => true,
    URL: { createObjectURL(blob) { downloadedBlob = blob; return 'blob:test'; }, revokeObjectURL() {} },
  }, {
    '../lib/adminDrafts': {
      ...draftModule,
      LocalStorageDraftStore: class extends draftModule.LocalStorageDraftStore {
        constructor(initial) { super(initial, storage); }
      },
    },
    '../lib/adminPreview': { renderPreview: () => '', renderPreviewMermaid: async () => {} },
  });
  const dispose = runtime.mountAdminDashboard(app);
  t.after(dispose);
  return {
    fields, form, controls, storage, document, window,
    select(id) { articleButtons.find((button) => button.getAttribute() === id).fire('click'); },
    download: () => ({ name: download, blob: downloadedBlob }),
  };
}

test('切换文章和新建前保留未保存正文', (t) => {
  const editor = mountEditor(t);
  editor.fields.body.value = 'edited a';
  editor.form.fire('input');
  editor.select('b');
  editor.select('a');
  assert.equal(editor.fields.body.value, 'edited a');
  editor.fields.body.value = 'edited again';
  editor.form.fire('input');
  editor.controls.new.fire('click');
  editor.select('a');
  assert.equal(editor.fields.body.value, 'edited again');
  assert.equal(JSON.parse(editor.storage.getItem(draftModule.ADMIN_DRAFTS_STORAGE_KEY)).find((post) => post.id === 'a').body, 'edited again');
});

test('自动保存失败时不切换、不覆盖内存正文', (t) => {
  const editor = mountEditor(t);
  editor.fields.body.value = 'must not lose';
  editor.form.fire('input');
  editor.storage.failWrites = true;
  editor.select('b');
  assert.equal(editor.fields.id.value, 'a');
  assert.equal(editor.fields.body.value, 'must not lose');
  editor.controls.new.fire('click');
  assert.equal(editor.fields.body.value, 'must not lose');
  assert.match(editor.controls.status.textContent, /失败/);
});

test('离开管理台时保存草稿，失败则取消站内跳转并提示刷新风险', (t) => {
  const editor = mountEditor(t);
  editor.fields.body.value = 'pending navigation';
  editor.form.fire('input');
  editor.storage.failWrites = true;
  let prevented = false;
  editor.document.fire('astro:before-preparation', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  prevented = false;
  editor.window.fire('beforeunload', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  editor.storage.failWrites = false;
  editor.document.fire('astro:before-preparation');
  assert.equal(JSON.parse(editor.storage.getItem(draftModule.ADMIN_DRAFTS_STORAGE_KEY))[0].body, 'pending navigation');
});

test('删除最后一篇已编辑草稿后清空表单，仍然可以新建', (t) => {
  const editor = mountEditor(t, true);
  editor.controls.new.fire('click');
  editor.fields.body.value = 'deleted content';
  editor.form.fire('input');
  editor.controls.delete.fire('click');
  assert.equal(editor.fields.body.value, '');
  assert.equal(editor.fields.id.value, '');
  editor.controls.new.fire('click');
  assert.match(editor.fields.id.value, /^draft\//);
});

test('导出文件名、扩展名和正文采用同一份最新表单快照', async (t) => {
  const editor = mountEditor(t);
  editor.fields.title.value = '新标题';
  editor.fields.format.value = 'mdx';
  editor.fields.body.value = '# 新正文';
  editor.fields.author.value = '离子怪';
  editor.fields.sourceUrl.value = 'https://github.com/ice11123/blog_test2';
  editor.form.fire('input');
  editor.controls.export.fire('click');
  const output = editor.download();
  assert.equal(output.name, '新标题.mdx');
  assert.match(await output.blob.text(), /title: "新标题"[\s\S]*# 新正文/);
  assert.match(await output.blob.text(), /author: "离子怪"/);
  assert.match(await output.blob.text(), /sourceUrl: "https:\/\/github.com\/ice11123\/blog_test2"/);
  assert.match(await output.blob.text(), new RegExp(`updatedDate: ${new Date().toISOString().slice(0, 10)}`));
});

test('表单校验失败时不导出无效文章', (t) => {
  const editor = mountEditor(t);
  editor.form.reportValidity = () => false;
  editor.controls.export.fire('click');
  assert.equal(editor.download().blob, undefined);
});

test('预览只移除文档开头元数据，不吞掉正文代码和分隔线', () => {
  const dependencies = Object.fromEntries(['dompurify', 'katex', 'marked', 'prismjs', ...['markup', 'css', 'clike', 'javascript', 'typescript', 'json', 'bash', 'python'].map((name) => `prismjs/components/prism-${name}`)].map((name) => [name, {}]));
  const { stripDocumentSyntax } = loadRuntime('../src/lib/adminPreview.ts', {}, dependencies, 'exports.stripDocumentSyntax = stripDocumentSyntax;');
  const body = '# 教程\n\n```js\nexport const answer = 42;\n```\n\n---\n保留正文\n---\n';
  assert.equal(stripDocumentSyntax(body), body);
  assert.equal(stripDocumentSyntax(`---\ntitle: Demo\n---\n\nimport Demo from "./Demo.astro";\n\n${body}`), body);
});

test('Plot3D 曲线和曲面采样包含两个区间端点', async () => {
  const document = new ElementStub();
  document.documentElement = new ElementStub();
  let traces;
  const { drawPlot } = loadRuntime('../src/scripts/plot3d.ts', {
    document,
    window: { Plotly: { async newPlot(_element, data) { traces = data; } } },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
  }, {}, 'exports.drawPlot = drawPlot;');
  for (const type of ['line', 'surface']) {
    const element = new ElementStub();
    element.isConnected = true;
    element.dataset.plotConfig = JSON.stringify({
      type, points: 50, tStart: -5, tEnd: 5, xEquation: 't', yEquation: 't', zEquation: 't',
      uStart: -5, uEnd: 5, vStart: -2, vEnd: 2, xSurface: 'u', ySurface: 'v', zSurface: 'u + v',
    });
    await drawPlot(element, new AbortController().signal);
    assert.equal(element.dataset.plotState, 'loaded');
    if (type === 'line') {
      assert.equal(traces[0].x[0], -5);
      assert.equal(traces[0].x.at(-1), 5);
    } else {
      assert.equal(traces[0].x[0][0], -5);
      assert.equal(traces[0].x.at(-1).at(-1), 5);
      assert.equal(traces[0].y[0][0], -2);
      assert.equal(traces[0].y.at(-1).at(-1), 2);
    }
  }
});

test('首页滚轮、触摸和笔手势不接管搜索弹窗、输入框或独立滚动区', () => {
  const source = fs.readFileSync(new URL('../src/scripts/home-hero-motion.ts', import.meta.url), 'utf8');
  const parsed = ts.createSourceFile('home-hero-motion.ts', source, ts.ScriptTarget.Latest, true);
  const handlers = new Map();
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ['handleWheel', 'handleTouchStart', 'handlePenDown'].includes(node.name.getText(parsed))) {
      handlers.set(node.name.getText(parsed), node.initializer.getText(parsed));
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  assert.equal(handlers.size, 3);
  for (const kind of ['dialog', 'input', 'scroll', 'page']) {
    const target = new ElementStub();
    target.closest = () => kind === 'input' ? target : null;
    target.scrollHeight = kind === 'scroll' ? 400 : 100;
    target.clientHeight = 100;
    const document = { querySelector: () => kind === 'dialog' ? {} : null, body: {}, documentElement: {}, addEventListener() {} };
    const helper = loadRuntime('../src/lib/homeCoverGesture.ts', {
      document, Element: ElementStub, getComputedStyle: () => ({ overflowY: 'auto' }),
    });
    for (const [name, initializer] of handlers) {
      let handled = false;
      const context = vm.createContext({
        ...gestureModule, ...helper, document, Element: ElementStub,
        desktopWheel: { matches: true }, window: { scrollY: 0, innerHeight: 800, setTimeout() {} },
        sampleProgress: () => 0, performance: { now: () => 100 }, progress: 0,
        wheelRequiresFreshInput: false, wheelStartTime: 0, lastWheelTime: 0,
        wheelIntentDistance: 0, wheelStartProgress: 0, wheelTravelDistance: 360,
        wheelResetTimer: undefined, WHEEL_GESTURE_IDLE_MS: 120, state: '', shell: { dataset: {} },
        requestHighResolution() {}, interruptMotion() {}, updateWaves() {}, queueProgress() {}, finishWheelGesture() {},
        activeTouchId: null, activePenId: null, measuredHeaderHeight: 80, trackedPenPointers: new Set(), handleTouchMove() {},
        documentElement: { setPointerCapture() {} }, beginGesture() { handled = true; },
      });
      const { outputText } = ts.transpileModule(`globalThis.handler = ${initializer}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } });
      vm.runInContext(outputText, context);
      context.handler({
        target, deltaX: 0, deltaY: -120, deltaMode: 0, pointerType: 'pen', pointerId: 1, clientY: 180,
        touches: [{ identifier: 1, clientX: 50, clientY: 180 }],
        preventDefault() { handled = true; },
      });
      assert.equal(handled, kind === 'page', `${name}: ${kind}`);
    }
  }
});
