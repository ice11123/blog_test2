export const HOME_COVER_SWIPE_DISTANCE = 56;
export const HOME_COVER_SWIPE_MIN_DISTANCE = 20;
export const HOME_COVER_SWIPE_VELOCITY = 0.45;

export type HomeCoverSwipeAction = 'expand' | 'collapse';

interface HomeCoverSwipeInput {
  deltaX: number;
  deltaY: number;
  elapsedMs: number;
  expanded: boolean;
  cancelled?: boolean;
}

export function classifyHomeCoverSwipe({
  deltaX,
  deltaY,
  elapsedMs,
  expanded,
  cancelled = false,
}: HomeCoverSwipeInput): HomeCoverSwipeAction | null {
  if (cancelled) return null;

  const distance = Math.abs(deltaY);
  const velocity = distance / Math.max(elapsedMs, 1);
  const isVertical = distance > Math.abs(deltaX) * 1.25;
  const passesThreshold =
    distance >= HOME_COVER_SWIPE_DISTANCE ||
    (distance >= HOME_COVER_SWIPE_MIN_DISTANCE && velocity >= HOME_COVER_SWIPE_VELOCITY);

  if (!isVertical || !passesThreshold) return null;
  if (deltaY < 0 && !expanded) return 'expand';
  if (deltaY > 0 && expanded) return 'collapse';
  return null;
}
