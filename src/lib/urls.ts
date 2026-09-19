/** 为站内路径添加 Astro 配置的 base，兼容根站点和 GitHub Pages 项目站点。 */
export function withBase(path = '/'): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;

  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const normalizedPath = `/${path.replace(/^\/+/, '')}`;
  return `${base}${normalizedPath}` || '/';
}

/** 从浏览器 pathname 中移除 Astro base，便于匹配站内路由。 */
export function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (!base) return pathname || '/';
  if (pathname === base) return '/';
  return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
}

/** 根据内容集合的文章 ID 生成编码后的文章地址。 */
export function blogPostPath(slug: string): string {
  const encodedSlug = slug.split('/').map(encodeURIComponent).join('/');
  return withBase(`/blog/${encodedSlug}/`);
}

/** 把分类名编码为单一路径段，避免分类名中的 `/` 被路由误判为新层级。 */
export function blogCategorySegment(category: string): string {
  return category.replaceAll('~', '~7E').replaceAll('/', '~2F');
}

/** 将分类路径段还原为内容集合中的原始分类名。 */
export function parseBlogCategorySegment(segment = ''): string {
  return segment.replaceAll('~2F', '/').replaceAll('~7E', '~');
}

/** 生成分类地址；一级与二级分类各占一个明确路径段。 */
export function blogCategoryPath(dir1: string, dir2?: string): string {
  const segments = [dir1, dir2]
    .filter((segment): segment is string => Boolean(segment))
    .map(blogCategorySegment)
    .join('/');
  return withBase(`/blog/category/${segments}/`);
}
