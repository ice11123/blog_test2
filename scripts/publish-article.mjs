import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const contentRoot = path.resolve(root, 'src', 'content', 'blog');
const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('-'));
const noPush = args.includes('--no-push');
const noBuild = args.includes('--no-build');
const overwrite = args.includes('--overwrite');
if (!input) fail('用法：pnpm publish:article -- "导出的文章文件路径" [--overwrite] [--no-push] [--no-build]');

const repoRoot = read('git', ['rev-parse', '--show-toplevel']);
if (path.resolve(repoRoot) !== path.resolve(root)) fail('请在 blog_test2 仓库根目录运行发布命令。');
const stagedFiles = read('git', ['diff', '--cached', '--name-only']);
if (stagedFiles) fail(`暂存区存在未提交改动，请先处理后再发布：\n${stagedFiles}`);
if (!noPush) {
  const branch = read('git', ['branch', '--show-current']);
  if (branch !== 'main') fail(`自动推送仅允许在 main 分支执行，当前分支：${branch || '(detached HEAD)'}`);
  const origin = read('git', ['remote', 'get-url', 'origin']).replace(/\\/g, '/').replace(/\.git$/, '');
  if (!origin.endsWith('ice11123/blog_test2')) fail(`origin 未指向 ice11123/blog_test2：${origin}`);
}

const sourcePath = path.resolve(root, input);
if (!fs.existsSync(sourcePath)) fail(`找不到文件：${input}`);
const ext = path.extname(sourcePath).toLowerCase();
if (!['.md', '.mdx'].includes(ext)) fail('文章文件必须是 .md 或 .mdx。');
const source = fs.readFileSync(sourcePath, 'utf8');
const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
if (!match) fail('文章缺少有效 frontmatter。');
const data = {};
for (const line of match[1].split(/\r?\n/)) {
  const i = line.indexOf(':');
  if (i < 1) continue;
  data[line.slice(0, i).trim()] = parseValue(line.slice(i + 1).trim());
}
if (!String(data.title || '').trim()) fail('frontmatter 缺少 title。');
const safe = (value) => String(value || '').trim().replace(/[<>:"\\|?*\u0000-\u001f]/g, '-').replace(/[\\/]+/g, '-').replace(/\.+$/g, '') || 'untitled';
const sourceRelative = path.relative(contentRoot, sourcePath);
const sourceDirs = sourceRelative.startsWith('..') ? [] : path.dirname(sourceRelative).split(path.sep).filter((value) => value && value !== '.');
const dirs = [data.dir1, data.dir2].filter((value) => typeof value === 'string' && value.trim()).map(safe);
if (!dirs.length && sourceDirs.length) dirs.push(...sourceDirs.map(safe));
const target = path.resolve(contentRoot, ...dirs, `${safe(path.basename(sourcePath, ext))}${ext}`);
const rel = path.relative(contentRoot, target);
if (rel.startsWith('..') || path.isAbsolute(rel)) fail('目标路径不在文章目录内。');
if (fs.existsSync(target) && !overwrite) fail(`目标文章已存在：${path.relative(root, target)}。确认覆盖时请添加 --overwrite。`);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `---\n${match[1].trim()}\n---\n\n${match[2].trim()}\n`, 'utf8');
const repoRel = path.relative(root, target).replaceAll(path.sep, '/');
console.log(`已写入 ${repoRel}`);
if (!noBuild) { run('pnpm', ['run', 'check']); run('pnpm', ['run', 'build']); }
run('git', ['add', '--', repoRel]);
const status = execFileSync('git', ['status', '--short', '--', repoRel], { cwd: root, encoding: 'utf8' }).trim();
if (!status) { console.log('没有检测到变化。'); process.exit(0); }
run('git', ['commit', '--only', '-m', `更新文章：${data.title}`, '--', repoRel]);
if (!noPush) { run('git', ['push', 'origin', 'main']); console.log('已推送到 origin/main，等待 GitHub Actions 部署。'); }
else console.log('已创建本地提交，未推送。');

function parseValue(raw) {
  if (raw.startsWith('[') && raw.endsWith(']')) { try { return JSON.parse(raw); } catch { return raw.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean); } }
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) return raw.slice(1, -1);
  return raw;
}
function run(command, commandArgs) { console.log(`> ${command} ${commandArgs.join(' ')}`); execFileSync(command, commandArgs, { cwd: root, stdio: 'inherit' }); }
function read(command, commandArgs) {
  try {
    return execFileSync(command, commandArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    const detail = String(error?.stderr || error?.message || '').trim();
    fail(detail ? `${command} 执行失败：${detail}` : `${command} 执行失败。`);
  }
}
function fail(message) { console.error(`发布失败：${message}`); process.exit(1); }
