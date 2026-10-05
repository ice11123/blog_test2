import type { HomeCoverMotionGeometry } from './homeCoverMotionGeometry';

const TIMELINE_DURATION = 1000;
const DRAWER_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

function cubicBezierCoordinate(t: number, first: number, second: number): number {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * first + 3 * inverse * t * t * second + t * t * t;
}

function cubicBezierDerivative(t: number, first: number, second: number): number {
  const inverse = 1 - t;
  return 3 * inverse * inverse * first + 6 * inverse * t * (second - first) + 3 * t * t * (1 - second);
}

function easeHomeCoverSettle(linearProgress: number): number {
  const x = Math.min(Math.max(linearProgress, 0), 1);
  let parameter = x;
  for (let iteration = 0; iteration < 6; iteration += 1) {
    const derivative = cubicBezierDerivative(parameter, 0.32, 0);
    if (Math.abs(derivative) < 0.000001) break;
    parameter -= (cubicBezierCoordinate(parameter, 0.32, 0) - x) / derivative;
    parameter = Math.min(Math.max(parameter, 0), 1);
  }
  return cubicBezierCoordinate(parameter, 0.72, 1);
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

type MotionTrack = {
  element: HTMLElement | SVGElement;
  frameAt: (progress: number) => Keyframe;
};
export type HomeCoverMotionBlueprint = {
  geometry: HomeCoverMotionGeometry;
  imageWidth: number;
  imageHeight: number;
};


export function createHomeCoverTimeline({ stage, viewport, fullImage, drawer, toggle }: {
  stage: HTMLElement; viewport: HTMLElement; fullImage: HTMLImageElement; drawer: HTMLElement; toggle: HTMLButtonElement;
}) {
  const dragAnimations: Animation[] = [];
  const settleAnimations: Animation[] = [];
  const motionTracks: MotionTrack[] = [];
  let settleStartProgress = 0;
  let settleTarget: 0 | 1 = 0;
  let settleDuration = 0;
  const cancelSettleAnimations = () => {
    for (const animation of settleAnimations.splice(0)) animation.cancel();
  };

  const setMotionLayerHints = (active: boolean) => {
    for (const track of motionTracks) {
      if (active) track.element.style.willChange = 'transform';
      else track.element.style.removeProperty('will-change');
    }
  };

  const disposeTimelines = () => {
    for (const animation of dragAnimations.splice(0)) animation.cancel();
    cancelSettleAnimations();
    setMotionLayerHints(false);
    motionTracks.splice(0);
  };

  const createProgressAnimation = (
    element: HTMLElement | SVGElement,
    frameAt: (value: number) => Keyframe,
  ) => {
    const track = { element, frameAt };
    motionTracks.push(track);
    const animation = element.animate([frameAt(0), frameAt(1)], {
      duration: TIMELINE_DURATION,
      easing: 'linear',
      fill: 'both',
    });
    animation.pause();
    dragAnimations.push(animation);
  };

  const createTimelines = (blueprint: HomeCoverMotionBlueprint) => {
    disposeTimelines();
    const { geometry, imageWidth, imageHeight } = blueprint;

    fullImage.style.width = `${imageWidth}px`;
    fullImage.style.height = `${imageHeight}px`;

    createProgressAnimation(stage, (value) => {
      const scaleX = interpolate(geometry.viewportScaleX, 1, value);
      const scaleY = interpolate(geometry.viewportScaleY, 1, value);
      return {
        transform: `translate3d(${geometry.viewportX * (1 - value)}px, ${geometry.viewportY * (1 - value)}px, 0) scale3d(${scaleX}, ${scaleY}, 1)`,
      };
    });
    createProgressAnimation(viewport, (value) => {
      const translateX = geometry.viewportX * (1 - value);
      const translateY = geometry.viewportY * (1 - value);
      const scaleX = interpolate(geometry.viewportScaleX, 1, value);
      const scaleY = interpolate(geometry.viewportScaleY, 1, value);
      return {
        transform: `scale3d(${1 / scaleX}, ${1 / scaleY}, 1) translate3d(${-translateX}px, ${-translateY}px, 0)`,
      };
    });
    createProgressAnimation(fullImage, (value) => ({
      transform: `translate3d(${interpolate(geometry.coverX, geometry.containX, value)}px, ${interpolate(geometry.coverY, geometry.containY, value)}px, 0) scale(${interpolate(geometry.coverScale, geometry.containScale, value)})`,
    }));

    createProgressAnimation(drawer, (value) => ({
      transform: `translate3d(0, ${geometry.drawerDistance * value}px, 0)`,
    }));

    createProgressAnimation(toggle, (value) => ({
      transform: `translate3d(${geometry.handleX * (1 - value)}px, ${geometry.handleY * (1 - value)}px, 0) translateX(-50%)`,
    }));
    const icon = toggle.querySelector<SVGElement>('svg');
    if (icon) createProgressAnimation(icon, (value) => ({ transform: `rotate(${180 * value}deg)` }));
  };


  const seek = (progress: number) => {
    for (const animation of dragAnimations) animation.currentTime = Math.min(Math.max(progress, 0), 1) * TIMELINE_DURATION;
  };
  const sample = (fallback: number) => {
    const settlingTime = settleAnimations[0]?.currentTime;
    if (typeof settlingTime === 'number' && settleDuration > 0) {
      const linearProgress = Math.min(Math.max(settlingTime / settleDuration, 0), 1);
      return settleStartProgress + (settleTarget - settleStartProgress) * easeHomeCoverSettle(linearProgress);
    }
    const dragTime = dragAnimations[0]?.currentTime;
    return typeof dragTime === 'number' ? Math.min(Math.max(dragTime / TIMELINE_DURATION, 0), 1) : fallback;
  };
  const settle = (from: number, target: 0 | 1, duration: number) => {
    cancelSettleAnimations();
    settleStartProgress = from;
    settleTarget = target;
    settleDuration = duration;
    for (const track of motionTracks) {
      settleAnimations.push(track.element.animate([track.frameAt(from), track.frameAt(target)], {
        duration, easing: DRAWER_EASING, fill: 'both',
      }));
    }
    return settleAnimations[0]?.finished ?? null;
  };
  return {
    rebuild: createTimelines, dispose: disposeTimelines, cancelSettle: cancelSettleAnimations,
    setActive: setMotionLayerHints, seek, sample, settle,
    hasTracks: () => motionTracks.length > 0,
    hasAnimations: () => dragAnimations.length > 0 || settleAnimations.length > 0,
  };
}
