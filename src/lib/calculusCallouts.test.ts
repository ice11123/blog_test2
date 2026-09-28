import assert from 'node:assert/strict';
import test from 'node:test';

import { remarkGithubAlerts } from '../plugins/remark-github-alerts.ts';

function paragraph(value: string) {
  return { type: 'paragraph', children: [{ type: 'text', value }] };
}

test('高数自定义 callout 保留正文节点并附加原稿颜色语义', () => {
  const formula = { type: 'math', value: 'x^2+y^2=1' };
  const blockquote: any = {
    type: 'blockquote',
    children: [paragraph('[!blue-ink] 选法原则'), formula],
  };
  const tree: any = { type: 'root', children: [blockquote] };

  remarkGithubAlerts()(tree);

  assert.deepEqual(blockquote.data.hProperties.className, [
    'calculus-callout',
    'calculus-callout-blue-ink',
    'calculus-callout-blue',
  ]);
  assert.equal(blockquote.children[0].data.hProperties.className[0], 'calculus-callout-label');
  assert.equal(blockquote.children[0].children[0].children[0].value, '蓝笔补充｜选法原则');
  assert.equal(blockquote.children[1], formula);
});

test('红笔 callout 使用红色语义且不重复相同标题', () => {
  const blockquote: any = {
    type: 'blockquote',
    children: [paragraph('[!red-ink] 重点订正\n不能倒推。')],
  };
  const tree: any = { type: 'root', children: [blockquote] };

  remarkGithubAlerts()(tree);

  assert.ok(blockquote.data.hProperties.className.includes('calculus-callout-red'));
  assert.equal(blockquote.children[0].children[0].children[0].value, '重点订正');
  assert.equal(blockquote.children[1].children[0].value, '不能倒推。');
});

test('折叠式来源说明仍保留标题和中性色语义', () => {
  const blockquote: any = {
    type: 'blockquote',
    children: [paragraph('[!source-note]- 原稿第 5 页')],
  };
  const tree: any = { type: 'root', children: [blockquote] };

  remarkGithubAlerts()(tree);

  assert.ok(blockquote.data.hProperties.className.includes('calculus-callout-neutral'));
  assert.equal(blockquote.children[0].children[0].children[0].value, '来源说明｜原稿第 5 页');
});
