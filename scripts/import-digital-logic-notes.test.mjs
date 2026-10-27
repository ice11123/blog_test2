import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkDigitalLogicCallouts } from '../src/plugins/remark-digital-logic-callouts.ts';
import { remarkMermaid } from '../src/plugins/remark-mermaid.ts';
import { convertDigitalLogicBody, importDigitalLogicNotes, normalizeDisplayMath, NOTE_MARKER, planDigitalLogicImport, resolveSourceReference } from './import-digital-logic-notes.mjs';
import { validateDigitalLogicBuild } from './validate-digital-logic-build.mjs';

test('来源解析修复真实备份前缀，但不把其他章节的同名索引误配', () => {
  const known = new Set(['00_芯片总索引.md', '第04章 门电路/00_本章芯片索引.md']);
  assert.equal(resolveSourceReference('codex-work-files/旧备份/数电各章节芯片/00_芯片总索引.md', '第04章 门电路/00_本章芯片索引.md', known).source, '00_芯片总索引.md');
  assert.equal(resolveSourceReference('../../数电资料/教材.md#页码', '第04章 门电路/00_本章芯片索引.md', known).unpublished, true);
  assert.throws(() => resolveSourceReference('../第05章 组合逻辑电路/00_本章芯片索引.md', '第04章 门电路/00_本章芯片索引.md', known), /无法解析/);
  assert.equal(resolveSourceReference('https://www.ti.com/product/SN74LS47', '00_芯片总索引.md', known).external, true);
});

test('多行块公式的 Obsidian 分隔符独占行，避免吞掉后续标题、图片和折叠块', async () => {
  const source = '$$N^+=\\begin{cases}\n0,&C=0\\\\\nN,&\\text{其他}\n\\end{cases}$$\n\n## 波形\n\n![图](/图.png)\n\n> [!example]- 展开状态图\n> 内容\n\n```text\n$$不处理代码$$\n```';
  const normalized = normalizeDisplayMath(source);
  assert.match(normalized, /^\$\$\nN\^\+=\\begin\{cases\}/);
  assert.match(normalized, /\\end\{cases\}\n\$\$\n/);
  assert.match(normalized, /```text\n\$\$不处理代码\$\$\n```/);
  const renderer = await createMarkdownProcessor({ syntaxHighlight: false, remarkPlugins: [remarkMath, remarkDigitalLogicCallouts], rehypePlugins: [[rehypeKatex, { output: 'html' }]] });
  const { code } = await renderer.render(`${NOTE_MARKER}\n\n${normalized}`);
  assert.doesNotMatch(code, /katex-error|\[!example\]/);
  assert.match(code, /<h2 id="波形">/);
  assert.match(code, /<details /);
  assert.match(code, /<img /);
});

test('按章节和原索引顺序导入，图片保留原字节；不改正文公式、颜色和代码示例', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'blog2-digital-notes-'));
  try {
    const sourceRoot = path.join(temp, 'source');
    const repositoryRoot = path.join(temp, 'repo');
    const chapter = '第04章 门电路';
    await mkdir(path.join(sourceRoot, chapter, '附件'), { recursive: true });
    await writeFile(path.join(sourceRoot, '00_芯片总索引.md'), '# 总索引\n\n[门电路](<第04章 门电路/00_本章芯片索引.md>)\n');
    await writeFile(path.join(sourceRoot, chapter, '00_本章芯片索引.md'), '# 第四章 门电路\n\n[LS](74LS00.md) [HC](74HC00.md)\n');
    const image = Buffer.from('图片原始字节');
    await writeFile(path.join(sourceRoot, chapter, '附件/图.png'), image);
    const body = '# HC00\n\n[返回](00_本章芯片索引.md)\n\n<span style="color:red">原色</span>\n\n$Y=\\overline{AB}$\n\n![原图|650](附件/图.png)\n\n```text\n[示例](不存在.md)\n```\n\n[教材](<../../数电资料/教材.md#页码>)\n';
    await writeFile(path.join(sourceRoot, chapter, '74HC00.md'), body);
    await writeFile(path.join(sourceRoot, chapter, '74LS00.md'), '# LS00\n\n[同类](74HC00.md#HC00)\n');
    const plan = await planDigitalLogicImport(sourceRoot);
    assert.deepEqual(plan.ordered.map(note => path.basename(note.source)), ['00_芯片总索引.md', '00_本章芯片索引.md', '74LS00.md', '74HC00.md']);
    const converted = convertDigitalLogicBody(plan.ordered[3], plan);
    assert.match(converted.body, /style="color:red"/);
    assert.match(converted.body, /\$Y=\\overline\{AB\}\$/);
    assert.match(converted.body, /```text\n\[示例\]\(不存在\.md\)\n```/);
    assert.match(converted.body, /<img[^>]*width="650"[^>]*loading="lazy"/);
    assert.match(converted.body, /本地资料未发布/);
    assert.doesNotMatch(converted.body, /href=".*数电资料/);
    const result = await importDigitalLogicNotes({ sourceRoot, repositoryRoot, pubDate: '2026-10-27' });
    assert.equal(result.articleCount, 4);
    assert.equal(result.imageCount, 1);
    assert.deepEqual(await readFile(path.join(repositoryRoot, 'public/notes/digital-logic', chapter, '附件/图.png')), image);
    const note = await readFile(path.join(repositoryRoot, 'src/content/blog/学习笔记/数电', `${plan.ordered[3].slug}.md`), 'utf8');
    assert.match(note, /"dir1": "学习笔记"/);
    assert.match(note, /"dir2": "数电芯片笔记"/);
    assert.match(note, /"dir3": "第04章 门电路"/);
    assert.match(note, /第04章 门电路—HC00/);
    await assert.rejects(importDigitalLogicNotes({ sourceRoot, repositoryRoot, pubDate: '2026-10-27' }), /EEXIST/);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('数电提示块原生折叠、保留数学和 Mermaid，不改变其他文章的提示块', async () => {
  const renderer = await createMarkdownProcessor({ syntaxHighlight: false, smartypants: false, remarkPlugins: [remarkMath, remarkDigitalLogicCallouts, remarkMermaid], rehypePlugins: [[rehypeKatex, { output: 'html' }]] });
  const body = '> [!example]- 原图与状态\n>\n> **保留强调** $Q^+=J\\bar Q$\n>\n> ![图](/blog_test2/notes/digital-logic/图.png)\n>\n> ```mermaid\n> stateDiagram-v2\n> z --> o: 时钟\n> ```\n\n> [!note]+ 默认展开\n> 不能删除正文。\n';
  const { code } = await renderer.render(`${NOTE_MARKER}\n\n${body}`);
  assert.match(code, /<details class="github-alert github-alert-important">/);
  assert.match(code, /<summary class="github-alert-label">原图与状态<\/summary>/);
  assert.match(code, /<strong>保留强调<\/strong>/);
  assert.match(code, /class="katex"/);
  assert.match(code, /<pre class="mermaid">/);
  assert.match(code, /<details[^>]+open/);
  assert.doesNotMatch(code, /\[!example\]|\[!note\]/);
  assert.match((await renderer.render(body)).code, /\[!example\]/);
});

test('构建校验接受主页链接，并能发现图片和锚点缺失', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'blog2-digital-build-'));
  try {
    const directory = path.join(temp, 'blog/学习笔记/数电/00-index');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(temp, 'index.html'), '<h1 id="home">首页</h1>');
    const manifest = { articles: [{ slug: '00-index', imageCount: 0 }], assets: [] };
    await writeFile(path.join(directory, 'index.html'), '<a href="/blog_test2/#home">主页</a>');
    assert.equal((await validateDigitalLogicBuild(temp, manifest)).articles, 1);
    await writeFile(path.join(directory, 'index.html'), '<a href="/blog_test2/#missing">坏锚点</a><img src="/blog_test2/notes/digital-logic/missing.png">');
    await assert.rejects(validateDigitalLogicBuild(temp, manifest), /锚点缺失[\s\S]*目标缺失/);
    await writeFile(path.join(directory, 'index.html'), '<a href="/blog_test2/#home">主页</a>');
    const category = path.join(temp, 'blog/category/学习笔记/数电芯片笔记');
    await mkdir(path.join(category, '第04章 门电路'), { recursive: true });
    await writeFile(path.join(category, 'index.html'), '<details class="chapter-group" data-directory-level="3"></details>');
    await writeFile(path.join(category, '第04章 门电路/index.html'), '<p style="width:100%">四级文章</p><a href="/blog_test2/blog/学习笔记/数电/00-index/">文章</a>');
    const nested = { ...manifest, articles: [{ ...manifest.articles[0], dir3: '第04章 门电路' }] };
    assert.equal((await validateDigitalLogicBuild(temp, nested)).articles, 1);
  } finally { await rm(temp, { recursive: true, force: true }); }
});
