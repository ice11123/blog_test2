export const DEFAULT_ARTICLE_HEADING_OFFSET = 104;

export function readingProgress(scrollY: number, start: number, end: number, viewportHeight: number, offset = 0): number {
  const distance = Math.max(1, end - viewportHeight - (start - offset));
  return Math.max(0, Math.min(1, (scrollY - start + offset) / distance));
}

function safeOffset(offset: number): number {
  return Number.isFinite(offset) && offset >= 0 ? offset : DEFAULT_ARTICLE_HEADING_OFFSET;
}

export function headingScrollTarget(
  headingTop: number,
  offset = DEFAULT_ARTICLE_HEADING_OFFSET,
): number {
  // scrollTo 在部分浏览器取整；向上取整避免标题差半像素而仍高亮上一节。
  return Math.max(0, Math.ceil(headingTop - safeOffset(offset)));
}

export function findActiveHeadingIndex(
  headingTops: readonly number[],
  scrollY: number,
  offset = DEFAULT_ARTICLE_HEADING_OFFSET,
): number {
  const readingLine = scrollY + safeOffset(offset);
  let low = 0;
  let high = headingTops.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    // 原生 hash 定位可能将 scrollY 取整；容忍不足 1px 的误差，不提前跨过完整像素。
    if (headingTops[middle] < readingLine + 1) low = middle + 1;
    else high = middle;
  }
  return low - 1;
}
