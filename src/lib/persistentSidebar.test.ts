import test from 'node:test';
import assert from 'node:assert/strict';
import type { SidebarPost } from './blogData.ts';
import {
  buildArticleDirectory,
  buildTagDirectory,
  computeSidebarStats,
} from './persistentSidebar.ts';

const posts: SidebarPost[] = [
  { title: 'A', slug: 'a', pubDate: new Date('2026-08-03'), dir1: '开发', dir2: 'Astro', tags: ['Astro', '前端'] },
  { title: 'B', slug: 'b', pubDate: new Date('2026-08-01'), dir1: '开发', dir2: 'Astro', tags: ['Astro'] },
  { title: 'C', slug: 'c', pubDate: new Date('2026-08-02'), dir1: '开发', dir2: '工具', tags: ['工具'] },
  { title: 'D', slug: 'd', pubDate: new Date('2026-07-01'), dir1: '随笔', dir2: '', tags: [] },
];

test('侧栏统计按一级分类和去重标签计算', () => {
  assert.deepEqual(computeSidebarStats(posts), {
    totalArticles: 4,
    totalCategories: 2,
    totalTags: 3,
  });
});

test('文章目录按一级和二级分类分组，组内按日期倒序', () => {
  const directory = buildArticleDirectory(posts);

  assert.deepEqual(directory.map(({ name, total }) => ({ name, total })), [
    { name: '开发', total: 3 },
    { name: '随笔', total: 1 },
  ]);
  assert.deepEqual(directory[0].directPosts, []);
  assert.deepEqual(directory[0].subdirectories.map(({ name, posts }) => ({
    name,
    slugs: posts.map((post) => post.slug),
  })), [
    { name: '工具', slugs: ['c'] },
    { name: 'Astro', slugs: ['a', 'b'] },
  ]);
  assert.deepEqual(directory[1].directPosts.map((post) => post.slug), ['d']);
});

test('标签目录按文章数倒序并对同数量标签稳定排序', () => {
  assert.deepEqual(buildTagDirectory(posts), [
    { name: 'Astro', count: 2 },
    { name: '工具', count: 1 },
    { name: '前端', count: 1 },
  ]);
});
