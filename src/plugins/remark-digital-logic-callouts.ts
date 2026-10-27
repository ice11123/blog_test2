/** 只处理数电导入笔记：保留公式、图片、表格与 Mermaid 的 AST，不把正文压成字符串。 */
const MARKER = '<!-- blog2-digital-logic-note -->';
const TONES: Record<string, string> = { note: 'note', info: 'note', abstract: 'note', tip: 'tip', warning: 'warning', example: 'important' };

export function remarkDigitalLogicCallouts() {
  return (tree: any) => {
    if (!tree.children?.some((node: any) => node.type === 'html' && node.value.trim() === MARKER)) return;
    tree.children = tree.children.filter((node: any) => node.type !== 'html' || node.value.trim() !== MARKER);
    function visit(node: any) {
      if (node.type === 'blockquote') {
        const paragraph = node.children?.[0];
        const text = paragraph?.type === 'paragraph' && paragraph.children?.[0];
        const match = text?.type === 'text' && text.value.match(/^\[!([a-z]+)\]([+-])?(?:[ \t]+([^\r\n]*))?(?:\r?\n([\s\S]*))?$/i);
        if (match && TONES[match[1].toLowerCase()]) {
          const folded = Boolean(match[2]);
          const label = (match[3] || match[1]).trim();
          if (match[4]) text.value = match[4];
          else paragraph.children.shift();
          const content = paragraph.children.length ? node.children : node.children.slice(1);
          node.data = { hName: folded ? 'details' : 'div', hProperties: { className: ['github-alert', `github-alert-${TONES[match[1].toLowerCase()]}`], ...(match[2] === '+' ? { open: true } : {}) } };
          node.children = [{ type: 'paragraph', data: { hName: folded ? 'summary' : 'p', hProperties: { className: ['github-alert-label'] } }, children: [{ type: 'text', value: label }] }, ...content];
        }
      }
      for (const child of node.children ?? []) visit(child);
    }
    visit(tree);
  };
}
