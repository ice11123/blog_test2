import test from 'node:test';
import assert from 'node:assert/strict';
import { seriesNeighbors, type SeriesPost } from './seriesNavigation.ts';

const post = (slug: string, dir1 = '学习笔记', dir2 = '高等数学笔记'): SeriesPost => ({ slug, dir1, dir2, title: slug, pubDate: new Date('2026-09-24') });
test('系列导航与目录编号一致，不受输入和发布日期顺序干扰', () => {
  const posts = [post('09-vector'), { ...post('01-limit'), pubDate: new Date('2026-10-01') }, post('00-index'), post('02-derivative'), post('03-other', '电控')];
  const original = posts.map(item => item.slug);
  const result = seriesNeighbors(posts, '01-limit')!;
  assert.equal(result.previous?.slug, '00-index');
  assert.equal(result.next?.slug, '02-derivative');
  assert.equal(result.position, 2);
  assert.equal(result.total, 4);
  assert.deepEqual(posts.map(item => item.slug), original);
});
test('系列端点、未知文章、无二级分类和单篇均正确降级', () => {
  assert.equal(seriesNeighbors([post('a')], 'a'), null);
  assert.equal(seriesNeighbors([post('a', '其他', '')], 'a'), null);
  assert.equal(seriesNeighbors([post('a')], 'missing'), null);
  const posts = [post('01-first'), post('02-last')];
  assert.equal(seriesNeighbors(posts, '01-first')?.previous, null);
  assert.equal(seriesNeighbors(posts, '02-last')?.next, null);
});
