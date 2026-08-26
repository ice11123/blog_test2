export const HOME_COVER_DIRECTION_LOCK_DISTANCE = 12;
export const HOME_COVER_DIRECTION_RATIO = 1.25;
export const HOME_COVER_SWIPE_DISTANCE = 56;
export const HOME_COVER_SWIPE_MIN_DISTANCE = 20;
export const HOME_COVER_SWIPE_VELOCITY = 0.11;
export const HOME_COVER_SETTLE_MIN_MS = 140;
export const HOME_COVER_SETTLE_MAX_MS = 240;
export const HOME_COVER_WHEEL_LINE_HEIGHT = 16;
export const HOME_COVER_PAGE_TOP_TOLERANCE = 1;

export type HomeCoverSwipeAction = 'expand' | 'collapse';
export type HomeCoverGestureDirection = 'horizontal' | 'vertical' | null;

interface HomeCoverProgressInput {
  startProgress: number;
  intentDelta: number;
  travelDistance: number;
}

interface HomeCoverSettleInput {
  progress: number;
  intentDistance: number;
  elapsedMs: number;
  deltaX?: number;
  cancelled?: boolean;
}

interface HomeCoverTakeoverInput {
  isHomeRoute: boolean;
  pageScrollY: number;
  progress: number;
  intentDelta: number;
  clientY?: number;
  headerHeight?: number;
  freshInput?: boolean;
}

export interface HomeCoverReleaseResult {
  progress: number;
  velocity: number;
  target: 0 | 1;
  durationMs: number;
}

export function clampHomeCoverProgress(progress: number): number {
  return Math.min(Math.max(progress, 0), 1);
}

export function resolveHomeCoverDirection(deltaX: number, verticalDistance: number): HomeCoverGestureDirection {
  const horizontalDistance = Math.abs(deltaX);
  const absoluteVerticalDistance = Math.abs(verticalDistance);
  if (Math.max(horizontalDistance, absoluteVerticalDistance) < HOME_COVER_DIRECTION_LOCK_DISTANCE) return null;
  if (absoluteVerticalDistance > horizontalDistance * HOME_COVER_DIRECTION_RATIO) return 'vertical';
  if (horizontalDistance > absoluteVerticalDistance * HOME_COVER_DIRECTION_RATIO) return 'horizontal';
  return null;
}

/** Positive intent expands the wallpaper; negative intent collapses it. */
export function resolveHomeCoverProgress({
  startProgress,
  intentDelta,
  travelDistance,
}: HomeCoverProgressInput): number {
  return clampHomeCoverProgress(startProgress + intentDelta / Math.max(travelDistance, 1));
}

export function resolveHomeCoverTakeover({
  isHomeRoute,
  pageScrollY,
  progress,
  intentDelta,
  clientY,
  headerHeight = 0,
  freshInput = true,
}: HomeCoverTakeoverInput): boolean {
  if (!isHomeRoute || intentDelta === 0) return false;
  if (clientY !== undefined && clientY < headerHeight) return false;

  const clampedProgress = clampHomeCoverProgress(progress);
  if (clampedProgress <= 0) {
    return freshInput && pageScrollY <= HOME_COVER_PAGE_TOP_TOLERANCE && intentDelta > 0;
  }
  if (clampedProgress >= 1) return intentDelta < 0;
  return true;
}

export function classifyHomeCoverSwipe({
  deltaX = 0,
  intentDistance,
  elapsedMs,
  progress,
  cancelled = false,
}: HomeCoverSettleInput): HomeCoverSwipeAction | null {
  if (cancelled || resolveHomeCoverDirection(deltaX, intentDistance) !== 'vertical') return null;

  const distance = Math.abs(intentDistance);
  const velocity = distance / Math.max(elapsedMs, 1);
  const passesThreshold =
    distance >= HOME_COVER_SWIPE_DISTANCE ||
    (distance >= HOME_COVER_SWIPE_MIN_DISTANCE && velocity >= HOME_COVER_SWIPE_VELOCITY);

  if (!passesThreshold) return null;
  if (intentDistance > 0 && progress < 1) return 'expand';
  if (intentDistance < 0 && progress > 0) return 'collapse';
  return null;
}

export function resolveHomeCoverTarget({
  progress,
  intentDistance,
  elapsedMs,
  deltaX = 0,
  cancelled = false,
}: HomeCoverSettleInput): 0 | 1 {
  const clampedProgress = clampHomeCoverProgress(progress);
  const direction = resolveHomeCoverDirection(deltaX, intentDistance);
  const movedPastDirectionLock = Math.max(Math.abs(deltaX), Math.abs(intentDistance)) >= HOME_COVER_DIRECTION_LOCK_DISTANCE;
  if (cancelled || direction === 'horizontal' || (movedPastDirectionLock && direction !== 'vertical')) {
    return clampedProgress >= 0.5 ? 1 : 0;
  }

  const distance = Math.abs(intentDistance);
  const velocity = distance / Math.max(elapsedMs, 1);
  const passesThreshold =
    distance >= HOME_COVER_SWIPE_DISTANCE ||
    (distance >= HOME_COVER_SWIPE_MIN_DISTANCE && velocity >= HOME_COVER_SWIPE_VELOCITY);
  if (passesThreshold) return intentDistance > 0 ? 1 : 0;
  return clampedProgress >= 0.5 ? 1 : 0;
}

export function resolveHomeCoverSettleDuration(progress: number, target: 0 | 1, reduceMotion = false): number {
  if (reduceMotion) return 0;
  const remaining = Math.abs(target - clampHomeCoverProgress(progress));
  if (remaining === 0) return 0;
  return Math.round(HOME_COVER_SETTLE_MIN_MS + (HOME_COVER_SETTLE_MAX_MS - HOME_COVER_SETTLE_MIN_MS) * remaining);
}

export function resolveHomeCoverRelease(input: HomeCoverSettleInput & { reduceMotion?: boolean }): HomeCoverReleaseResult {
  const progress = clampHomeCoverProgress(input.progress);
  const velocity = input.intentDistance / Math.max(input.elapsedMs, 1);
  const target = resolveHomeCoverTarget(input);
  return {
    progress,
    velocity,
    target,
    durationMs: resolveHomeCoverSettleDuration(progress, target, input.reduceMotion),
  };
}

export function normalizeHomeCoverWheelDelta(deltaY: number, deltaMode: number, viewportHeight: number): number {
  if (deltaMode === 1) return deltaY * HOME_COVER_WHEEL_LINE_HEIGHT;
  if (deltaMode === 2) return deltaY * Math.max(viewportHeight, 1);
  return deltaY;
}

export function normalizeHomeCoverWheelIntent(deltaY: number, deltaMode: number, viewportHeight: number): number {
  return -normalizeHomeCoverWheelDelta(deltaY, deltaMode, viewportHeight);
}
