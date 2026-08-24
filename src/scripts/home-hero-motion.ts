import { classifyHomeCoverSwipe } from '../lib/homeCoverGesture';

const HERO_SELECTOR = '[data-home-hero-photo]';
const COVER_SELECTOR = '[data-home-cover]';
const TOGGLE_SELECTOR = '[data-home-cover-toggle]';
const GESTURE_SELECTOR = '[data-home-cover-gesture]';
const TOGGLE_LABEL_SELECTOR = '[data-home-cover-toggle-label]';
const BASE_SCALE = 1.025;
const MAX_SCALE = 1.075;
const SCROLL_RANGE = 520;
const TRANSITION_WATCHDOG_MS = 700;

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

let cleanupCurrentHero: (() => void) | undefined;

function initHomeHeroMotion() {
  cleanupCurrentHero?.();
  cleanupCurrentHero = undefined;

  const heroPhoto = document.querySelector<HTMLElement>(HERO_SELECTOR);
  const cover = document.querySelector<HTMLElement>(COVER_SELECTOR);
  const toggle = document.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR);
  const gestureZone = document.querySelector<HTMLElement>(GESTURE_SELECTOR);
  const toggleLabel = toggle?.querySelector<HTMLElement>(TOGGLE_LABEL_SELECTOR);
  const photoFrame = heroPhoto?.closest<HTMLElement>('.cover-photo-frame');
  if (!heroPhoto || !cover || !toggle || !gestureZone || !toggleLabel || !photoFrame) return;
  const heroImage = heroPhoto as HTMLImageElement;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const viewTransitionDocument = document as ViewTransitionDocument;
  let frameId = 0;
  let activePointerId: number | null = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerStartTime = 0;
  let lastSwipeAt = 0;
  let coverTransition: ViewTransition | null = null;
  let transitionWatchdog: number | undefined;
  let requestedExpanded = false;
  let transitionSequence = 0;
  let gestureCancelled = false;
  const touchPointers = new Set<number>();

  const isExpanded = () => cover.dataset.expanded === 'true';

  const updateBackdrop = () => {
    if (!heroImage.currentSrc) return;
    photoFrame.style.setProperty('--home-cover-backdrop', `url("${heroImage.currentSrc.replaceAll('"', '\\"')}")`);
  };

  const updateToggle = (expanded: boolean) => {
    const label = expanded ? '收回全图壁纸' : '展开全图壁纸';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    toggleLabel.textContent = label;
  };

  const applyExpandedState = (expanded: boolean) => {
    cover.dataset.expanded = String(expanded);
    updateToggle(expanded);
    if (expanded) {
      document.documentElement.dataset.homeCoverExpanded = 'true';
      cover.setAttribute('role', 'dialog');
      cover.setAttribute('aria-modal', 'true');
      if (document.activeElement !== toggle) toggle.focus({ preventScroll: true });
    } else {
      delete document.documentElement.dataset.homeCoverExpanded;
      cover.removeAttribute('role');
      cover.removeAttribute('aria-modal');
    }
    render();
  };

  const clearTransitionState = () => {
    if (transitionWatchdog !== undefined) window.clearTimeout(transitionWatchdog);
    transitionWatchdog = undefined;
    coverTransition = null;
    delete document.documentElement.dataset.homeCoverTransition;
  };

  const setExpanded = (expanded: boolean, animate: boolean) => {
    if (expanded === requestedExpanded && expanded === isExpanded()) return;

    requestedExpanded = expanded;
    const sequence = ++transitionSequence;

    coverTransition?.skipTransition();
    clearTransitionState();

    if (!animate || reduceMotion.matches || typeof viewTransitionDocument.startViewTransition !== 'function') {
      if (sequence === transitionSequence) applyExpandedState(requestedExpanded);
      return;
    }

    document.documentElement.dataset.homeCoverTransition = expanded ? 'expand' : 'collapse';
    try {
      const transition = viewTransitionDocument.startViewTransition(() => {
        if (sequence === transitionSequence) applyExpandedState(requestedExpanded);
      });
      coverTransition = transition;
      transition.ready.catch(() => {});
      transition.updateCallbackDone.catch(() => {});
      transitionWatchdog = window.setTimeout(() => {
        if (coverTransition !== transition) return;
        transition.skipTransition();
        applyExpandedState(requestedExpanded);
        clearTransitionState();
      }, TRANSITION_WATCHDOG_MS);
      const finish = () => {
        if (coverTransition === transition) clearTransitionState();
      };
      transition.finished.then(finish, finish);
    } catch {
      if (sequence === transitionSequence) applyExpandedState(requestedExpanded);
      clearTransitionState();
    }
  };

  const render = () => {
    frameId = 0;
    if (reduceMotion.matches || isExpanded()) {
      heroPhoto.style.transform = `scale(${BASE_SCALE})`;
      return;
    }

    const progress = Math.min(Math.max(window.scrollY / SCROLL_RANGE, 0), 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const scale = BASE_SCALE + (MAX_SCALE - BASE_SCALE) * easedProgress;
    heroPhoto.style.transform = `scale(${scale.toFixed(4)})`;
  };

  const requestRender = () => {
    if (frameId) return;
    frameId = window.requestAnimationFrame(render);
  };

  const handleMotionPreference = () => requestRender();
  const handleToggle = (event: MouseEvent) => {
    if (Date.now() - lastSwipeAt < 350) return;
    setExpanded(!requestedExpanded, event.detail > 0);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return;
    touchPointers.add(event.pointerId);
    if (touchPointers.size > 1) gestureCancelled = true;
    if (activePointerId !== null || toggle.contains(event.target as Node)) return;
    if (!isExpanded() && !gestureZone.contains(event.target as Node)) return;
    activePointerId = event.pointerId;
    gestureCancelled = false;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerStartTime = performance.now();
    cover.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    const vertical = Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX) * 1.25;
    const matchesState = (deltaY < 0 && !requestedExpanded) || (deltaY > 0 && requestedExpanded);
    if (vertical && matchesState) event.preventDefault();
  };

  const finishPointer = (event: PointerEvent, cancelled = false) => {
    touchPointers.delete(event.pointerId);
    if (event.pointerId !== activePointerId) return;
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    const elapsed = Math.max(performance.now() - pointerStartTime, 1);
    const action = classifyHomeCoverSwipe({
      deltaX,
      deltaY,
      elapsedMs: elapsed,
      expanded: requestedExpanded,
      cancelled: cancelled || gestureCancelled,
    });

    activePointerId = null;
    if (cover.hasPointerCapture(event.pointerId)) cover.releasePointerCapture(event.pointerId);

    if (action) {
      lastSwipeAt = Date.now();
      setExpanded(action === 'expand', true);
    }
  };

  const handlePointerUp = (event: PointerEvent) => finishPointer(event);
  const handlePointerCancel = (event: PointerEvent) => finishPointer(event, true);
  const handleLostPointerCapture = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;
    touchPointers.delete(event.pointerId);
    activePointerId = null;
    gestureCancelled = true;
  };
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && requestedExpanded) {
      event.preventDefault();
      setExpanded(false, false);
      toggle.focus({ preventScroll: true });
    } else if (event.key === 'Tab' && requestedExpanded) {
      event.preventDefault();
      toggle.focus({ preventScroll: true });
    }
  };

  updateBackdrop();
  if (!heroImage.complete) heroImage.addEventListener('load', updateBackdrop, { once: true });
  applyExpandedState(false);
  render();
  window.addEventListener('scroll', requestRender, { passive: true });
  reduceMotion.addEventListener('change', handleMotionPreference);
  toggle.addEventListener('click', handleToggle);
  cover.addEventListener('pointerdown', handlePointerDown);
  cover.addEventListener('pointermove', handlePointerMove);
  cover.addEventListener('pointerup', handlePointerUp);
  cover.addEventListener('pointercancel', handlePointerCancel);
  cover.addEventListener('lostpointercapture', handleLostPointerCapture);
  document.addEventListener('keydown', handleKeydown);

  cleanupCurrentHero = () => {
    coverTransition?.skipTransition();
    clearTransitionState();
    applyExpandedState(false);
    window.removeEventListener('scroll', requestRender);
    reduceMotion.removeEventListener('change', handleMotionPreference);
    toggle.removeEventListener('click', handleToggle);
    cover.removeEventListener('pointerdown', handlePointerDown);
    cover.removeEventListener('pointermove', handlePointerMove);
    cover.removeEventListener('pointerup', handlePointerUp);
    cover.removeEventListener('pointercancel', handlePointerCancel);
    cover.removeEventListener('lostpointercapture', handleLostPointerCapture);
    heroImage.removeEventListener('load', updateBackdrop);
    document.removeEventListener('keydown', handleKeydown);
    if (frameId) window.cancelAnimationFrame(frameId);
  };
}

initHomeHeroMotion();
document.addEventListener('astro:page-load', initHomeHeroMotion);
