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
  return runPublish(root, input, ['--no-push', '--no-build', ...extraArgs]);
}

function runPublish(root, input, args = []) {
  return spawnSync(process.execPath, [
    path.join(root, 'scripts', 'publish-article.mjs'),
    input,
    ...args,
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

test('目标文章存在未提交改动时拒绝覆盖', (t) => {
  const root = createRepository();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const target = path.join(root, 'src', 'content', 'blog', 'export.mdx');
  fs.writeFileSync(target, article('仓库版本'));
  git(root, ['add', 'src/content/blog/export.mdx']);
  git(root, ['commit', '-m', 'Add article']);
  fs.writeFileSync(target, article('尚未提交的人工修改'));
  fs.writeFileSync(path.join(root, 'export.mdx'), article('导出版本'));

  const result = publish(root, 'export.mdx', ['--overwrite']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /目标文章存在未提交改动/);
  assert.match(fs.readFileSync(target, 'utf8'), /尚未提交的人工修改/);
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

test('提交失败时恢复目标文章和暂存区', (t) => {
  const root = createRepository();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const target = path.join(root, 'src', 'content', 'blog', 'export.mdx');
  fs.writeFileSync(target, article('仓库版本'));
  git(root, ['add', 'src/content/blog/export.mdx']);
  git(root, ['commit', '-m', 'Add article']);
  fs.writeFileSync(path.join(root, 'export.mdx'), article('导出版本'));

  const hooks = path.join(root, 'test-hooks');
  fs.mkdirSync(hooks);
  const preCommitHook = path.join(hooks, 'pre-commit');
  fs.writeFileSync(preCommitHook, '#!/bin/sh\nexit 1\n');
  fs.chmodSync(preCommitHook, 0o755);
  git(root, ['config', 'core.hooksPath', hooks]);

  const result = publish(root, 'export.mdx', ['--overwrite']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /目标文章已回滚/);
  assert.match(fs.readFileSync(target, 'utf8'), /仓库版本/);
  assert.equal(git(root, ['diff', '--cached', '--name-only']), '');
  assert.equal(git(root, ['status', '--short', '--', 'src/content/blog/export.mdx']), '');
});

test('推送失败保留提交并可用 resume-push 重试', (t) => {
  const root = createRepository();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const remote = path.join(root, 'remotes', 'ice11123', 'blog_test2.git');
  fs.mkdirSync(path.dirname(remote), { recursive: true });
  execFileSync('git', ['init', '--bare', remote], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git(root, ['remote', 'add', 'origin', remote]);
  const hook = path.join(remote, 'hooks', 'pre-receive');
  fs.writeFileSync(hook, '#!/bin/sh\nexit 1\n');
  fs.chmodSync(hook, 0o755);
  fs.writeFileSync(path.join(root, 'export.mdx'), article('待恢复推送'));

  const failed = runPublish(root, 'export.mdx', ['--no-build']);
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /本地提交已保留/);
  assert.match(git(root, ['show', '--format=%s', '--no-patch', 'HEAD']), /更新文章：待恢复推送/);
  assert.equal(git(root, ['status', '--short', '--', 'src/content/blog/export.mdx']), '');

  fs.rmSync(hook);
  const resumed = runPublish(root, 'export.mdx', ['--no-build', '--resume-push']);
  assert.equal(resumed.status, 0, `${resumed.stdout}\n${resumed.stderr}`);
  assert.match(resumed.stdout, /已重新推送 origin\/main/);
  assert.equal(git(root, ['rev-parse', 'HEAD']), git(remote, ['rev-parse', 'refs/heads/main']));
});
