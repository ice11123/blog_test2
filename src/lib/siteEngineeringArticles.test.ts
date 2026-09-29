import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const seriesRoot = resolve(
  'src',
  'content',
  'blog',
  'AI-Agent协作与开发',
  '网站开发与维护',
);

const expectedSlugs = [
  '00-site-engineering-index',
  '01-static-architecture',
  '02-content-routing-discovery',
  '03-layout-theme-responsive',
  '04-motion-state-machine',
  '05-data-performance',
  '06-markdown-mdx-pipeline',
  '07-admin-publishing',
  '08-testing-ci-deployment',
  '09-evidence-driven-maintenance',
] as const;

const articleFiles = readdirSync(seriesRoot)
  .filter((name) => name.endsWith('.md'))
  .sort();

function readArticle(slug: string): string {
  return readFileSync(resolve(seriesRoot, `${slug}.md`), 'utf8');
}

test('网站开发与维护系列保持完整、稳定的教学顺序', () => {
  assert.deepEqual(
    articleFiles,
    expectedSlugs.map((slug) => `${slug}.md`),
  );

  expectedSlugs.forEach((slug, index) => {
    const source = readArticle(slug);
    const number = String(index).padStart(2, '0');

    assert.match(source, new RegExp(`^title: "${number}｜`, 'm'), `${slug} 的标题编号应与文件顺序一致`);
    assert.match(source, /^pubDate: "2026-09-29"$/m, `${slug} 应记录本系列发布日期`);
    assert.match(source, /^author: "离子怪"$/m, `${slug} 应使用站点作者`);
    assert.match(source, /^sourceUrl: "https:\/\/github\.com\/ice11123\/blog_test2/m, `${slug} 应链接真实源码证据`);
    assert.match(source, /^dir1: "AI\/Agent协作与开发"$/m, `${slug} 的一级分类错误`);
    assert.match(source, /^dir2: "网站开发与维护"$/m, `${slug} 的二级分类错误`);
    assert.match(source, /^## 摘要$/m, `${slug} 缺少摘要`);
    assert.match(source, /^\*\*关键词：\*\*/m, `${slug} 缺少关键词`);
    assert.match(source, /^## 1\./m, `${slug} 缺少编号正文结构`);
    assert.match(source, /^## \d+\. .*局限|^## \d+\. 局限/m, `${slug} 缺少局限讨论`);
    assert.match(source, /结论/m, `${slug} 缺少结论`);
    assert.ok(!source.includes('D:\\'), `${slug} 不应泄露本机绝对路径`);
  });
});

test('总索引可以直达每一篇专题文章', () => {
  const index = readArticle(expectedSlugs[0]);

  for (const slug of expectedSlugs.slice(1)) {
    assert.ok(
      index.includes(`/blog_test2/blog/ai-agent协作与开发/网站开发与维护/${slug}/`),
      `总索引缺少 ${slug} 的真实生产路由`,
    );
  }
});

test('文章明确记录当前能力边界而非历史设想', () => {
  const themeArticle = readArticle('03-layout-theme-responsive');
  const adminArticle = readArticle('07-admin-publishing');

  assert.match(themeArticle, /当前真实实现只有 `light` 与 `dark` 两种主题/);
  assert.ok(!themeArticle.includes('当前支持六套主题'));
  assert.match(adminArticle, /`PUBLIC_CLOUD_PUBLISH_ENABLED=false`/);
  assert.match(adminArticle, /云端文章写入当前未启用/);
  assert.match(adminArticle, /已接入的是健康检查和公开状态读取/);
});

test('二级分类顺序显式包含网站开发与维护', () => {
  const constants = readFileSync(resolve('src', 'consts.ts'), 'utf8');
  assert.match(
    constants,
    /'AI\/Agent协作与开发': \['网站开发与维护', 'Agent 工具链', 'Codex 故障排查'\]/,
  );
});
