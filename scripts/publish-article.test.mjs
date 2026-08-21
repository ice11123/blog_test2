import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptSource = fileURLToPath(new URL('./publish-article.mjs', import.meta.url));

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function createRepository() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-test2-publish-'));
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'content', 'blog'), { recursive: true });
  fs.copyFileSync(scriptSource, path.join(root, 'scripts', 'publish-article.mjs'));
  fs.writeFileSync(path.join(root, 'README.md'), '# Test repository\n');
  git(root, ['init', '-b', 'main']);
  git(root, ['config', 'user.name', 'Test User']);
  git(root, ['config', 'user.email', 'test@example.com']);
  git(root, ['add', 'README.md']);
  git(root, ['commit', '-m', 'Initial commit']);
  return root;
}

function article(title, body = '# 正文') {
  return `---\ntitle: ${title}\ndescription: 测试文章\npubDate: 2026-08-21\ntags: []\n---\n\n${body}\n`;
}

function publish(root, input, extraArgs = []) {
  return spawnSync(process.execPath, [
    path.join(root, 'scripts', 'publish-article.mjs'),
    input,
    '--no-push',
    '--no-build',
    ...extraArgs,
  ], { cwd: root, encoding: 'utf8' });
}

test('暂存区非空时在写入文章前停止', (t) => {
  const root = createRepository();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'export.mdx'), article('新文章'));
  fs.writeFileSync(path.join(root, 'staged.txt'), '不能夹带\n');
  git(root, ['add', 'staged.txt']);

  const result = publish(root, 'export.mdx');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /暂存区存在未提交改动/);
  assert.equal(fs.existsSync(path.join(root, 'src', 'content', 'blog', 'export.mdx')), false);
});

test('同名目标默认拒绝覆盖', (t) => {
  const root = createRepository();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const target = path.join(root, 'src', 'content', 'blog', 'export.mdx');
  fs.writeFileSync(target, article('仓库版本'));
  git(root, ['add', 'src/content/blog/export.mdx']);
  git(root, ['commit', '-m', 'Add article']);
  fs.writeFileSync(path.join(root, 'export.mdx'), article('导出版本'));

  const result = publish(root, 'export.mdx');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /确认覆盖时请添加 --overwrite/);
  assert.match(fs.readFileSync(target, 'utf8'), /仓库版本/);
});

test('显式覆盖只提交目标文章', (t) => {
  const root = createRepository();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const target = path.join(root, 'src', 'content', 'blog', 'export.mdx');
  fs.writeFileSync(target, article('仓库版本'));
  git(root, ['add', 'src/content/blog/export.mdx']);
  git(root, ['commit', '-m', 'Add article']);
  fs.writeFileSync(path.join(root, 'export.mdx'), article('导出版本', '# 新正文'));
  fs.writeFileSync(path.join(root, 'untracked.txt'), '不应进入提交\n');

  const result = publish(root, 'export.mdx', ['--overwrite']);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.deepEqual(git(root, ['show', '--name-only', '--pretty=format:', 'HEAD']).split(/\r?\n/).filter(Boolean), [
    'src/content/blog/export.mdx',
  ]);
  assert.equal(fs.existsSync(path.join(root, 'untracked.txt')), true);
  assert.match(fs.readFileSync(target, 'utf8'), /导出版本/);
});
