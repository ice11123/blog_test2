import assert from 'node:assert/strict';
import test from 'node:test';

import { convertNoteBody } from './import-calculus-notes.mjs';

test('把 Obsidian 双链、页锚点和图片转换为 blog2 可访问链接且不发布 PDF', () => {
  const source = `# 高等数学笔记：函数极限与数列极限

[[00-高数笔记索引|返回总索引]]
[[#^page-01|第 1 页内容]]
[[02高数_3-7章_一元微分#4.1 基本求导公式|查看求导公式]]
[[原PDF/高数笔记_1-2章_极限与连续.pdf|打开扫描 PDF]]

> [查看原稿第 1 页](./临时文件/高数笔记_1-2章%281%29_assets/原稿-第01页.jpg) · [[#目录|返回目录]]

^page-01

#### 1. 极限的定义

![函数图](./临时文件/高数笔记_1-2章%281%29_assets/图-第05页-函数高阶关系.png)
`;

  const converted = convertNoteBody(source, {
    currentSource: '01高数_1-2章_极限与连续',
  });
  const decoded = decodeURIComponent(converted);

  assert.match(converted, /id="高等数学笔记函数极限与数列极限"/);
  assert.match(converted, /\/blog_test2\/blog\/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0\/00-calculus-index\//);
  assert.match(converted, /href="#page-01"/);
  assert.match(decoded, /02-single-variable-differential-calculus\/#41-基本求导公式/);
  assert.doesNotMatch(converted, /\/notes\/calculus\/pdfs\//);
  assert.match(converted, /\/blog_test2\/notes\/calculus\/images\/chapters-1-2\//);
  assert.match(decoded, /> \[查看原稿第 1 页\]\([^\r\n]+原稿-第01页\.webp\)/);
  assert.doesNotMatch(converted, /source-page-preview|alt="高数原稿第 1 页"/);
  assert.match(converted, /<span id="page-01" class="source-page-anchor"/);
  assert.match(converted, /<img[^>]+alt="函数图"[^>]+loading="lazy"[^>]+decoding="async"/);
  assert.match(converted, /<span id="page-01"[^>]*><\/span>\n\n#### 1\. 极限的定义/);
  assert.doesNotMatch(converted, /\[\[/);
});

test('只转换网站不支持的语法，不擅自改写原 Markdown 文案', () => {
  const source = `# 高数笔记总索引

> [!blue-ink] 导航说明
> 本页只使用 Obsidian 原生双链，编辑视图中使用 Ctrl 单击。

> [!editor-note]
> \`临时文件\` 文件夹保存原稿页图。
`;

  const converted = convertNoteBody(source, {
    currentSource: '00-高数笔记索引',
  });

  assert.match(converted, /本页只使用 Obsidian 原生双链，编辑视图中使用 Ctrl 单击。/);
  assert.match(converted, /`临时文件` 文件夹保存原稿页图。/);
  assert.doesNotMatch(converted, /网页导航|按需打开/);
});
