import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureHeadingId } from './headingAnchors.ts';

test('保留 rehype 已生成的稳定标题 ID', () => {
  const heading = { id: '数学公式' };
  const occupied = new Set(['数学公式']);
  assert.equal(ensureHeadingId(heading, 0, occupied), '数学公式');
  assert.equal(heading.id, '数学公式');
});

test('仅为缺少 ID 的标题生成不冲突的后备锚点', () => {
  const heading = { id: '' };
  const occupied = new Set(['heading-0']);
  assert.equal(ensureHeadingId(heading, 0, occupied), 'heading-0-2');
  assert.equal(heading.id, 'heading-0-2');
});
