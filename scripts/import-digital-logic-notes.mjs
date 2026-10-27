import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor, parseFrontmatter } from '@astrojs/markdown-remark';
import GithubSlugger, { slug as githubSlug } from 'github-slugger';
import remarkMath from 'remark-math';

export const BASE = '/blog_test2';
export const CONTENT_DIRECTORY = '学习笔记/数电';
export const ASSET_DIRECTORY = 'notes/digital-logic';
export const NOTE_MARKER = '<!-- blog2-digital-logic-note -->';
const encodePath = value => value.split('/').map(encodeURIComponent).join('/');
const html = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const textOf = node => node.value ?? (node.children ?? []).map(textOf).join('');

export function normalizeDisplayMath(source) {
  let fence = '';
  let fenceLength = 0;
  let display = false;
  const output = [];
  for (const line of source.split(/\r?\n/)) {
    const [, prefix, content] = line.match(/^((?:[ ]{0,3}>[ ]?)*[ ]{0,3})(.*)$/);
    const marker = content.match(/^(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) { fence = marker[1][0]; fenceLength = marker[1].length; }
      else if (marker[1][0] === fence && marker[1].length >= fenceLength) fence = '';
      output.push(line);
      continue;
    }
    if (fence) { output.push(line); continue; }
    // Obsidian 允许 $$ 与公式同一行；remark-math 的多行块要求分隔符独占行。
    // 只改变分隔符换行，不更改公式、文字或代码块中的示例。
    if (!display && content.startsWith('$$')) {
      const rest = content.slice(2);
      if (rest.trimEnd().endsWith('$$')) {
        output.push(`${prefix}$$`, `${prefix}${rest.trimEnd().slice(0, -2)}`, `${prefix}$$`);
      } else {
        output.push(`${prefix}$$`);
        if (rest) output.push(`${prefix}${rest}`);
        display = true;
      }
    } else if (display && content.trimEnd().endsWith('$$')) {
      const expression = content.trimEnd().slice(0, -2);
      if (expression) output.push(`${prefix}${expression}`);
      output.push(`${prefix}$$`);
      display = false;
    } else output.push(line);
  }
  if (display) throw new Error('笔记中存在未闭合的块公式');
  return output.join('\n');
}

export async function inspectMarkdown(source) {
  let tree;
  const capture = () => value => { tree = value; };
  const processor = await createMarkdownProcessor({ syntaxHighlight: false, smartypants: false, remarkPlugins: [remarkMath, capture] });
  await processor.render(source);
  const nodes = [];
  function visit(node) { nodes.push(node); for (const child of node.children ?? []) visit(child); }
  visit(tree);
  return { tree, nodes };
}

export function resolveSourceReference(raw, currentSource, knownPaths) {
  if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(raw)) return { external: true, href: raw };
  const hashAt = raw.indexOf('#');
  const rawPath = hashAt < 0 ? raw : raw.slice(0, hashAt);
  const fragment = hashAt < 0 ? '' : decodeURIComponent(raw.slice(hashAt + 1));
  const decoded = decodeURIComponent(rawPath).replaceAll('\\', '/');
  if (!decoded) return { source: currentSource, fragment };
  const relative = path.posix.normalize(path.posix.join(path.posix.dirname(currentSource), decoded));
  if (knownPaths.has(relative)) return { source: relative, fragment };
  // 原笔记中存在旧备份前缀；只接受本批目录中确实存在的完整后缀，不按同名索引猜测章节。
  const marker = '数电各章节芯片/';
  const at = decoded.lastIndexOf(marker);
  if (at >= 0) {
    const suffix = path.posix.normalize(decoded.slice(at + marker.length));
    if (knownPaths.has(suffix)) return { source: suffix, fragment };
  }
  if (relative.startsWith('../') && /\.md$/i.test(decoded)) return { unpublished: true, source: decoded, fragment };
  throw new Error(`无法解析本批笔记引用：${currentSource} → ${raw}`);
}

async function listFiles(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`不读取符号链接：${entry.name}`);
    const name = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(root, name));
    else if (entry.isFile()) result.push(name);
  }
  return result.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));
}

export async function planDigitalLogicImport(sourceRoot) {
  const files = await listFiles(sourceRoot);
  const knownPaths = new Set(files);
  const notes = new Map();
  for (const source of files.filter(name => /\.md$/i.test(name))) {
    const original = await readFile(path.join(sourceRoot, source), 'utf8');
    const { frontmatter, content: rawContent } = parseFrontmatter(original);
    const content = normalizeDisplayMath(rawContent);
    const parsed = await inspectMarkdown(content);
    const heading = parsed.nodes.find(node => node.type === 'heading' && node.depth === 1);
    if (!heading) throw new Error(`笔记缺少一级标题：${source}`);
    const chapter = path.posix.dirname(source).match(/^第(\d+)章 (.+)$/);
    const originalTitle = textOf(heading);
    const title = chapter
      ? `第${chapter[1]}章 ${chapter[2]}—${source.endsWith('/00_本章芯片索引.md') ? '本章芯片索引' : originalTitle}`
      : originalTitle;
    const paragraph = parsed.nodes.find(node => node.type === 'paragraph' && !node.children.some(child => child.type === 'link' || child.type === 'image') && textOf(node).length > 25);
    const description = (paragraph ? textOf(paragraph).replace(/^\[![^\]]+\][+-]?[^\n]*\n?/, '') : `${originalTitle}，保留原笔记中的阅读重点与资料导航。`).replace(/\s+/g, ' ').slice(0, 170);
    notes.set(source, { source, original, content, frontmatter, heading, title, description, chapter: chapter ? Number(chapter[1]) : 0, ...parsed });
  }
  // 章节按编号排列；章内沿本章索引的链接顺序，未列出的补充卡放在章末。
  const ordered = [...notes.values()].filter(note => !note.chapter);
  const chapters = [...new Set([...notes.values()].map(note => note.chapter).filter(Boolean))].sort((a, b) => a - b);
  for (const chapter of chapters) {
    const members = [...notes.values()].filter(note => note.chapter === chapter);
    const index = members.find(note => note.source.endsWith('/00_本章芯片索引.md'));
    if (!index) throw new Error(`第${chapter}章缺少索引`);
    ordered.push(index);
    const linked = new Set([index.source]);
    for (const node of index.nodes.filter(node => node.type === 'link')) {
      const resolved = resolveSourceReference(node.url, index.source, knownPaths);
      const note = notes.get(resolved.source);
      if (note?.chapter === chapter && !linked.has(note.source)) { linked.add(note.source); ordered.push(note); }
    }
    ordered.push(...members.filter(note => !linked.has(note.source)));
  }
  ordered.forEach((note, order) => {
    if (order > 99) throw new Error('现有目录排序支持两位编号，导入数量超过范围');
    note.slug = `${String(order).padStart(2, '0')}-${note.chapter ? `ch${String(note.chapter).padStart(2, '0')}-` : ''}${githubSlug(path.posix.basename(note.source, '.md'))}`;
    note.url = `${BASE}/blog/${encodePath(CONTENT_DIRECTORY)}/${encodeURIComponent(note.slug)}/`;
    note.sourceSha256 = createHash('sha256').update(note.original).digest('hex');
    const slugger = new GithubSlugger();
    note.anchors = new Map(note.nodes.filter(node => node.type === 'heading').map(node => [textOf(node), slugger.slug(textOf(node))]));
  });
  const assets = files.filter(name => !/\.md$/i.test(name));
  if (assets.some(name => !/\.(?:png|jpe?g|webp|svg)$/i.test(name))) throw new Error('存在非图片附件，须先核对发布范围');
  return { ordered, notes, assets, knownPaths };
}

export function convertDigitalLogicBody(note, plan) {
  const edits = [];
  const unpublished = [];
  let imageCount = 0;
  const replace = (node, value) => edits.push({ start: node.position.start.offset, end: node.position.end.offset, value });
  replace(note.heading, `<span id="${html(note.anchors.get(textOf(note.heading)))}" class="article-top-anchor" aria-hidden="true"></span>`);
  for (const node of note.nodes) {
    if (!['link', 'image'].includes(node.type)) continue;
    const resolved = resolveSourceReference(node.url, note.source, plan.knownPaths);
    if (resolved.external) continue;
    if (resolved.unpublished) {
      if (node.type === 'image') throw new Error(`图片不在上传目录：${node.url}`);
      unpublished.push(node.url);
      replace(node, `<span title="引用资料不在本次上传范围，尚未发布至网站">${html(textOf(node))}<small>（本地资料未发布）</small></span>`);
      continue;
    }
    const targetNote = plan.notes.get(resolved.source);
    let href;
    if (targetNote) {
      const anchor = resolved.fragment && (targetNote.anchors.get(resolved.fragment) ?? resolved.fragment);
      href = `${targetNote.url}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`;
    } else {
      href = `${BASE}/${ASSET_DIRECTORY}/${encodePath(resolved.source)}`;
    }
    if (node.type === 'image') {
      const match = (node.alt || '').match(/^(.*)\|(\d+)(?:x(\d+))?$/);
      const alt = match ? match[1] : node.alt || '';
      const width = match ? ` width="${match[2]}"` : '';
      replace(node, `<img src="${html(href)}" alt="${html(alt)}"${width} loading="lazy" decoding="async">`);
      imageCount++;
    } else {
      const original = note.content.slice(node.position.start.offset, node.position.end.offset);
      const labelEnd = original.lastIndexOf('](');
      if (labelEnd < 0) throw new Error(`暂不支持引用式链接：${note.source}`);
      replace(node, `${original.slice(0, labelEnd + 1)}(${href})`);
    }
  }
  let body = note.content;
  let previousStart = body.length + 1;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    if (edit.end > previousStart) throw new Error(`转换区间重叠：${note.source}`);
    body = body.slice(0, edit.start) + edit.value + body.slice(edit.end);
    previousStart = edit.start;
  }
  // 保留 Markdown 换行语义，同时使生成内容通过 git diff --check。
  body = body.replace(/ {2,}$/gm, '<br>').replace(/[\t ]+$/gm, '');
  return { body: `${NOTE_MARKER}\n${body.trim()}\n`, imageCount, unpublished };
}

export async function importDigitalLogicNotes({ sourceRoot, repositoryRoot, pubDate, overwrite = false }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pubDate)) throw new Error('必须显式指定 --date YYYY-MM-DD');
  const plan = await planDigitalLogicImport(sourceRoot);
  const converted = plan.ordered.map(note => ({ note, ...convertDigitalLogicBody(note, plan) }));
  const contentRoot = path.join(repositoryRoot, 'src/content/blog', CONTENT_DIRECTORY);
  const assetRoot = path.join(repositoryRoot, 'public', ASSET_DIRECTORY);
  await mkdir(contentRoot, { recursive: true });
  for (const { note, body } of converted) {
    const metadata = {
      ...note.frontmatter,
      title: note.title, description: note.description, pubDate, author: '离子怪',
      sourceUrl: `https://github.com/ice11123/blog_test2/blob/main/src/content/blog/${encodePath(`${CONTENT_DIRECTORY}/${note.slug}.md`)}`,
      dir1: '学习笔记', dir2: '数电',
      tags: [...new Set(['数电', '芯片笔记', ...(note.frontmatter.tags || [])])],
    };
    const frontmatter = Object.entries(metadata).map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`).join('\n');
    await writeFile(path.join(contentRoot, `${note.slug}.md`), `---\n${frontmatter}\n---\n\n${body}`, { encoding: 'utf8', flag: overwrite ? 'w' : 'wx' });
  }
  for (const asset of plan.assets) {
    const destination = path.join(assetRoot, asset);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(sourceRoot, asset), destination);
  }
  const manifest = {
    pubDate,
    articles: converted.map(({ note, imageCount, unpublished }) => ({ source: note.source, sourceSha256: note.sourceSha256, slug: note.slug, title: note.title, chapter: note.chapter, imageCount, unpublishedLocalReferences: unpublished })),
    assets: plan.assets,
  };
  await mkdir(path.join(repositoryRoot, 'scripts/data'), { recursive: true });
  await writeFile(path.join(repositoryRoot, 'scripts/data/digital-logic-notes.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { articleCount: converted.length, assetCount: plan.assets.length, imageCount: converted.reduce((sum, note) => sum + note.imageCount, 0), unpublishedReferenceCount: converted.reduce((sum, note) => sum + note.unpublished.length, 0) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const value = name => args[args.indexOf(name) + 1];
  if (!args.includes('--source') || !args.includes('--date')) throw new Error('用法：--source 笔记目录 --date YYYY-MM-DD [--overwrite]');
  console.log(JSON.stringify(await importDigitalLogicNotes({ sourceRoot: path.resolve(value('--source')), repositoryRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), pubDate: value('--date'), overwrite: args.includes('--overwrite') }), null, 2));
}
