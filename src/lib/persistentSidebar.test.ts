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

test('文章目录按一级和二级分类分组，普通文章按日期倒序', () => {
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

test('编号专题在侧栏按编号升序展示', () => {
  const directory = buildArticleDirectory([
    { title: '10｜交付', slug: '10', pubDate: new Date('2026-09-19T17:00:00+08:00'), dir1: '小车组', dir2: 'TI小车实战', tags: [] },
    { title: '01｜总览', slug: '01', pubDate: new Date('2026-09-19T08:00:00+08:00'), dir1: '小车组', dir2: 'TI小车实战', tags: [] },
    { title: '02｜启动', slug: '02', pubDate: new Date('2026-09-19T09:00:00+08:00'), dir1: '小车组', dir2: 'TI小车实战', tags: [] },
  ]);

  assert.deepEqual(
    directory[0].subdirectories[0].posts.map((post) => post.slug),
    ['01', '02', '10'],
  );
});

test('标签目录按文章数倒序并对同数量标签稳定排序', () => {
  assert.deepEqual(buildTagDirectory(posts), [
    { name: 'Astro', count: 2 },
    { name: '工具', count: 1 },
    { name: '前端', count: 1 },
  ]);
});
