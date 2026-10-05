import { getCollection } from 'astro:content';
import { resolveDirs } from './utils';
import { createHash } from 'node:crypto';
import { extractSearchText, type SearchItem } from './searchContent';

export interface SidebarPost {
  title: string;
  slug: string;
  pubDate: Date;
  dir1: string;
  dir2: string;
  tags: string[];
}

export type SearchPost = SearchItem;

export async function getSidebarData(): Promise<SidebarPost[]> {
  const allPosts = await getCollection('blog');
  return allPosts.map(post => {
    const dirs = resolveDirs(post);
    return {
      title: post.data.title,
      slug: post.id,
      pubDate: post.data.pubDate,
      dir1: dirs.dir1,
      dir2: dirs.dir2,
      tags: post.data.tags || [],
    };
  });
}

export async function getSearchData(): Promise<SearchPost[]> {
  const allPosts = await getCollection('blog');
  return allPosts.map(post => {
    const dirs = resolveDirs(post);
    return {
      title: post.data.title,
      description: post.data.description.replace(/<[^>]+>/g, ''),
      dir1: dirs.dir1,
      dir2: dirs.dir2,
      tags: (post.data.tags || []).join(', '),
      slug: post.id,
      content: extractSearchText(post.body ?? ''),
    };
  });
}

async function buildSearchIndex() {
  const data = await getSearchData();
  const body = JSON.stringify(data);
  const version = createHash('sha256').update(body).digest('hex').slice(0, 16);
  return { version, body };
}

let productionIndex: ReturnType<typeof buildSearchIndex> | undefined;
export function getSearchIndex() {
  // 生产构建的所有页面共享一份快照；开发模式每次读取，避免编辑文章后缓存过期。
  if (import.meta.env.DEV) return buildSearchIndex();
  return productionIndex ??= buildSearchIndex();
}
