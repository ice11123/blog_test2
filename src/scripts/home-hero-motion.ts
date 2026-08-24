import {
  normalizeHomeCoverWheelDelta,
  resolveHomeCoverDirection,
  resolveHomeCoverProgress,
  resolveHomeCoverRelease,
  resolveHomeCoverSettleDuration,
  resolveHomeCoverWheelTarget,
} from '../lib/homeCoverGesture';

const COVER_SELECTOR = '[data-home-cover]';
const SOURCE_SELECTOR = '.home-cover';
const HERO_SELECTOR = '[data-home-hero-photo]';
const STAGE_SELECTOR = '[data-home-cover-stage]';
const FULL_IMAGE_SELECTOR = '[data-home-hero-full]';
const TOGGLE_SELECTOR = '[data-home-cover-toggle]';
const HANDLE_SELECTOR = '[data-home-cover-gesture]';
const LOWER_SELECTOR = '[data-home-lower-motion]';
const SIDEBAR_SELECTOR = '[data-persistent-sidebar]';
const STATUS_SELECTOR = '[data-home-cover-status]';
const HEADER_SELECTOR = '#site-header';
const TIMELINE_DURATION = 1000;
const WHEEL_GESTURE_IDLE_MS = 180;

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
    const derivative = cubicBezierDerivative(parameter, 0.77, 0.175);
    if (Math.abs(derivative) < 0.000001) break;
    parameter -= (cubicBezierCoordinate(parameter, 0.77, 0.175) - x) / derivative;
    parameter = Math.min(Math.max(parameter, 0), 1);
  }
  return cubicBezierCoordinate(parameter, 0, 1);
}

type HomeCoverState = 'collapsed' | 'dragging' | 'settling' | 'expanded';
type MotionTrack = {
  element: HTMLElement | SVGElement;
  frameAt: (progress: number) => Keyframe;
};

let cleanupCurrentHero: (() => void) | undefined;

function initHomeHeroMotion() {
  cleanupCurrentHero?.();
  cleanupCurrentHero = undefined;

  const shell = document.querySelector<HTMLElement>(COVER_SELECTOR);
  const source = shell?.querySelector<HTMLElement>(SOURCE_SELECTOR);
  const heroImage = shell?.querySelector<HTMLImageElement>(HERO_SELECTOR);
  const stage = shell?.querySelector<HTMLElement>(STAGE_SELECTOR);
  const fullImage = shell?.querySelector<HTMLImageElement>(FULL_IMAGE_SELECTOR);
  const toggle = shell?.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR);
  const handle = shell?.querySelector<HTMLElement>(HANDLE_SELECTOR);
  const lower = document.querySelector<HTMLElement>(LOWER_SELECTOR);
  const sidebar = document.querySelector<HTMLElement>(SIDEBAR_SELECTOR);
  const status = shell?.querySelector<HTMLElement>(STATUS_SELECTOR);
  const header = document.querySelector<HTMLElement>(HEADER_SELECTOR);
  const homeContent = document.querySelector<HTMLElement>('.home-content-layout');
  const footer = document.querySelector<HTMLElement>('body > footer');
  if (!shell || !source || !heroImage || !stage || !fullImage || !toggle || !handle || !lower || !header || !homeContent) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopWheel = window.matchMedia('(hover: hover) and (pointer: fine)');
  const trackedPointers = new Set<number>();
  const dragAnimations: Animation[] = [];
  const settleAnimations: Animation[] = [];
  const motionTracks: MotionTrack[] = [];
  let state: HomeCoverState = 'collapsed';
  let progress = 0;
  let requestedTarget: 0 | 1 = 0;
  let activePointerId: number | null = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerStartTime = 0;
  let pointerStartProgress = 0;
  let gestureTravelDistance = 160;
  let pointerDirection: 'horizontal' | 'vertical' | null = null;
  let gestureCancelled = false;
  let suppressClickUntil = 0;
  let settleSequence = 0;
  let settleStartProgress = 0;
  let settleTarget: 0 | 1 = 0;
  let settleDuration = 0;
  let stableCleanupTimer: number | undefined;
  let highResolutionRequested = false;
  let highResolutionLoader: HTMLImageElement | undefined;
  let coverIsVisible = false;
  let measuredHeaderHeight = 1;
  let wheelAccumulator = 0;
  let wheelDirection = 0;
  let lastWheelTime = 0;
  let wheelResetTimer: number | undefined;

  const setElementUnavailable = (element: HTMLElement | null, unavailable: boolean) => {
    if (!element) return;
    element.inert = unavailable;
    if (unavailable) {
      element.setAttribute('aria-hidden', 'true');
      element.style.visibility = 'hidden';
    } else {
      element.style.removeProperty('visibility');
      element.removeAttribute('aria-hidden');
    }
  };

  const updateHeaderHeight = () => {
    measuredHeaderHeight = Math.max(header.getBoundingClientRect().height, 1);
    document.documentElement.style.setProperty('--site-header-height', `${measuredHeaderHeight}px`);
  };

  const updateToggle = (expanded: boolean) => {
    const label = expanded ? '收回全图壁纸' : '展开全图壁纸';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    const text = toggle.querySelector<HTMLElement>('[data-home-cover-toggle-label]');
    if (text) text.textContent = label;
  };

  const updateWaves = () => {
    const shouldRun = coverIsVisible && state === 'collapsed' && !document.hidden && !reduceMotion.matches;
    source.dataset.wavesVisible = String(shouldRun);
  };

  const requestHighResolution = () => {
    if (highResolutionRequested) return;
    const src = fullImage.dataset.fullSrc;
    if (!src) return;
    highResolutionRequested = true;
    const loader = new Image();
    highResolutionLoader = loader;
    loader.decoding = 'async';
    if (fullImage.dataset.fullSrcset) loader.srcset = fullImage.dataset.fullSrcset;
    loader.sizes = fullImage.dataset.fullSizes || '100vw';
    loader.src = src;
    void loader.decode().then(() => {
      if (highResolutionLoader !== loader || !document.contains(fullImage)) return;
      fullImage.sizes = loader.sizes;
      fullImage.srcset = loader.srcset;
      fullImage.src = loader.currentSrc || src;
    }).catch(() => {});
  };

  const reuseDecodedHero = () => {
    const src = heroImage.currentSrc || heroImage.src;
    if (src) fullImage.src = src;
  };

  const clearAnimations = () => {
    if (stableCleanupTimer !== undefined) window.clearTimeout(stableCleanupTimer);
    stableCleanupTimer = undefined;
    for (const animation of dragAnimations.splice(0)) animation.cancel();
    for (const animation of settleAnimations.splice(0)) animation.cancel();
    for (const track of motionTracks.splice(0)) track.element.style.removeProperty('will-change');
  };

  const createProgressAnimation = (
    element: HTMLElement | SVGElement,
    frameAt: (progress: number) => Keyframe,
  ) => {
    const initialFrame = frameAt(0);
    element.style.willChange = 'opacity' in initialFrame ? 'transform, opacity' : 'transform';
    motionTracks.push({ element, frameAt });
    const animation = element.animate([initialFrame, frameAt(1)], {
      duration: TIMELINE_DURATION,
      easing: 'linear',
      fill: 'both',
    });
    animation.pause();
    dragAnimations.push(animation);
  };

  const createTimelines = () => {
    clearAnimations();
    updateHeaderHeight();
    const headerHeight = measuredHeaderHeight;
    const sourceRect = source.getBoundingClientRect();
    const stageWidth = Math.max(window.innerWidth, 1);
    const stageHeight = Math.max(window.innerHeight - headerHeight, 1);
    const targetHandleX = window.innerWidth / 2;
    const targetHandleY = headerHeight + 16 + toggle.offsetHeight / 2;
    const handleX = sourceRect.left + sourceRect.width / 2 - targetHandleX;
    const handleY = sourceRect.top + 16 + toggle.offsetHeight / 2 - targetHandleY;

    const collapsedX = sourceRect.left;
    const collapsedY = sourceRect.top - headerHeight;
    const collapsedScaleX = sourceRect.width / stageWidth;
    const collapsedScaleY = sourceRect.height / stageHeight;
    createProgressAnimation(stage, (value) => ({
      transform: `translate3d(${collapsedX * (1 - value)}px, ${collapsedY * (1 - value)}px, 0) scale(${collapsedScaleX + (1 - collapsedScaleX) * value}, ${collapsedScaleY + (1 - collapsedScaleY) * value})`,
      opacity: value,
    }));
    createProgressAnimation(source, (value) => ({
      transform: `translate3d(0, ${-24 * value}px, 0)`,
      opacity: 1 - value,
    }));
    createProgressAnimation(lower, (value) => ({
      transform: `translate3d(0, ${96 * value}px, 0)`,
      opacity: 1 - value,
    }));
    if (sidebar && getComputedStyle(sidebar).display !== 'none') {
      createProgressAnimation(sidebar, (value) => ({
        transform: `translate3d(${-110 * value}%, 0, 0)`,
        opacity: 1 - value,
      }));
    }
    createProgressAnimation(toggle, (value) => ({
      transform: `translate3d(${handleX * (1 - value)}px, ${handleY * (1 - value)}px, 0) translateX(-50%)`,
    }));
    const icon = toggle.querySelector<SVGElement>('svg');
    if (icon) {
      createProgressAnimation(icon, (value) => ({ transform: `rotate(${180 * value}deg)` }));
    }
  };

  const applyProgress = (nextProgress: number) => {
    progress = Math.min(Math.max(nextProgress, 0), 1);
    for (const animation of dragAnimations) animation.currentTime = progress * TIMELINE_DURATION;
  };

  const sampleProgress = () => {
    const settlingTime = settleAnimations[0]?.currentTime;
    if (typeof settlingTime === 'number' && settleDuration > 0) {
      const linearProgress = Math.min(Math.max(settlingTime / settleDuration, 0), 1);
      progress = settleStartProgress + (settleTarget - settleStartProgress) * easeHomeCoverSettle(linearProgress);
      return progress;
    }
    const dragTime = dragAnimations[0]?.currentTime;
    if (typeof dragTime === 'number') progress = Math.min(Math.max(dragTime / TIMELINE_DURATION, 0), 1);
    return progress;
  };

  const beginMotion = () => {
    setElementUnavailable(homeContent, false);
    setElementUnavailable(sidebar, false);
    setElementUnavailable(footer, false);
    source.removeAttribute('aria-hidden');
    document.documentElement.dataset.homeCoverMotionActive = 'true';
    shell.dataset.motionActive = 'true';
    createTimelines();
    applyProgress(progress);
  };

  const settleStable = (target: 0 | 1) => {
    const stableSequence = ++settleSequence;
    progress = target;
    requestedTarget = target;
    state = target === 1 ? 'expanded' : 'collapsed';
    shell.dataset.state = state;
    shell.dataset.expanded = String(target === 1);
    document.documentElement.dataset.homeCoverState = state;
    delete document.documentElement.dataset.homeCoverMotionActive;
    delete shell.dataset.motionActive;
    updateToggle(target === 1);

    if (target === 1) {
      document.documentElement.dataset.homeCoverExpanded = 'true';
      if (status) status.textContent = '全图壁纸已展开';
    } else {
      delete document.documentElement.dataset.homeCoverExpanded;
      source.removeAttribute('aria-hidden');
      setElementUnavailable(homeContent, false);
      setElementUnavailable(sidebar, false);
      setElementUnavailable(footer, false);
      if (status) status.textContent = '全图壁纸已收回';
    }
    updateWaves();

    const finalizeStableState = () => {
      stableCleanupTimer = undefined;
      if (stableSequence !== settleSequence) return;
      if (target === 1) {
        source.setAttribute('aria-hidden', 'true');
        setElementUnavailable(homeContent, true);
        setElementUnavailable(sidebar, true);
        setElementUnavailable(footer, true);
      }
      clearAnimations();
    };
    if (dragAnimations.length === 0 && settleAnimations.length === 0) finalizeStableState();
    else stableCleanupTimer = window.setTimeout(finalizeStableState, 48);
  };

  const settleTo = (target: 0 | 1, durationMs = resolveHomeCoverSettleDuration(progress, target, reduceMotion.matches)) => {
    const currentProgress = sampleProgress();
    requestedTarget = target;
    const duration = reduceMotion.matches ? 0 : durationMs;
    if (duration === 0 || currentProgress === target) {
      settleStable(target);
      return;
    }
    if (dragAnimations.length === 0) beginMotion();
    state = 'settling';
    shell.dataset.state = state;
    updateWaves();
    const sequence = ++settleSequence;
    settleStartProgress = currentProgress;
    settleTarget = target;
    settleDuration = duration;
    for (const animation of settleAnimations.splice(0)) animation.cancel();
    for (const track of motionTracks) {
      settleAnimations.push(track.element.animate(
        [track.frameAt(currentProgress), track.frameAt(target)],
        {
          duration,
          easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
          fill: 'both',
        },
      ));
    }
    for (const animation of dragAnimations.splice(0)) animation.cancel();
    const lead = settleAnimations[0];
    if (!lead) {
      settleStable(target);
      return;
    }
    void lead.finished.then(() => {
      if (sequence === settleSequence) settleStable(target);
    }).catch(() => {});
  };

  const interruptMotion = () => {
    sampleProgress();
    settleSequence += 1;
    for (const animation of settleAnimations.splice(0)) animation.cancel();
    if (dragAnimations.length === 0) beginMotion();
    else applyProgress(progress);
    for (const animation of dragAnimations) animation.pause();
  };

  const isHandleTarget = (target: EventTarget | null) => {
    const node = target instanceof Node ? target : null;
    return Boolean(node && (handle.contains(node) || toggle.contains(node)));
  };

  const handlePointerDown = (event: PointerEvent) => {
    if ((event.pointerType !== 'touch' && event.pointerType !== 'pen') || !isHandleTarget(event.target)) return;
    trackedPointers.add(event.pointerId);
    if (trackedPointers.size > 1) gestureCancelled = true;
    if (activePointerId !== null) return;
    activePointerId = event.pointerId;
    gestureCancelled = trackedPointers.size > 1;
    pointerDirection = null;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerStartTime = performance.now();
    requestHighResolution();
    interruptMotion();
    pointerStartProgress = progress;
    gestureTravelDistance = Math.min(Math.max((window.innerHeight - measuredHeaderHeight) * 0.28, 160), 260);
    shell.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    pointerDirection ??= resolveHomeCoverDirection(deltaX, deltaY);
    if (pointerDirection !== 'vertical' || gestureCancelled) return;
    event.preventDefault();
    state = 'dragging';
    shell.dataset.state = state;
    updateWaves();
    applyProgress(resolveHomeCoverProgress({ startProgress: pointerStartProgress, deltaY, travelDistance: gestureTravelDistance }));
  };

  const finishPointer = (event: PointerEvent, cancelled = false) => {
    trackedPointers.delete(event.pointerId);
    if (event.pointerId !== activePointerId) return;
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    const elapsedMs = Math.max(performance.now() - pointerStartTime, 1);
    const wasDragging = pointerDirection === 'vertical' && !gestureCancelled;
    const release = resolveHomeCoverRelease({
      progress: sampleProgress(),
      deltaX,
      deltaY,
      elapsedMs,
      cancelled: cancelled || gestureCancelled || pointerDirection !== 'vertical',
      reduceMotion: reduceMotion.matches,
    });
    activePointerId = null;
    if (shell.hasPointerCapture(event.pointerId)) shell.releasePointerCapture(event.pointerId);
    if (wasDragging) suppressClickUntil = performance.now() + 350;
    settleTo(wasDragging ? release.target : requestedTarget, wasDragging ? release.durationMs : undefined);
  };

  const handlePointerUp = (event: PointerEvent) => finishPointer(event);
  const handlePointerCancel = (event: PointerEvent) => finishPointer(event, true);
  const handleLostPointerCapture = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;
    trackedPointers.delete(event.pointerId);
    activePointerId = null;
    gestureCancelled = true;
    settleTo(progress >= 0.5 ? 1 : 0);
  };

  const handleToggle = (event: MouseEvent) => {
    if (performance.now() < suppressClickUntil) return;
    const nextTarget: 0 | 1 = requestedTarget === 1 ? 0 : 1;
    if (nextTarget === 1) requestHighResolution();
    interruptMotion();
    settleTo(nextTarget, event.detail === 0 ? 0 : nextTarget === 1 ? 240 : 220);
  };

  const resetWheelGesture = () => {
    if (wheelResetTimer !== undefined) window.clearTimeout(wheelResetTimer);
    wheelResetTimer = undefined;
    wheelAccumulator = 0;
    wheelDirection = 0;
    lastWheelTime = 0;
  };

  const isPointInside = (event: WheelEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  };

  const handleWheel = (event: WheelEvent) => {
    if (!desktopWheel.matches || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    const deltaY = normalizeHomeCoverWheelDelta(event.deltaY, event.deltaMode, window.innerHeight);
    if (deltaY === 0) return;
    const expanded = requestedTarget === 1;
    const canHandle = expanded
      ? deltaY > 0 && event.clientY >= measuredHeaderHeight
      : deltaY < 0 && isPointInside(event, source);
    if (!canHandle) {
      resetWheelGesture();
      return;
    }

    event.preventDefault();
    const now = performance.now();
    const direction = Math.sign(deltaY);
    if (now - lastWheelTime > WHEEL_GESTURE_IDLE_MS || (wheelDirection !== 0 && direction !== wheelDirection)) {
      wheelAccumulator = 0;
    }
    wheelDirection = direction;
    lastWheelTime = now;
    wheelAccumulator += deltaY;

    if (wheelResetTimer !== undefined) window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_IDLE_MS);
    const target = resolveHomeCoverWheelTarget(wheelAccumulator, expanded);
    if (target === null) return;

    resetWheelGesture();
    if (target === 1) requestHighResolution();
    interruptMotion();
    settleTo(target, target === 1 ? 240 : 220);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || requestedTarget !== 1) return;
    event.preventDefault();
    interruptMotion();
    settleTo(0, 0);
    toggle.focus({ preventScroll: true });
  };

  const handleMotionPreference = () => {
    if (reduceMotion.matches) settleStable(requestedTarget);
    updateWaves();
  };
  const handleVisibility = () => updateWaves();

  const headerObserver = new ResizeObserver(updateHeaderHeight);
  headerObserver.observe(header);
  const coverObserver = new IntersectionObserver(([entry]) => {
    coverIsVisible = Boolean(entry?.isIntersecting);
    updateWaves();
  });
  coverObserver.observe(source);

  updateHeaderHeight();
  settleStable(0);
  if (heroImage.complete) reuseDecodedHero();
  else heroImage.addEventListener('load', reuseDecodedHero, { once: true });
  toggle.addEventListener('click', handleToggle);
  shell.addEventListener('pointerdown', handlePointerDown);
  shell.addEventListener('pointermove', handlePointerMove);
  shell.addEventListener('pointerup', handlePointerUp);
  shell.addEventListener('pointercancel', handlePointerCancel);
  shell.addEventListener('lostpointercapture', handleLostPointerCapture);
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('visibilitychange', handleVisibility);
  reduceMotion.addEventListener('change', handleMotionPreference);

  cleanupCurrentHero = () => {
    settleSequence += 1;
    highResolutionLoader = undefined;
    headerObserver.disconnect();
    coverObserver.disconnect();
    clearAnimations();
    settleStable(0);
    document.documentElement.style.removeProperty('--site-header-height');
    toggle.removeEventListener('click', handleToggle);
    shell.removeEventListener('pointerdown', handlePointerDown);
    shell.removeEventListener('pointermove', handlePointerMove);
    shell.removeEventListener('pointerup', handlePointerUp);
    shell.removeEventListener('pointercancel', handlePointerCancel);
    shell.removeEventListener('lostpointercapture', handleLostPointerCapture);
    heroImage.removeEventListener('load', reuseDecodedHero);
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('wheel', handleWheel);
    document.removeEventListener('visibilitychange', handleVisibility);
    reduceMotion.removeEventListener('change', handleMotionPreference);
    resetWheelGesture();
  };
}

initHomeHeroMotion();
document.addEventListener('astro:page-load', initHomeHeroMotion);
