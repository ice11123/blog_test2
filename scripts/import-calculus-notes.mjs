import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import GithubSlugger from 'github-slugger';
import sharp from 'sharp';

const SITE_BASE = '/blog_test2';
const CATEGORY = '学习笔记';

const ARTICLE_MAP = new Map([
  ['00-高数笔记索引', '00-calculus-index'],
  ['01高数_1-2章_极限与连续', '01-limits-and-sequences'],
  ['02高数_3-7章_一元微分', '02-single-variable-differential-calculus'],
  ['复习提纲_1-2章', '03-review-outline-chapters-1-2'],
]);

const ARTICLES = [
  {
    source: '00-高数笔记索引.md',
    slug: '00-calculus-index',
    title: '高等数学学习笔记总索引',
    description: '高等数学第 1—7 章的学习导航，连接极限、连续、数列极限、一元微分、复习提纲与逐页原稿。',
    tags: ['高等数学', '学习笔记', '总索引', '考研数学'],
  },
  {
    source: '01高数_1-2章_极限与连续.md',
    slug: '01-limits-and-sequences',
    title: '高等数学第 1—2 章：函数极限与数列极限',
    description: '由 13 页手写笔记整理而成，涵盖极限定义、计算方法、连续性、数列极限、递推数列与核心易错点。',
    tags: ['高等数学', '极限', '连续', '数列极限', '学习笔记'],
  },
  {
    source: '02高数_3-7章_一元微分.md',
    slug: '02-single-variable-differential-calculus',
    title: '高等数学第 3—7 章：一元函数微分学',
    description: '由 26 页手写笔记整理而成，系统梳理导数、微分、函数性态、中值定理、泰勒公式与证明方法。',
    tags: ['高等数学', '导数', '微分', '中值定理', '泰勒公式'],
  },
  {
    source: '复习提纲_1-2章.md',
    slug: '03-review-outline-chapters-1-2',
    title: '高等数学第 1—2 章：数学一复习提纲',
    description: '面向考研数学一的极限与连续复习提纲，提供知识结构、方法选择、必背结论、易错点与速查入口。',
    tags: ['高等数学', '考研数学一', '复习提纲', '极限', '数列极限'],
  },
];

const CUSTOM_CALLOUT_LABELS = new Map([
  ['blue-ink', '蓝笔补充'],
  ['key-formula', '核心公式'],
  ['red-ink', '重点订正'],
  ['graph-memory', '图像记忆'],
  ['editor-note', '编辑说明'],
  ['danger', '易错警示'],
]);

function encodePath(pathname) {
  return pathname.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function articleUrl(slug) {
  return `${SITE_BASE}/blog/${encodeURIComponent(CATEGORY)}/${slug}/`;
}

function cleanHeadingText(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim();
}

function headingId(value) {
  return new GithubSlugger().slug(cleanHeadingText(value));
}

function normalizeAssetPath(rawPath) {
  const withoutQuery = rawPath.split(/[?#]/, 1)[0];
  try {
    return decodeURIComponent(withoutQuery).replace(/^\.\//, '').replaceAll('\\', '/');
  } catch {
    return withoutQuery.replace(/^\.\//, '').replaceAll('\\', '/');
  }
}

function publicAssetUrl(rawPath) {
  const normalized = normalizeAssetPath(rawPath);
  const filename = path.posix.basename(normalized);

  if (/\.pdf$/i.test(filename)) return null;

  const group = normalized.includes('高数笔记_1-2章(1)_assets')
    ? 'chapters-1-2'
    : normalized.includes('高数_3-7章_一元微分_assets')
      ? 'chapters-3-7'
      : null;
  if (!group || !/\.(?:png|jpe?g|webp)$/i.test(filename)) return null;

  const webpName = filename.replace(/\.(?:png|jpe?g|webp)$/i, '.webp');
  return `${SITE_BASE}/notes/calculus/images/${group}/${encodeURIComponent(webpName)}`;
}

function splitWikiTarget(rawTarget) {
  const hashIndex = rawTarget.indexOf('#');
  if (hashIndex < 0) return { page: rawTarget, fragment: '' };
  return {
    page: rawTarget.slice(0, hashIndex),
    fragment: rawTarget.slice(hashIndex + 1),
  };
}

function wikiHref(rawTarget, currentSource) {
  if (/\.pdf$/i.test(rawTarget)) return publicAssetUrl(rawTarget);

  const { page, fragment } = splitWikiTarget(rawTarget);
  let base = '';
  if (page) {
    const sourceName = page.replace(/\.md$/i, '');
    const slug = ARTICLE_MAP.get(sourceName);
    if (!slug) return null;
    base = articleUrl(slug);
  } else if (!currentSource) {
    return null;
  }

  if (!fragment) return base || articleUrl(ARTICLE_MAP.get(currentSource));
  const anchor = fragment.startsWith('^') ? fragment.slice(1) : headingId(fragment);
  return `${base}#${encodeURIComponent(anchor)}`;
}

function escapeHtmlAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function sourcePagePreview(rawPath, pageNumber) {
  const src = publicAssetUrl(rawPath);
  if (!src) return '';
  const page = Number.parseInt(pageNumber, 10);
  const anchor = `page-${String(page).padStart(2, '0')}`;
  return `<span id="${anchor}" class="source-page-anchor" aria-hidden="true"></span>

<figure class="source-page-preview" data-source-page="${page}">
  <a href="${src}" target="_blank" rel="noopener" aria-label="打开高数原稿第 ${page} 页原尺寸图片">
    <img src="${src}" alt="高数原稿第 ${page} 页" width="1400" height="2100" loading="lazy" decoding="async">
  </a>
  <figcaption>原稿第 ${page} 页 · 点击查看原尺寸</figcaption>
</figure>`;
}

function adaptEditorialCopyForWeb(body, currentSource) {
  if (currentSource === '00-高数笔记索引') {
    body = body
      .replace(
        /> \[!blue-ink\] 导航说明\r?\n> .*?(?:\r?\n|$)/,
        '> [!blue-ink] 网页导航\n> 点击章节入口即可跳转到对应文章和知识点；浏览器后退可回到本索引。\n',
      )
      .replace(/^- \[\[扫描笔记转 Markdown 要点\|扫描笔记转换规范\]\]\r?\n/m, '')
      .replace(/^- \[\[原PDF\/[^\]]+\.pdf\|[^\]]+\]\]\r?\n/gm, '')
      .replace(
        /> \[!editor-note\]\r?\n> .*?(?:\r?\n|$)/,
        '> [!editor-note] 原稿资料\n> 逐页原稿和必要图示均作为独立图片资源按需打开，不参与文章首屏加载。\n',
      );
  }

  if (currentSource === '01高数_1-2章_极限与连续') {
    body = body
      .replace(
        /> 来源：\[\[原PDF\/[^\]]+\.pdf\|打开扫描 PDF\]\]/,
        '> 来源：13 页手写扫描笔记；需要核对笔迹时，可打开各节末尾的对应原稿页图。',
      )
      .replace(
        /> \[!tip\] Obsidian 导航\r?\n> .*?(?:\r?\n|$)/,
        '> [!tip] 网页导航\n> 点击本文目录、正文链接或右侧目录即可跳转；浏览器后退可返回原位置。\n',
      );
  }

  if (currentSource === '02高数_3-7章_一元微分') {
    body = body.replace(
      /^原 PDF：\[\[原PDF\/[^\]]+\.pdf\|打开扫描 PDF\]\]\r?$/m,
      '原稿说明：需要核对笔迹时，可打开各节末尾的对应原稿页图。',
    );
  }
  return body;
}

export function convertNoteBody(source, { currentSource }) {
  let body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  body = adaptEditorialCopyForWeb(body, currentSource);
  body = body.replace(/<!--\s*原PDF第\s*(\d+)\s*页\s*-->/g, '<!-- 原稿第 $1 页 -->');

  body = body.replace(
    /(?:^> \[!source-note\]-?\s*原稿第\s*\d+\s*页\s*\r?\n)?^> \[(?:查看|打开)原稿第\s*(\d+)\s*页\]\(([^)\r\n]+)\)(?:\s*·\s*\[\[#目录\|返回目录\]\])?[ \t]*\r?\n\r?\n^\^page-(\d+)[ \t]*$/gm,
    (_match, labelPage, target, anchorPage) => sourcePagePreview(target, anchorPage || labelPage),
  );

  body = body.replace(/^#\s+(.+)$/m, (_match, title) => {
    const id = headingId(title);
    return `<span id="${escapeHtmlAttribute(id)}" class="article-top-anchor" aria-hidden="true"></span>`;
  });

  body = body.replace(/^\^page-(\d+)\s*$/gm, '<span id="page-$1" class="source-page-anchor" aria-hidden="true"></span>');

  body = body.replace(/^> \[!([^\]]+)\](?:[ \t]+([^\r\n]+))?$/gim, (match, type, title = '') => {
    const label = CUSTOM_CALLOUT_LABELS.get(type.toLowerCase());
    if (!label) return match;
    return `> **${label}${title.trim() ? `｜${title.trim()}` : ''}**`;
  });

  body = body.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, width = '') => {
    const src = publicAssetUrl(target);
    if (!src) return '';
    const alt = path.posix.basename(normalizeAssetPath(target), path.posix.extname(normalizeAssetPath(target)));
    const widthAttr = /^\d+$/.test(width.trim()) ? ` width="${width.trim()}"` : '';
    return `<img src="${src}" alt="${escapeHtmlAttribute(alt)}"${widthAttr} loading="lazy" decoding="async">`;
  });

  body = body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, target) => {
    const src = publicAssetUrl(target);
    if (!src) return match;
    return `<img src="${src}" alt="${escapeHtmlAttribute(alt)}" loading="lazy" decoding="async">`;
  });

  body = body.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
    const href = publicAssetUrl(target);
    return href ? `[${label}](${href})` : match;
  });

  body = body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, label) => {
    const href = wikiHref(target.trim(), currentSource);
    const text = (label || target.replace(/^#\^?/, '')).trim();
    return href ? `<a href="${href}">${text}</a>` : text;
  });

  return `${body.trim()}\n`;
}

function frontmatterFor(article) {
  const sourceUrl = `https://github.com/ice11123/blog_test2/blob/main/src/content/blog/${encodePath(`${CATEGORY}/${article.slug}.md`)}`;
  return `---
title: "${article.title}"
description: "${article.description}"
pubDate: "2026-09-24"
updatedDate: "2026-09-24"
author: "离子怪"
sourceUrl: "${sourceUrl}"
dir1: "${CATEGORY}"
dir2: ""
tags: [${article.tags.map((tag) => `"${tag}"`).join(', ')}]
---

`;
}

async function convertImages(sourceRoot, publicRoot) {
  const groups = [
    ['高数笔记_1-2章(1)_assets', 'chapters-1-2'],
    ['高数_3-7章_一元微分_assets', 'chapters-3-7'],
  ];

  let converted = 0;
  for (const [sourceDirectory, outputDirectory] of groups) {
    const inputRoot = path.join(sourceRoot, '临时文件', sourceDirectory);
    const outputRoot = path.join(publicRoot, 'images', outputDirectory);
    await mkdir(outputRoot, { recursive: true });
    const files = await readdir(inputRoot, { withFileTypes: true });
    for (const entry of files) {
      if (!entry.isFile() || !/\.(?:png|jpe?g|webp)$/i.test(entry.name)) continue;
      const outputName = entry.name.replace(/\.(?:png|jpe?g|webp)$/i, '.webp');
      await sharp(path.join(inputRoot, entry.name))
        .resize({ width: 2200, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(path.join(outputRoot, outputName));
      converted += 1;
    }
  }
  return converted;
}

export async function importCalculusNotes({ sourceRoot, repositoryRoot }) {
  const contentRoot = path.join(repositoryRoot, 'src', 'content', 'blog', CATEGORY);
  const publicRoot = path.join(repositoryRoot, 'public', 'notes', 'calculus');
  await mkdir(contentRoot, { recursive: true });

  for (const article of ARTICLES) {
    const sourcePath = path.join(sourceRoot, article.source);
    const source = await readFile(sourcePath, 'utf8');
    const body = convertNoteBody(source, { currentSource: path.basename(article.source, '.md') });
    await writeFile(path.join(contentRoot, `${article.slug}.md`), `${frontmatterFor(article)}${body}`, 'utf8');
  }

  const imageCount = await convertImages(sourceRoot, publicRoot);
  return { articleCount: ARTICLES.length, imageCount };
}

function readSourceArgument(argv) {
  const index = argv.indexOf('--source');
  return index >= 0 ? argv[index + 1] : '';
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const sourceRoot = readSourceArgument(process.argv.slice(2));
  if (!sourceRoot) {
    throw new Error('缺少 --source 参数：请传入高数笔记成品目录。');
  }
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = await importCalculusNotes({ sourceRoot: path.resolve(sourceRoot), repositoryRoot });
  console.log(`已导入 ${result.articleCount} 篇 Markdown 文章和 ${result.imageCount} 张按需加载图片（未发布 PDF）。`);
}
