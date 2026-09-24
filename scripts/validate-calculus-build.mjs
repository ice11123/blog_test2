import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_PATH = '/blog_test2';
const ARTICLE_SLUGS = [
  '00-calculus-index',
  '01-limits-and-sequences',
  '02-single-variable-differential-calculus',
  '03-review-outline-chapters-1-2',
];
const EXPECTED_SOURCE_PAGE_LINK_COUNTS = new Map([
  ['01-limits-and-sequences', 26],
  ['02-single-variable-differential-calculus', 26],
]);

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function getAttributeValues(html, attribute) {
  const pattern = new RegExp(`\\b${attribute}=(?:"([^"]+)"|'([^']+)'|([^\\s>]+))`, 'g');
  return [...html.matchAll(pattern)].map((match) => decodeHtml(match[1] || match[2] || match[3]));
}

function routeToFile(distRoot, pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.slice(BASE_PATH.length).replace(/^\/+/, '');
  if (/\.[a-z\d]+$/i.test(relative)) return path.join(distRoot, ...relative.split('/'));
  return path.join(distRoot, ...relative.replace(/\/+$/, '').split('/'), 'index.html');
}

async function assertFile(pathname, errors) {
  try {
    await access(pathname);
  } catch {
    errors.push(`目标文件不存在：${pathname}`);
  }
}

export async function validateCalculusBuild(distRoot) {
  const errors = [];
  const htmlCache = new Map();

  async function getHtml(file) {
    if (!htmlCache.has(file)) htmlCache.set(file, await readFile(file, 'utf8'));
    return htmlCache.get(file);
  }

  for (const slug of ARTICLE_SLUGS) {
    const sourceFile = path.join(distRoot, 'blog', '学习笔记', slug, 'index.html');
    await assertFile(sourceFile, errors);
    if (errors.some((message) => message.endsWith(sourceFile))) continue;
    const html = await getHtml(sourceFile);
    const expectedSourcePageLinks = EXPECTED_SOURCE_PAGE_LINK_COUNTS.get(slug);
    if (expectedSourcePageLinks) {
      const sourcePageImages = [...html.matchAll(/<img\b[^>]+(?:%E5%8E%9F%E7%A8%BF-|原稿-)[^>]*>/gi)].length;
      const sourcePageLinks = getAttributeValues(html, 'href')
        .map((reference) => decodeURIComponent(reference))
        .filter((reference) => /\/原稿-第\d+页\.webp$/u.test(decodeURIComponent(new URL(reference, 'https://example.invalid').pathname)))
        .length;
      if (sourcePageImages !== 0) {
        errors.push(`原稿页不应作为正文大图显示：${slug} 实际发现 ${sourcePageImages} 张`);
      }
      if (sourcePageLinks !== expectedSourcePageLinks) {
        errors.push(`原稿页链接数量错误：${slug} 应为 ${expectedSourcePageLinks}，实际为 ${sourcePageLinks}`);
      }
    }
    const references = [...getAttributeValues(html, 'href'), ...getAttributeValues(html, 'src')];

    for (const reference of references) {
      if (!reference.startsWith(BASE_PATH)) continue;
      const url = new URL(reference, 'https://example.invalid');
      if (!url.pathname.startsWith(`${BASE_PATH}/blog/学习笔记/`) && !url.pathname.startsWith(`${BASE_PATH}/notes/calculus/`)) continue;

      const targetFile = routeToFile(distRoot, url.pathname);
      await assertFile(targetFile, errors);
      if (!url.hash || errors.some((message) => message.endsWith(targetFile))) continue;

      const targetHtml = await getHtml(targetFile);
      const targetIds = new Set(
        [...targetHtml.matchAll(/\bid="([^"]+)"/g)].map((match) => decodeHtml(match[1])),
      );
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (!targetIds.has(fragment)) {
        errors.push(`锚点不存在：${reference}（来源 ${slug}）`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`高数专题链接验收失败：\n- ${[...new Set(errors)].join('\n- ')}`);
  }
  return { articleCount: ARTICLE_SLUGS.length };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = await validateCalculusBuild(path.join(repositoryRoot, 'dist'));
  console.log(`高数专题构建验收通过：${result.articleCount} 篇文章的站内链接、锚点与附件均可访问。`);
}
