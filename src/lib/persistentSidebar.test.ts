import test from 'node:test';
import assert from 'node:assert/strict';
import type { SidebarPost } from './blogData.ts';
import { computeSidebarStats, getSeriesPosts } from './persistentSidebar.ts';

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

test('二级分类存在时系列文章限定在同一最深分类并按日期倒序', () => {
  assert.deepEqual(getSeriesPosts(posts, '开发', 'Astro').map((post) => post.slug), ['a', 'b']);
});

test('没有二级分类时系列文章回退到同一一级分类', () => {
  assert.deepEqual(getSeriesPosts(posts, '开发').map((post) => post.slug), ['a', 'c', 'b']);
  assert.deepEqual(getSeriesPosts(posts).map((post) => post.slug), []);
});
