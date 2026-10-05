import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSearchText, searchExcerpt } from './searchContent.ts';

test('正文索引保留标题、链接文字和代码，不收录图片地址或 MDX 导入', () => {
  const text = extractSearchText('import Widget from "./Widget";\n## 求导法则\n[总导航](./index) ![示意图](/assets/hidden.png)\n```js\nconst velocity = 10;\n```');
  assert.match(text, /求导法则/);
  assert.match(text, /总导航/);
  assert.match(text, /velocity = 10/);
  assert.doesNotMatch(text, /Widget|hidden.png|assets|\[|\]/);
});

test('命中片段围绕正文匹配，并把高亮下标映射到截取后的文字', () => {
  const content = '前'.repeat(240) + '洛必达法则' + '后'.repeat(240);
  const excerpt = searchExcerpt(content, [[240, 244]]);
  assert.equal(excerpt.text[0], '…');
  assert.equal(excerpt.text.slice(...[excerpt.indices[0][0], excerpt.indices[0][1] + 1]), '洛必达法则');
  assert.ok(excerpt.text.length <= 182);
});

test('片段裁剪丢弃界外匹配并限制跨边界高亮', () => {
  assert.deepEqual(searchExcerpt('1234567890', [[0, 8], [9, 9]], 5), {
    text: '12345…', indices: [[0, 4]],
  });
  assert.deepEqual(searchExcerpt(''), { text: '', indices: [] });
});

test('完整词命中优先于正文前面的零散模糊匹配', () => {
  const content = '导航'.repeat(200) + '方向余弦描述了向量与坐标轴的关系';
  const excerpt = searchExcerpt(content, [[0, 1]], 180, '方向余弦');
  assert.ok(excerpt.text.includes('方向余弦'));
  assert.equal(excerpt.text.slice(excerpt.indices[0][0], excerpt.indices[0][1] + 1), '方向余弦');
});
