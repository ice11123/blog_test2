import DOMPurify from 'dompurify';
import katex from 'katex';
import { marked, Renderer } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';

const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
const SAFE_URL = /^(?:https?:|mailto:|\/|#)/i;
const ALERT_TYPES = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);
const ALERT_LABELS: Record<string, string> = {
  NOTE: 'Note', TIP: 'Tip', IMPORTANT: 'Important', WARNING: 'Warning', CAUTION: 'Caution',
};

let mermaidPromise: Promise<any> | null = null;
let mermaidCounter = 0;

function escapeHtml(value = ''): string {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] || char);
}

function stripDocumentSyntax(source: string): string {
  return source
    .replace(/^---\s*[\s\S]*?\n---\s*/, '')
    // 只移除文档前缀，正文代码块中的 import/export 必须原样保留。
    .replace(/^(?:\s*(?:import|export)\b[^\n]*\n)+\s*/, '');
}

function preserveBlankLines(source: string, tokens: Map<string, string>): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = [];
  let blankLineCount = 0;
  let fenceMarker = '';

  const flushBlankLines = (hasFollowingContent: boolean) => {
    if (!blankLineCount) return;

    // Markdown 本身只需要一个空行分隔段落；其余空行由预览专用占位符保留。
    // 这里仅改变浏览器预览，保存和发布的正文仍保持用户输入的原始 Markdown。
    const paragraphSeparator = output.length > 0 && hasFollowingContent ? 1 : 0;
    if (paragraphSeparator) output.push('');

    const preservedCount = blankLineCount - paragraphSeparator;
    if (preservedCount > 0) {
      const token = `ADMINPREVIEWBLANK${tokens.size}TOKEN`;
      const spacers = '<span aria-hidden="true"></span>'.repeat(preservedCount);
      tokens.set(token, `<div class="preview-blank-lines" aria-hidden="true">${spacers}</div>`);
      output.push(token);
    }
    blankLineCount = 0;
  };

  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMarker) {
      output.push(line);
      if (fence && fence[1][0] === fenceMarker[0] && fence[1].length >= fenceMarker.length) fenceMarker = '';
      continue;
    }
    if (fence) {
      flushBlankLines(true);
      fenceMarker = fence[1];
      output.push(line);
      continue;
    }
    if (!line.trim()) {
      blankLineCount += 1;
      continue;
    }
    flushBlankLines(true);
    output.push(line);
  }
  flushBlankLines(false);
  return output.join('\n');
}

function parseProps(raw: string): Record<string, string> {
  const props: Record<string, string> = {};
  const pattern = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;
  for (const match of raw.matchAll(pattern)) {
    props[match[1]] = (match[2] ?? match[3] ?? match[4] ?? '').trim();
  }
  return props;
}

function componentCard(name: string, rawProps = ''): string {
  const props = parseProps(rawProps);
  const useful = Object.entries(props).slice(0, 6);
  const details = useful.length
    ? `<dl>${useful.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`
    : '<p>该组件没有可展示的静态参数。</p>';
  const title = name === 'Plot3D' ? 'Plot3D 三维图形安全预览' : `${escapeHtml(name)} 组件预览`;
  return `<div class="preview-component-card" data-preview-component="${escapeHtml(name)}"><strong>${title}</strong>${details}<small>${name === 'Plot3D' ? '正式页面发布后会加载可交互图形；管理台不会执行文章中的表达式。' : '该组件暂不执行，仅展示安全占位。'}</small></div>`;
}

function extractComponents(source: string, tokens: Map<string, string>): string {
  let next = source.replace(/<Spoiler\b([^>]*)>([\s\S]*?)<\/Spoiler>/gi, (_all, rawProps, body) => {
    const props = parseProps(rawProps);
    const token = `ADMINPREVIEWCOMPONENT${tokens.size}TOKEN`;
    const inner = marked.parse(body.trim(), { gfm: true, breaks: true, async: false }) as string;
    tokens.set(token, `<details class="preview-spoiler" open><summary>${escapeHtml(props.hint || '展开隐藏内容')}</summary><div class="preview-spoiler-content">${inner}</div></details>`);
    return `\n\n${token}\n\n`;
  });

  next = next.replace(/<Plot3D\b([\s\S]*?)\/>/gi, (_all, rawProps) => {
    const token = `ADMINPREVIEWCOMPONENT${tokens.size}TOKEN`;
    tokens.set(token, componentCard('Plot3D', rawProps));
    return `\n\n${token}\n\n`;
  });

  next = next.replace(/<([A-Z][\w]*)\b([^>]*)>([\s\S]*?)<\/\1>/g, (_all, name, rawProps) => {
    const token = `ADMINPREVIEWCOMPONENT${tokens.size}TOKEN`;
    tokens.set(token, componentCard(name, rawProps));
    return `\n\n${token}\n\n`;
  });

  return next.replace(/<([A-Z][\w]*)\b([\s\S]*?)\/>/g, (_all, name, rawProps) => {
    const token = `ADMINPREVIEWCOMPONENT${tokens.size}TOKEN`;
    tokens.set(token, componentCard(name, rawProps));
    return `\n\n${token}\n\n`;
  });
}

function extractMath(source: string, mathTokens: Map<string, string>): string {
  let next = source.replace(/\$\$([\s\S]*?)\$\$/g, (_all, expression) => {
    const token = `ADMINPREVIEWMATH${mathTokens.size}TOKEN`;
    try {
      mathTokens.set(token, katex.renderToString(expression.trim(), { displayMode: true, throwOnError: false, strict: false }));
    } catch {
      mathTokens.set(token, `<pre class="preview-render-error">公式无法解析：${escapeHtml(expression.trim())}</pre>`);
    }
    return `\n\n${token}\n\n`;
  });
  next = next.replace(/(?<!\\)\$([^$\n]+?)\$/g, (_all, expression) => {
    const token = `ADMINPREVIEWMATH${mathTokens.size}TOKEN`;
    try {
      mathTokens.set(token, katex.renderToString(expression.trim(), { displayMode: false, throwOnError: false, strict: false }));
    } catch {
      mathTokens.set(token, `<code>${escapeHtml(expression.trim())}</code>`);
    }
    return token;
  });
  return next;
}

function transformAlerts(source: string, tokens: Map<string, string>): string {
  const lines = source.split('\n');
  const output: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
    if (!match || !ALERT_TYPES.has(match[1].toUpperCase())) {
      output.push(lines[index]);
      continue;
    }
    const type = match[1].toUpperCase();
    const content = [match[2]];
    while (index + 1 < lines.length && /^>/.test(lines[index + 1])) {
      index += 1;
      content.push(lines[index].replace(/^>\s?/, ''));
    }
    const token = `ADMINPREVIEWALERT${tokens.size}TOKEN`;
    const body = marked.parse(content.join('\n'), { gfm: true, breaks: true, async: false }) as string;
    tokens.set(token, `<div class="github-alert github-alert-${type.toLowerCase()}"><div class="github-alert-header"><span class="github-alert-label">${ALERT_LABELS[type]}</span></div><div class="github-alert-body">${body}</div></div>`);
    output.push('', token, '');
  }
  return output.join('\n');
}

function createRenderer(): Renderer {
  const renderer = new marked.Renderer();
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.link = ({ href, title, tokens }) => {
    const url = SAFE_URL.test(String(href || '')) ? String(href) : '';
    const label = marked.Parser.parseInline(tokens);
    if (!url) return label;
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    return `<a href="${escapeHtml(url)}"${titleAttr} rel="noopener noreferrer">${label}</a>`;
  };
  renderer.image = ({ href, title, text }) => {
    const url = SAFE_URL.test(String(href || '')) ? String(href) : '';
    if (!url) return escapeHtml(text || '图片');
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text || '')}"${titleAttr} loading="lazy">`;
  };
  renderer.code = ({ text, lang }) => {
    const language = String(lang || '').trim().toLowerCase();
    if (language === 'mermaid') return `<pre class="mermaid" data-mermaid-code="${escapeHtml(text)}">${escapeHtml(text)}</pre>`;
    const grammar = Prism.languages[language] || Prism.languages.markup;
    const highlighted = Prism.highlight(text, grammar, language || 'markup');
    return `<pre class="preview-code language-${escapeHtml(language || 'text')}"><code class="language-${escapeHtml(language || 'text')}">${highlighted}</code></pre>`;
  };
  return renderer;
}

export function renderPreview(source: string): string {
  const tokens = new Map<string, string>();
  const mathTokens = new Map<string, string>();
  let markdown = stripDocumentSyntax(source);
  markdown = preserveBlankLines(markdown, tokens);
  markdown = extractComponents(markdown, tokens);
  markdown = extractMath(markdown, mathTokens);
  markdown = transformAlerts(markdown, tokens);
  let html = marked.parse(markdown, { gfm: true, breaks: true, async: false, renderer: createRenderer() }) as string;
  for (const [token, replacement] of tokens) {
    html = html
      .replaceAll(`<p>${token}</p>\n`, replacement)
      .replaceAll(`<p>${token}</p>`, replacement)
      .replaceAll(token, replacement);
  }
  let sanitized = DOMPurify.sanitize(html, {
    ADD_ATTR: ['class', 'data-mermaid-code', 'data-preview-component', 'open'],
    ADD_TAGS: ['details', 'summary'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style'],
  });
  // KaTeX 的布局依赖它自身生成的受控内联 style（上下标、根号、积分等）。
  // 普通文章 HTML 先完成严格净化，再回填本地 KaTeX 生成结果，避免向用户 HTML 开放 style。
  for (const [token, replacement] of mathTokens) {
    sanitized = sanitized.replaceAll(token, replacement);
  }
  return sanitized;
}

function css(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

async function loadMermaid(): Promise<any> {
  if ((window as any).mermaid) return (window as any).mermaid;
  if (!mermaidPromise) {
    mermaidPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${MERMAID_CDN}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve((window as any).mermaid), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = MERMAID_CDN;
      script.onload = () => resolve((window as any).mermaid);
      script.onerror = () => reject(new Error('Mermaid CDN 加载失败'));
      document.head.appendChild(script);
    });
  }
  return mermaidPromise;
}

export async function renderPreviewMermaid(root: HTMLElement): Promise<void> {
  const diagrams = [...root.querySelectorAll<HTMLElement>('pre.mermaid')];
  if (!diagrams.length) return;
  try {
    const mermaid = await loadMermaid();
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'strict',
      themeVariables: {
        primaryColor: css('--accent'), primaryTextColor: css('--foreground-light'),
        primaryBorderColor: css('--accent-dark'), secondaryColor: css('--muted'),
        tertiaryColor: css('--muted-light'), lineColor: css('--border'),
        textColor: css('--foreground'), mainBkg: css('--background-dark'),
        nodeBorder: css('--accent-dark'), edgeLabelBackground: css('--background-dark'),
      },
      fontFamily: css('--font-family') || 'inherit',
      flowchart: { useMaxWidth: true, htmlLabels: true },
    });
    for (const element of diagrams) {
      const code = element.dataset.mermaidCode || element.textContent || '';
      try {
        const { svg } = await mermaid.render(`admin-mermaid-${++mermaidCounter}`, code);
        if (!element.isConnected) continue;
        element.innerHTML = svg;
        element.dataset.processed = 'true';
      } catch {
        element.classList.add('preview-render-error');
        element.textContent = `Mermaid 图表无法解析\n\n${code}`;
      }
    }
  } catch {
    for (const element of diagrams) element.classList.add('preview-render-error');
  }
}
