export const DEFAULT_ARTICLE_HEADING_OFFSET = 104;

function safeOffset(offset: number): number {
  return Number.isFinite(offset) && offset >= 0 ? offset : DEFAULT_ARTICLE_HEADING_OFFSET;
}

export function headingScrollTarget(
  headingTop: number,
  offset = DEFAULT_ARTICLE_HEADING_OFFSET,
): number {
  return Math.max(0, headingTop - safeOffset(offset));
}

export function findActiveHeadingIndex(
  headingTops: readonly number[],
  scrollY: number,
  offset = DEFAULT_ARTICLE_HEADING_OFFSET,
): number {
  const readingLine = scrollY + safeOffset(offset);
  let activeIndex = -1;

  for (let index = 0; index < headingTops.length; index += 1) {
    if (headingTops[index] > readingLine) break;
    activeIndex = index;
  }

  return activeIndex;
}
