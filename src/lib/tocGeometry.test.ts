import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ARTICLE_HEADING_OFFSET,
  findActiveHeadingIndex,
  headingScrollTarget,
} from './tocGeometry.ts';

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
});
