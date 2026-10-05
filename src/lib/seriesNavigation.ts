import { compareDirectoryPostMetadata } from './postOrdering.ts';

export interface SeriesPost {
  slug: string;
  title: string;
  pubDate: Date;
  dir1: string;
  dir2: string;
}

/** 与全站目录使用同一排序规则，不能用发布时间替代学习顺序。 */
export function seriesNeighbors(posts: readonly SeriesPost[], slug: string) {
  const current = posts.find(post => post.slug === slug);
  if (!current?.dir2) return null;
  const series = posts.filter(post => post.dir1 === current.dir1 && post.dir2 === current.dir2)
    .sort((a, b) => compareDirectoryPostMetadata(a.title, a.pubDate, b.title, b.pubDate, a.slug, b.slug));
  if (series.length < 2) return null;
  const index = series.findIndex(post => post.slug === slug);
  return { name: current.dir2, dir1: current.dir1, position: index + 1, total: series.length,
    previous: series[index - 1] ?? null, next: series[index + 1] ?? null };
}

export type SeriesNavigation = ReturnType<typeof seriesNeighbors>;
