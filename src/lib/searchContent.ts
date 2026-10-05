export interface SearchItem {
  title: string;
  description: string;
  dir1: string;
  dir2: string;
  tags: string;
  slug: string;
  content: string;
}

/** 索引保留正文文字与代码，排除标记、图片地址及 MDX 导入语句。 */
export function extractSearchText(markdown: string): string {
  return markdown
    .replace(/^import\s[^\n]+$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^```[^\n]*$/gm, ' ')
    .replace(/[*#`>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchExcerpt(
  content: string,
  indices: readonly (readonly [number, number])[] = [],
  limit = 180,
  query = '',
): { text: string; indices: [number, number][] } {
  // 长正文的模糊字符匹配可能从导航文字开始；有完整词命中时优先展示该段。
  const exact = query ? content.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1;
  const matches = exact >= 0 ? [[exact, exact + query.length - 1] as const] : indices;
  const first = matches[0]?.[0] ?? 0;
  const start = Math.max(0, first - 45);
  const end = Math.min(content.length, start + limit);
  const prefix = start > 0 ? '…' : '';
  return {
    text: prefix + content.slice(start, end) + (end < content.length ? '…' : ''),
    indices: matches.filter(([a, b]) => b >= start && a < end)
      .map(([a, b]) => [Math.max(a, start) - start + prefix.length, Math.min(b, end - 1) - start + prefix.length]),
  };
}
