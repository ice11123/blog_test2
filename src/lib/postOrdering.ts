const NUMBERED_SERIES_PREFIX = /^(\d{2})｜/;

export function compareDirectoryPostMetadata(
  aTitle: string,
  aDate: Date,
  bTitle: string,
  bDate: Date,
): number {
  const aOrder = aTitle.match(NUMBERED_SERIES_PREFIX)?.[1];
  const bOrder = bTitle.match(NUMBERED_SERIES_PREFIX)?.[1];

  if (aOrder && bOrder) return Number(aOrder) - Number(bOrder);
  return bDate.valueOf() - aDate.valueOf();
}
