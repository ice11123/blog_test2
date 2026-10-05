import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ARTICLE_HEADING_OFFSET,
  findActiveHeadingIndex,
  headingScrollTarget,
} from './tocGeometry.ts';

test('长目录使用缓存定位，重合标题选择最后一个已越过基准线的章节', () => {
  const tops = Array.from({ length: 10000 }, (_, i) => i * 100);
  assert.equal(findActiveHeadingIndex(tops, 500000, 0), 5000);
  assert.equal(findActiveHeadingIndex([100, 100, 200], 100, 0), 1);
  assert.equal(findActiveHeadingIndex([], 100), -1);
});

test('目录点击目标与章节高亮共享同一阅读基准线', () => {
  const headingTop = 700;
  const targetScrollY = headingScrollTarget(headingTop);

  assert.equal(DEFAULT_ARTICLE_HEADING_OFFSET, 104);
  assert.equal(targetScrollY, 596);
  assert.equal(findActiveHeadingIndex([headingTop, 1400], targetScrollY), 0);
});

test('长章节中间持续高亮当前章节，下一标题越过基准线后才切换', () => {
  const headings = [700, 1400, 2100];

  assert.equal(findActiveHeadingIndex(headings, 1100), 0);
  assert.equal(findActiveHeadingIndex(headings, 1295), 0);
  assert.equal(findActiveHeadingIndex(headings, 1296), 1);
});

test('首个标题之前不误高亮，页面顶部附近的目标不会产生负滚动值', () => {
  assert.equal(findActiveHeadingIndex([700, 1400], 100), -1);
  assert.equal(headingScrollTarget(72), 0);
  assert.equal(headingScrollTarget(2220.34375 + 88, 88), 2221);
});

test('原生深链接的亚像素舍入不误高亮上一节，完整一像素仍保留边界', () => {
  assert.equal(findActiveHeadingIndex([1800, 2300.46875], 2196), 1);
  assert.equal(findActiveHeadingIndex([1800, 2301], 2196), 0);
});
