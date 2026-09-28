// remark-github-alerts — 将 > [!NOTE] / > [!TIP] 等 GitHub 风格提示块转换为 HTML
const ALERT_TYPES: Record<string, string> = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
};

const ALERT_LABELS: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

const ALERT_ICONS: Record<string, string> = {
  note: 'ℹ️',
  tip: '💡',
  important: '❗',
  warning: '⚠️',
  caution: '🚫',
};

const CALCULUS_CALLOUTS: Record<string, { label: string; tone: string }> = {
  'blue-ink': { label: '蓝笔补充', tone: 'blue' },
  'key-formula': { label: '核心公式', tone: 'blue' },
  'red-ink': { label: '重点订正', tone: 'red' },
  'graph-memory': { label: '图像记忆', tone: 'red' },
  danger: { label: '易错警示', tone: 'red' },
  'editor-note': { label: '编辑说明', tone: 'amber' },
  'source-note': { label: '来源说明', tone: 'neutral' },
};

export function remarkGithubAlerts() {
  return (tree: any) => {
    transform(tree);
  };
}

function transform(node: any) {
  if (!node || typeof node !== 'object') return;
  if (node.children) {
    const newChildren: any[] = [];
    for (const child of node.children) {
      if (transformCalculusCallout(child)) {
        newChildren.push(child);
        continue;
      }
      if (isAlertBlockquote(child)) {
        const html = buildAlertHtml(child);
        if (html) {
          newChildren.push({ type: 'html', value: html });
          continue;
        }
      }
      transform(child);
      newChildren.push(child);
    }
    node.children = newChildren;
  }
}

function transformCalculusCallout(node: any): boolean {
  if (node.type !== 'blockquote' || !node.children?.length) return false;
  const firstParagraph = node.children[0];
  if (firstParagraph.type !== 'paragraph' || !firstParagraph.children?.length) return false;
  const firstText = firstParagraph.children[0];
  if (firstText.type !== 'text') return false;

  const match = firstText.value.match(/^\[!([a-z-]+)\][+-]?(?:[ \t]+([^\r\n]*))?(?:\r?\n([\s\S]*))?$/i);
  if (!match) return false;
  const calloutType = match[1].toLowerCase();
  const definition = CALCULUS_CALLOUTS[calloutType];
  if (!definition) return false;

  const explicitTitle = (match[2] || '').trim();
  const label = explicitTitle && explicitTitle !== definition.label
    ? `${definition.label}｜${explicitTitle}`
    : definition.label;
  const labelParagraph = {
    type: 'paragraph',
    data: { hProperties: { className: ['calculus-callout-label'] } },
    children: [{ type: 'strong', children: [{ type: 'text', value: label }] }],
  };

  const trailingText = match[3] || '';
  if (trailingText) {
    firstText.value = trailingText;
  } else {
    firstParagraph.children.shift();
  }

  const hasBody = firstParagraph.children.length > 0;
  node.children = hasBody
    ? [labelParagraph, firstParagraph, ...node.children.slice(1)]
    : [labelParagraph, ...node.children.slice(1)];
  node.data = {
    ...(node.data || {}),
    hProperties: {
      ...(node.data?.hProperties || {}),
      className: ['calculus-callout', `calculus-callout-${calloutType}`, `calculus-callout-${definition.tone}`],
    },
  };
  return true;
}

function isAlertBlockquote(node: any): boolean {
  if (node.type !== 'blockquote' || !node.children?.length) return false;
  const firstChild = node.children[0];
  if (firstChild.type !== 'paragraph' || !firstChild.children?.length) return false;
  const firstText = firstChild.children[0];
  if (firstText.type !== 'text') return false;
  const match = firstText.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i);
  return !!match;
}

function buildAlertHtml(blockquote: any): string | null {
  const firstPara = blockquote.children[0];
  const firstText = firstPara.children[0];
  const match = firstText.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?(.*)/is);
  if (!match) return null;

  const alertType = ALERT_TYPES[match[1].toUpperCase()];
  const label = ALERT_LABELS[alertType];
  const icon = ALERT_ICONS[alertType];

  // 收集所有内容（处理第一个段落剩下的文本 + 后续段落）
  const contentParts: string[] = [];
  if (match[2]?.trim()) {
    contentParts.push(escapeHtml(match[2].trim()));
  }

  // 如果第一个段落还有更多子节点（文本后的内联元素），追加它们
  const remainingFirstPara = firstPara.children.slice(1);
  if (remainingFirstPara.length > 0) {
    contentParts.push(renderInlineNodes(remainingFirstPara));
  }

  // 处理后续节点
  for (let i = 1; i < blockquote.children.length; i++) {
    const child = blockquote.children[i];
    contentParts.push(renderBlockNode(child));
  }

  const body = contentParts.join('\n');

  return `<div class="github-alert github-alert-${alertType}">
<div class="github-alert-header">
  <span class="github-alert-icon">${icon}</span>
  <span class="github-alert-label">${label}</span>
</div>
<div class="github-alert-body">
${body}
</div>
</div>`;
}

function renderBlockNode(node: any): string {
  if (node.type === 'paragraph') {
    return `<p>${renderInlineNodes(node.children)}</p>`;
  }
  if (node.type === 'code') {
    const lang = node.lang ? ` class="language-${escapeHtml(node.lang)}"` : '';
    return `<pre${lang}><code>${escapeHtml(node.value)}</code></pre>`;
  }
  if (node.type === 'html') {
    return node.value;
  }
  if (node.type === 'list') {
    const tag = node.ordered ? 'ol' : 'ul';
    const items = (node.children || [])
      .map((item: any) => renderBlockNode(item))
      .join('\n');
    return `<${tag}>\n${items}\n</${tag}>`;
  }
  if (node.type === 'listItem') {
    const content = (node.children || [])
      .map((child: any) => renderBlockNode(child))
      .join('\n');
    return `<li>${content}</li>`;
  }
  // fallback: render children as inline
  if (node.children) {
    return `<p>${renderInlineNodes(node.children)}</p>`;
  }
  return '';
}

function renderInlineNodes(nodes: any[]): string {
  if (!nodes) return '';
  return nodes
    .map((node: any) => {
      if (node.type === 'text') return escapeHtml(node.value);
      if (node.type === 'inlineCode') return `<code>${escapeHtml(node.value)}</code>`;
      if (node.type === 'strong') return `<strong>${renderInlineNodes(node.children)}</strong>`;
      if (node.type === 'emphasis') return `<em>${renderInlineNodes(node.children)}</em>`;
      if (node.type === 'delete') return `<del>${renderInlineNodes(node.children)}</del>`;
      if (node.type === 'link') {
        const href = escapeHtml(node.url || '');
        const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
        return `<a href="${href}"${title}>${renderInlineNodes(node.children)}</a>`;
      }
      if (node.type === 'image') {
        const src = escapeHtml(node.url || '');
        const alt = escapeHtml(node.alt || '');
        const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
        return `<img src="${src}" alt="${alt}"${title}>`;
      }
      if (node.type === 'html') return node.value;
      if (node.children) return renderInlineNodes(node.children);
      return '';
    })
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
