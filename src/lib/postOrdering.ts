const NUMBERED_SERIES_PREFIX = /^(\d{2})｜/;
const NUMBERED_SLUG_PREFIX = /(?:^|\/)(\d{2})-/;

function resolveSeriesOrder(title: string, slug = ''): number | undefined {
  const order = title.match(NUMBERED_SERIES_PREFIX)?.[1]
    ?? slug.match(NUMBERED_SLUG_PREFIX)?.[1];
  return order ? Number(order) : undefined;
}

export function compareDirectoryPostMetadata(
  aTitle: string,
  aDate: Date,
  bTitle: string,
  bDate: Date,
  aSlug = '',
  bSlug = '',
): number {
  const aOrder = resolveSeriesOrder(aTitle, aSlug);
  const bOrder = resolveSeriesOrder(bTitle, bSlug);

  if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
  return bDate.valueOf() - aDate.valueOf();
}
