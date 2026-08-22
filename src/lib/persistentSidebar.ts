import type { SidebarPost } from './blogData';

export interface SidebarStats {
  totalArticles: number;
  totalCategories: number;
  totalTags: number;
}

export function computeSidebarStats(posts: SidebarPost[]): SidebarStats {
  return {
    totalArticles: posts.length,
    totalCategories: new Set(posts.map((post) => post.dir1).filter(Boolean)).size,
    totalTags: new Set(posts.flatMap((post) => post.tags).filter(Boolean)).size,
  };
}

export function getSeriesPosts(
  posts: SidebarPost[],
  currentDir1 = '',
  currentDir2 = '',
): SidebarPost[] {
  if (!currentDir1) return [];

  return posts
    .filter((post) => post.dir1 === currentDir1 && (!currentDir2 || post.dir2 === currentDir2))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}
