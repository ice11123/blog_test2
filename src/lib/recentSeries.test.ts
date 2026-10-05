import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRecentSeries } from './recentSeries.ts';

const post = (id: string, dir1: string, dir2: string, date: number, title = id) =>
  ({ id, data: { title, dir1, dir2, pubDate: new Date(date) } });

test('首页聚合重复系列，使用总索引入口但显示该系列最新日期', () => {
  const input = [post('index', '学习笔记', '高数', 1, '高数总索引'),
    post('ch1', '学习笔记', '高数', 2), post('ch2', '学习笔记', '高数', 3),
    post('tool', 'AI', '工具', 4), post('power', '电源', '', 5)];
  const original = [...input];
  const entries = selectRecentSeries(input);
  assert.deepEqual(input, original);
  assert.equal(entries.length, 3);
  assert.equal(entries[2].post.id, 'index');
  assert.equal(entries[2].count, 3);
  assert.equal(entries[2].seriesName, '高数');
  assert.equal(entries[2].latestDate.valueOf(), 3);
});

test('不同一级分组中的同名系列不合并，无二级标题的独立文章不合并', () => {
  const entries = selectRecentSeries([post('a', 'AI', '入门', 1), post('b', '电控', '入门', 2),
    post('c', '其他', '', 3), post('d', '其他', '', 4)]);
  assert.equal(entries.length, 4);
  assert.ok(entries.every(entry => entry.count === 1 && entry.seriesName === ''));
  assert.equal(selectRecentSeries([], 4).length, 0);
  assert.equal(selectRecentSeries([post('a', '', '', 1)], 0).length, 0);
});
