import { compareDirectoryPostMetadata } from './postOrdering.ts';

interface DirectoryMetadata {
  title: string;
  slug: string;
  pubDate: Date;
  dir3?: string;
}

/** 先按现有学习顺序排序，再分组，章节顺序不依赖汉字排序或 Map 输入顺序。 */
export function thirdLevelDirectory<T>(posts: readonly T[], metadata: (post: T) => DirectoryMetadata) {
  const ordered = [...posts].sort((a, b) => {
    const x = metadata(a);
    const y = metadata(b);
    return compareDirectoryPostMetadata(x.title, x.pubDate, y.title, y.pubDate, x.slug, y.slug);
  });
  const groups = new Map<string, T[]>();
  for (const post of ordered) {
    const name = metadata(post).dir3 || '';
    const group = groups.get(name) ?? [];
    group.push(post);
    groups.set(name, group);
  }
  return [...groups].map(([name, posts]) => ({ name, posts }));
}
