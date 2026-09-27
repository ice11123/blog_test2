import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import GithubSlugger from 'github-slugger';
import sharp from 'sharp';

const SITE_BASE = '/blog_test2';
const CATEGORY = '学习笔记';
const SUBCATEGORY = '高等数学笔记';

const ARTICLE_MAP = new Map([
  ['00-高数笔记索引', '00-calculus-index'],
  ['01高数_1-2章_极限与连续', '01-limits-and-sequences'],
  ['02高数_3-7章_一元微分', '02-single-variable-differential-calculus'],
  ['03高数_8-11章_一元积分', '04-single-variable-integral-calculus'],
  ['04高数_13章_多元微分', '05-multivariable-differential-calculus'],
  ['05高数_14章_二重积分', '06-double-integrals'],
  ['06高数_15章_微分方程', '07-differential-equations'],
  ['07高数_16章_无穷级数', '08-infinite-series'],
  ['08高数_17章_空间解析几何与向量分析', '09-analytic-geometry-vector-analysis'],
  ['09高数_18章_多元积分与场论', '10-multivariable-integrals-field-theory'],
  ['复习提纲_1-2章', '03-review-outline-chapters-1-2'],
]);

const ASSET_GROUPS = new Map([
  ['高数笔记_1-2章(1)_assets', 'chapters-1-2'],
  ['高数_3-7章_一元微分_assets', 'chapters-3-7'],
  ['高数_8-11章_一元积分_assets', 'chapters-8-11'],
  ['高数_第13章_多元微分_assets', 'chapter-13'],
  ['高数_第14章_二重积分_assets', 'chapter-14'],
  ['高数_第15章_微分方程_assets', 'chapter-15'],
  ['高数_第16章_无穷级数_assets', 'chapter-16'],
  ['高数_第17章_空间解析几何与向量分析_assets', 'chapter-17'],
  ['高数_第18章_多元积分与场论_assets', 'chapter-18'],
]);

const ARTICLES = [
  {
    source: '00-高数笔记索引.md',
    slug: '00-calculus-index',
    title: '高等数学学习笔记总索引',
    description: '高等数学第 1—11 章及第 13—18 章的学习导航，连接一元微积分、多元微积分、微分方程、无穷级数与复习提纲。',
    tags: ['高等数学', '学习笔记', '总索引', '考研数学'],
    pubDate: '2026-09-24',
    updatedDate: '2026-09-27',
  },
  {
    source: '01高数_1-2章_极限与连续.md',
    slug: '01-limits-and-sequences',
    title: '高等数学第 1—2 章：函数极限与数列极限',
    description: '由 13 页手写笔记整理而成，涵盖极限定义、计算方法、连续性、数列极限、递推数列与核心易错点。',
    tags: ['高等数学', '极限', '连续', '数列极限', '学习笔记'],
    pubDate: '2026-09-24',
  },
  {
    source: '02高数_3-7章_一元微分.md',
    slug: '02-single-variable-differential-calculus',
    title: '高等数学第 3—7 章：一元函数微分学',
    description: '由 26 页手写笔记整理而成，系统梳理导数、微分、函数性态、中值定理、泰勒公式与证明方法。',
    tags: ['高等数学', '导数', '微分', '中值定理', '泰勒公式'],
    pubDate: '2026-09-24',
  },
  {
    source: '复习提纲_1-2章.md',
    slug: '03-review-outline-chapters-1-2',
    title: '高等数学第 1—2 章：数学一复习提纲',
    description: '面向考研数学一的极限与连续复习提纲，提供知识结构、方法选择、必背结论、易错点与速查入口。',
    tags: ['高等数学', '考研数学一', '复习提纲', '极限', '数列极限'],
    pubDate: '2026-09-24',
  },
  {
    source: '03高数_8-11章_一元积分.md',
    slug: '04-single-variable-integral-calculus',
    title: '高等数学第 8—11 章：一元积分学',
    description: '由 28 页手写笔记整理而成，涵盖积分概念与性质、积分计算、几何应用、积分中值定理与积分不等式。',
    tags: ['高等数学', '一元积分', '定积分', '反常积分', '学习笔记'],
    pubDate: '2026-09-27',
  },
  {
    source: '04高数_13章_多元微分.md',
    slug: '05-multivariable-differential-calculus',
    title: '高等数学第 13 章：多元函数微分学',
    description: '由 8 页手写笔记整理而成，涵盖多元函数极限、偏导数、全微分、复合与隐函数求导及条件极值。',
    tags: ['高等数学', '多元函数', '多元微分', '偏导数', '极值'],
    pubDate: '2026-09-27',
  },
  {
    source: '05高数_14章_二重积分.md',
    slug: '06-double-integrals',
    title: '高等数学第 14 章：二重积分',
    description: '由 5 页手写笔记整理而成，涵盖二重积分的概念、性质、对称性、累次积分、极坐标与一般换元。',
    tags: ['高等数学', '二重积分', '极坐标', '换元法', '学习笔记'],
    pubDate: '2026-09-27',
  },
  {
    source: '06高数_15章_微分方程.md',
    slug: '07-differential-equations',
    title: '高等数学第 15 章：微分方程',
    description: '由 10 页手写笔记整理而成，涵盖一阶微分方程、高阶线性微分方程、微分算子法与 Euler 方程。',
    tags: ['高等数学', '微分方程', '线性微分方程', 'Euler方程', '学习笔记'],
    pubDate: '2026-09-27',
  },
  {
    source: '07高数_16章_无穷级数.md',
    slug: '08-infinite-series',
    title: '高等数学第 16 章：无穷级数',
    description: '由 14 页手写笔记整理而成，涵盖数项级数判敛、幂级数、求和函数、Taylor 展开与 Fourier 级数。',
    tags: ['高等数学', '无穷级数', '幂级数', 'Fourier级数', '学习笔记'],
    pubDate: '2026-09-27',
  },
  {
    source: '08高数_17章_空间解析几何与向量分析.md',
    slug: '09-analytic-geometry-vector-analysis',
    title: '高等数学第 17 章：空间解析几何与向量分析',
    description: '由 9 页手写笔记整理而成，涵盖向量代数、空间直线与平面、曲线曲面、方向导数、梯度、散度与旋度。',
    tags: ['高等数学', '空间解析几何', '向量分析', '梯度', '旋度'],
    pubDate: '2026-09-27',
  },
  {
    source: '09高数_18章_多元积分与场论.md',
    slug: '10-multivariable-integrals-field-theory',
    title: '高等数学第 18 章：多元积分与场论',
    description: '由 17 页手写笔记整理而成，涵盖三重积分、曲线积分、曲面积分及 Green、Gauss、Stokes 公式。',
    tags: ['高等数学', '三重积分', '曲线积分', '曲面积分', '场论'],
    pubDate: '2026-09-27',
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

  const group = [...ASSET_GROUPS].find(([sourceDirectory]) => normalized.includes(sourceDirectory))?.[1] ?? null;
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

export function convertNoteBody(source, { currentSource }) {
  let body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

  // Markdown 的行尾双空格是显式换行语义；转成 HTML 后既保留显示结果，也避免生成文件含尾随空白。
  body = body.replace(/[ \t]{2,}$/gm, '<br>');

  body = body.replace(/^#\s+(.+)$/m, (_match, title) => {
    const id = headingId(title);
    return `<span id="${escapeHtmlAttribute(id)}" class="article-top-anchor" aria-hidden="true"></span>`;
  });

  body = body.replace(/^\^page-(\d+)[ \t]*$/gm, '<span id="page-$1" class="source-page-anchor" aria-hidden="true"></span>');

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
pubDate: "${article.pubDate}"
updatedDate: "${article.updatedDate ?? article.pubDate}"
author: "离子怪"
sourceUrl: "${sourceUrl}"
dir1: "${CATEGORY}"
dir2: "${SUBCATEGORY}"
tags: [${article.tags.map((tag) => `"${tag}"`).join(', ')}]
---

`;
}

async function convertImages(sourceRoot, publicRoot) {
  let converted = 0;
  for (const [sourceDirectory, outputDirectory] of ASSET_GROUPS) {
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
