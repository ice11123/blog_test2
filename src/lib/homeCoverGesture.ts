export const HOME_COVER_DIRECTION_LOCK_DISTANCE = 12;
export const HOME_COVER_DIRECTION_RATIO = 1.25;
export const HOME_COVER_SWIPE_DISTANCE = 56;
export const HOME_COVER_SWIPE_MIN_DISTANCE = 20;
export const HOME_COVER_SWIPE_VELOCITY = 0.11;
export const HOME_COVER_SETTLE_MIN_MS = 140;
export const HOME_COVER_SETTLE_MAX_MS = 240;

export type HomeCoverSwipeAction = 'expand' | 'collapse';
export type HomeCoverGestureDirection = 'horizontal' | 'vertical' | null;

interface HomeCoverSwipeInput {
  deltaX: number;
  deltaY: number;
  elapsedMs: number;
  expanded: boolean;
  cancelled?: boolean;
}

interface HomeCoverProgressInput {
  startProgress: number;
  deltaY: number;
  travelDistance: number;
}

interface HomeCoverSettleInput {
  progress: number;
  deltaX?: number;
  deltaY: number;
  elapsedMs: number;
  cancelled?: boolean;
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

export function resolveHomeCoverDirection(deltaX: number, deltaY: number): HomeCoverGestureDirection {
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);
  if (Math.max(horizontalDistance, verticalDistance) < HOME_COVER_DIRECTION_LOCK_DISTANCE) return null;
  if (verticalDistance > horizontalDistance * HOME_COVER_DIRECTION_RATIO) return 'vertical';
  if (horizontalDistance > verticalDistance * HOME_COVER_DIRECTION_RATIO) return 'horizontal';
  return null;
}

export function resolveHomeCoverProgress({
  startProgress,
  deltaY,
  travelDistance,
}: HomeCoverProgressInput): number {
  return clampHomeCoverProgress(startProgress - deltaY / Math.max(travelDistance, 1));
}

export function classifyHomeCoverSwipe({
  deltaX,
  deltaY,
  elapsedMs,
  expanded,
  cancelled = false,
}: HomeCoverSwipeInput): HomeCoverSwipeAction | null {
  if (cancelled || resolveHomeCoverDirection(deltaX, deltaY) !== 'vertical') return null;

  const distance = Math.abs(deltaY);
  const velocity = distance / Math.max(elapsedMs, 1);
  const passesThreshold =
    distance >= HOME_COVER_SWIPE_DISTANCE ||
    (distance >= HOME_COVER_SWIPE_MIN_DISTANCE && velocity >= HOME_COVER_SWIPE_VELOCITY);

  if (!passesThreshold) return null;
  if (deltaY < 0 && !expanded) return 'expand';
  if (deltaY > 0 && expanded) return 'collapse';
  return null;
}

export function resolveHomeCoverTarget({
  progress,
  deltaX = 0,
  deltaY,
  elapsedMs,
  cancelled = false,
}: HomeCoverSettleInput): 0 | 1 {
  const clampedProgress = clampHomeCoverProgress(progress);
  const direction = resolveHomeCoverDirection(deltaX, deltaY);
  const movedPastDirectionLock = Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= HOME_COVER_DIRECTION_LOCK_DISTANCE;
  if (cancelled || direction === 'horizontal' || (movedPastDirectionLock && direction !== 'vertical')) {
    return clampedProgress >= 0.5 ? 1 : 0;
  }

  const distance = Math.abs(deltaY);
  const velocity = distance / Math.max(elapsedMs, 1);
  const passesThreshold =
    distance >= HOME_COVER_SWIPE_DISTANCE ||
    (distance >= HOME_COVER_SWIPE_MIN_DISTANCE && velocity >= HOME_COVER_SWIPE_VELOCITY);
  if (passesThreshold) return deltaY < 0 ? 1 : 0;
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
  const velocity = -input.deltaY / Math.max(input.elapsedMs, 1);
  const target = resolveHomeCoverTarget(input);
  return {
    progress,
    velocity,
    target,
    durationMs: resolveHomeCoverSettleDuration(progress, target, input.reduceMotion),
  };
}
