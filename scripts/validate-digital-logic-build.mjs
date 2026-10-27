import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function attributes(source, name) {
  return [...source.matchAll(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'g'))]
    .map(match => (match[1] ?? match[2] ?? match[3]).replaceAll('&amp;', '&').replaceAll('&quot;', '"'));
}

export async function validateDigitalLogicBuild(distRoot, manifest) {
  const cache = new Map();
  const errors = new Set();
  let imageCount = 0;
  let linkCount = 0;
  const routeFile = pathname => {
    const relative = decodeURIComponent(pathname).replace(/^\/blog_test2\//, '');
    const target = path.resolve(distRoot, relative);
    if (target !== path.resolve(distRoot) && !target.startsWith(path.resolve(distRoot) + path.sep)) throw new Error(`路径越界：${pathname}`);
    return /\.[a-z\d]+$/i.test(relative) ? target : path.join(target, 'index.html');
  };
  const read = async file => {
    if (!cache.has(file)) cache.set(file, await readFile(file, 'utf8'));
    return cache.get(file);
  };
  for (const article of manifest.articles) {
    const file = path.join(distRoot, 'blog/学习笔记/数电', article.slug, 'index.html');
    const source = await read(file);
    const body = source.match(/<div class="[^"]*article-content[^\"]*">([\s\S]*?)<\/article>/)?.[1] ?? source;
    const images = attributes(body, 'src').filter(url => url.includes('/notes/digital-logic/'));
    imageCount += images.length;
    if (images.length !== article.imageCount) errors.add(`${article.slug} 图片数量：${images.length}，应为 ${article.imageCount}`);
    if (/katex-error/.test(body)) errors.add(`${article.slug} 存在公式渲染错误`);
    if (/\[!(?:note|tip|warning|abstract|info|example)\]/i.test(body)) errors.add(`${article.slug} 残留未转换提示块`);
    if (/href=["']?(?:\.\.\/|附件\/|codex-work-files\/)/.test(body)) errors.add(`${article.slug} 残留本地链接`);
    for (const ref of [...attributes(source, 'href'), ...images]) {
      const url = new URL(ref, 'https://example.invalid');
      if (url.origin !== 'https://example.invalid' || !url.pathname.startsWith('/blog_test2/')) continue;
      const target = routeFile(url.pathname);
      try {
        if (!(await stat(target)).isFile()) throw new Error('不是文件');
        linkCount++;
        if (url.hash && target.endsWith('.html')) {
          const ids = new Set(attributes(await read(target), 'id'));
          if (!ids.has(decodeURIComponent(url.hash.slice(1)))) errors.add(`${article.slug} 锚点缺失：${ref}`);
        }
      } catch { errors.add(`${article.slug} 目标缺失：${ref}`); }
    }
  }
  for (const asset of manifest.assets) {
    try { await stat(path.join(distRoot, 'notes/digital-logic', asset)); }
    catch { errors.add(`附件缺失：${asset}`); }
  }
  const chapters = [...new Set(manifest.articles.map(article => article.dir3).filter(Boolean))];
  if (chapters.length) {
    const categoryRoot = path.join(distRoot, 'blog/category/学习笔记/数电芯片笔记');
    const categoryHtml = await read(path.join(categoryRoot, 'index.html'));
    const groups = categoryHtml.match(/data-directory-level=(?:"3"|'3'|3)(?=[\s>])/g) ?? [];
    if (groups.length !== chapters.length) errors.add(`三级章节分组应有 ${chapters.length} 个，实际 ${groups.length}`);
    if (/<details[^>]*class=["'][^"']*chapter-group[^>]*\bopen(?:[\s=>])/i.test(categoryHtml)) errors.add('三级章节不应默认展开');
    for (const chapter of chapters) {
      const chapterHtml = await read(path.join(categoryRoot, chapter, 'index.html'));
      const expected = manifest.articles.filter(article => article.dir3 === chapter);
      const chapterLinks = attributes(chapterHtml, 'href').map(ref => {
        try { return decodeURIComponent(new URL(ref, 'https://example.invalid').pathname); }
        catch { return ref; }
      });
      for (const article of expected) {
        if (!chapterLinks.some(link => link.endsWith(`/${article.slug}/`))) errors.add(`${chapter} 缺少文章 ${article.slug}`);
      }
      if (!chapterHtml.includes('四级文章')) errors.add(`${chapter} 缺少第四级文章标识`);
    }
  }
  if (errors.size) throw new Error(`数电笔记构建验收失败：\n${[...errors].join('\n')}`);
  return { articles: manifest.articles.length, assets: manifest.assets.length, images: imageCount, checkedLinks: linkCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = JSON.parse(await readFile(path.join(root, 'scripts/data/digital-logic-notes.json'), 'utf8'));
  console.log('数电笔记构建验收通过：' + JSON.stringify(await validateDigitalLogicBuild(path.join(root, 'dist'), manifest)));
}
