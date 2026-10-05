interface RecentPost {
  id: string;
  data: { title: string; pubDate: Date; dir1?: string; dir2?: string };
}

/** 首页按系列发现内容；不会修改调用者数组或完整目录的排序。 */
export function selectRecentSeries<T extends RecentPost>(posts: readonly T[], limit = 4) {
  const groups = new Map<string, T[]>();
  for (const post of posts) {
    const key = post.data.dir2 ? JSON.stringify([post.data.dir1 ?? '', post.data.dir2]) : post.id;
    const group = groups.get(key) ?? [];
    group.push(post);
    groups.set(key, group);
  }
  return [...groups.values()].map(group => {
    const sorted = [...group].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
    const series = sorted.length > 1 && Boolean(sorted[0].data.dir2);
    const post = series ? sorted.find(item => /总索引|总导航|^00[｜\s]/.test(item.data.title)) ?? sorted[0] : sorted[0];
    return { post, count: sorted.length, seriesName: series ? post.data.dir2! : '', latestDate: sorted[0].data.pubDate };
  }).sort((a, b) => b.latestDate.valueOf() - a.latestDate.valueOf() || a.post.id.localeCompare(b.post.id))
    .slice(0, Math.max(0, limit));
}
