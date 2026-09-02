import type { SidebarPost } from './blogData';

export interface SidebarStats {
  totalArticles: number;
  totalCategories: number;
  totalTags: number;
}

export interface ArticleDirectorySection {
  name: string;
  directPosts: SidebarPost[];
  subdirectories: Array<{
    name: string;
    posts: SidebarPost[];
  }>;
  total: number;
}

export interface TagDirectoryEntry {
  name: string;
  count: number;
}

export function computeSidebarStats(posts: SidebarPost[]): SidebarStats {
  return {
    totalArticles: posts.length,
    totalCategories: new Set(posts.map((post) => post.dir1).filter(Boolean)).size,
    totalTags: new Set(posts.flatMap((post) => post.tags).filter(Boolean)).size,
  };
}

function byNewest(a: SidebarPost, b: SidebarPost): number {
  return b.pubDate.valueOf() - a.pubDate.valueOf();
}

export function buildArticleDirectory(posts: SidebarPost[]): ArticleDirectorySection[] {
  const groups = new Map<string, SidebarPost[]>();

  for (const post of posts) {
    const name = post.dir1 || '未分类';
    const group = groups.get(name) ?? [];
    group.push(post);
    groups.set(name, group);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
    .map(([name, groupPosts]) => {
      const directPosts = groupPosts.filter((post) => !post.dir2).sort(byNewest);
      const nested = new Map<string, SidebarPost[]>();

      for (const post of groupPosts) {
        if (!post.dir2) continue;
        const subgroup = nested.get(post.dir2) ?? [];
        subgroup.push(post);
        nested.set(post.dir2, subgroup);
      }

      return {
        name,
        directPosts,
        subdirectories: [...nested.entries()]
          .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
          .map(([subdirectoryName, subgroupPosts]) => ({
            name: subdirectoryName,
            posts: subgroupPosts.sort(byNewest),
          })),
        total: groupPosts.length,
      };
    });
}

export function buildTagDirectory(posts: SidebarPost[]): TagDirectoryEntry[] {
  const counts = new Map<string, number>();

  for (const tag of posts.flatMap((post) => post.tags)) {
    const normalizedTag = tag.trim();
    if (!normalizedTag) continue;
    counts.set(normalizedTag, (counts.get(normalizedTag) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}
