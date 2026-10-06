export interface DiscoveryTag { name: string; count: number; }
export const COMMON_TAG_LIMIT = 16;
export const TAG_BATCH_SIZE = 24;

export function matchesTagFilter(name: string, query: string): boolean {
  const normalize = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase();
  return normalize(name).includes(normalize(query));
}

export function countArticleTags(posts: ReadonlyArray<{ data: { tags?: readonly string[] } }>): DiscoveryTag[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    // 篇数按文章计；标签名称保留原值，避免改变真实路由。
    for (const name of new Set(post.data.tags ?? [])) {
      if (!name.trim()) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts].map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function groupDiscoveryTags(tags: readonly DiscoveryTag[]) {
  const sorted = [...tags].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
  const common = sorted.filter((tag) => tag.count > 1).slice(0, COMMON_TAG_LIMIT);
  const names = new Set(common.map((tag) => tag.name));
  return { common, more: sorted.filter((tag) => !names.has(tag.name)) };
}

export function selectDiscoveryTags(tags: readonly DiscoveryTag[], query: string, limit = Infinity): DiscoveryTag[] {
  const matched = tags.filter((tag) => matchesTagFilter(tag.name, query));
  // 搜索覆盖全部标签，不受已展开数量影响。
  return query.trim() ? matched : matched.slice(0, Math.max(0, limit));
}
