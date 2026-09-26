import {
  normalizeHomeCoverWheelIntent,
  resolveHomeCoverDirection,
  resolveHomeCoverProgress,
  resolveHomeCoverRelease,
  resolveHomeCoverSettleDuration,
  resolveHomeCoverTakeover,
  shouldIgnoreHomeCoverGesture,
} from '../lib/homeCoverGesture';
import {
  computeHomeCoverMotionGeometry,
  type HomeCoverMotionGeometry,
  type MotionRect,
} from '../lib/homeCoverMotionGeometry';

const COVER_SELECTOR = '[data-home-cover]';
const SOURCE_SELECTOR = '.home-cover';
const HERO_SELECTOR = '[data-home-hero-photo]';
const HERO_SOURCE_SELECTOR = '[data-home-hero-source]';
const STAGE_SELECTOR = '[data-home-cover-stage]';
const VIEWPORT_SELECTOR = '[data-home-cover-viewport]';
const FULL_IMAGE_SELECTOR = '[data-home-hero-full]';
const TOGGLE_SELECTOR = '[data-home-cover-toggle]';
const LOWER_SELECTOR = '[data-home-lower-motion]';
const SIDEBAR_SELECTOR = '[data-persistent-sidebar]';
const STATUS_SELECTOR = '[data-home-cover-status]';
const HEADER_SELECTOR = '#site-header';
const TIMELINE_DURATION = 1000;
const WHEEL_GESTURE_IDLE_MS = 120;
const TOGGLE_EXPAND_MS = 280;
const TOGGLE_COLLAPSE_MS = 240;
const KEYBOARD_REVEAL_KEYS = new Set(['Tab', 'End', 'PageDown', 'ArrowDown', ' ']);
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

function parseObjectPosition(value: string): [number, number] {
  const positions = value.trim().split(/\s+/);
  const parse = (position: string | undefined, fallback: number) => {
    if (!position) return fallback;
    if (position.endsWith('%')) return Number.parseFloat(position) / 100;
    if (position === 'left' || position === 'top') return 0;
    if (position === 'right' || position === 'bottom') return 1;
    if (position === 'center') return 0.5;
    return fallback;
  };
  return [parse(positions[0], 0.5), parse(positions[1] ?? positions[0], 0.5)];
}

type HomeCoverState = 'collapsed' | 'dragging' | 'settling' | 'expanded';
type MotionTrack = {
  element: HTMLElement | SVGElement;
  frameAt: (progress: number) => Keyframe;
};
type MotionBlueprint = {
  geometry: HomeCoverMotionGeometry;
  imageWidth: number;
  imageHeight: number;
};

let cleanupCurrentHero: (() => void) | undefined;

function initHomeHeroMotion() {
  cleanupCurrentHero?.();
  cleanupCurrentHero = undefined;

  const shell = document.querySelector<HTMLElement>(COVER_SELECTOR);
  const source = shell?.querySelector<HTMLElement>(SOURCE_SELECTOR);
  const heroImage = shell?.querySelector<HTMLImageElement>(HERO_SELECTOR);
  const heroSource = shell?.querySelector<HTMLSourceElement>(HERO_SOURCE_SELECTOR);
  const stage = shell?.querySelector<HTMLElement>(STAGE_SELECTOR);
  const viewport = shell?.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
  const fullImage = shell?.querySelector<HTMLImageElement>(FULL_IMAGE_SELECTOR);
  const toggle = shell?.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR);
  const drawer = document.querySelector<HTMLElement>(LOWER_SELECTOR);
  const sidebar = document.querySelector<HTMLElement>(SIDEBAR_SELECTOR);
  const status = shell?.querySelector<HTMLElement>(STATUS_SELECTOR);
  const header = document.querySelector<HTMLElement>(HEADER_SELECTOR);
  const footer = document.querySelector<HTMLElement>('body > footer');
  if (!shell || !source || !heroImage || !heroSource || !stage || !viewport || !fullImage || !toggle || !drawer || !header) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopWheel = window.matchMedia('(hover: hover) and (pointer: fine)');
  const dragAnimations: Animation[] = [];
  const settleAnimations: Animation[] = [];
  const motionTracks: MotionTrack[] = [];
  const trackedPenPointers = new Set<number>();
  let state: HomeCoverState = 'collapsed';
  let progress = 0;
  let requestedTarget: 0 | 1 = 0;
  let settleSequence = 0;
  let settleStartProgress = 0;
  let settleTarget: 0 | 1 = 0;
  let settleDuration = 0;
  let stableCleanupTimer: number | undefined;
  let highResolutionRequested = false;
  let highResolutionLoader: HTMLImageElement | undefined;
  let pendingHighResolutionSource = '';
  let coverIsVisible = false;
  let measuredHeaderHeight = 1;
  let activeHeroTheme: 'light' | 'dark' | undefined;
  let suppressClickUntil = 0;
  let gestureTravelDistance = 180;

  let activeTouchId: number | null = null;
  let activePenId: number | null = null;
  let gestureStartX = 0;
  let gestureStartY = 0;
  let gestureStartTime = 0;
  let gestureStartProgress = 0;
  let gestureDirection: 'horizontal' | 'vertical' | null = null;
  let gestureEngaged = false;
  let gestureCancelled = false;

  let wheelIntentDistance = 0;
  let wheelStartProgress = 0;
  let wheelStartTime = 0;
  let lastWheelTime = 0;
  let wheelResetTimer: number | undefined;
  let wheelBoundaryTimer: number | undefined;
  let wheelRequiresFreshInput = false;
  let wheelTravelDistance = 280;
  let cachedMotionBlueprint: MotionBlueprint | undefined;
  let measuredStageRect: MotionRect | undefined;
  let layoutUpdateFrame: number | undefined;
  let geometryMeasureFrame: number | undefined;
  let progressFrame: number | undefined;
  let wheelListening = false;
  const motionCullCandidates = [...drawer.querySelectorAll<HTMLElement>('[data-home-motion-cull]')];

  const documentElement = document.documentElement;
  const previousOverscrollBehavior = documentElement.style.overscrollBehaviorY;
  documentElement.style.overscrollBehaviorY = 'none';

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

  const updateLayoutGeometry = () => {
    measuredHeaderHeight = Math.max(header.getBoundingClientRect().height, 1);
    documentElement.style.setProperty('--site-header-height', `${measuredHeaderHeight}px`);
    const sidebarIsVisible = Boolean(sidebar && getComputedStyle(sidebar).display !== 'none');
    const stageLeft = sidebarIsVisible && sidebar ? sidebar.getBoundingClientRect().right : 0;
    const stageWidth = Math.max(window.innerWidth - stageLeft, 1);
    stage.style.left = `${stageLeft}px`;
    stage.style.width = `${stageWidth}px`;
    shell.style.setProperty('--home-cover-stage-center', `${stageLeft + stageWidth / 2}px`);
    const stageHeight = Math.max(window.innerHeight - measuredHeaderHeight, 1);
    measuredStageRect = {
      top: measuredHeaderHeight,
      right: stageLeft + stageWidth,
      bottom: measuredHeaderHeight + stageHeight,
      left: stageLeft,
      width: stageWidth,
      height: stageHeight,
    };
    gestureTravelDistance = Math.min(Math.max(stageHeight * 0.3, 160), 280);
    wheelTravelDistance = Math.min(Math.max(stageHeight * 0.45, 240), 420);
    cachedMotionBlueprint = undefined;
  };

  const measureMotionBlueprint = (): MotionBlueprint => {
    const sourceRect = source.getBoundingClientRect();
    // 舞台在稳定收起态本身带有 FLIP transform；读取它的视觉矩形会把
    // 已缩放后的边界误当成下一轮布局边界。这里始终使用 resize 阶段缓存的
    // 未变换布局矩形，避免第二次展开逐轮缩小或跳位。
    const stageRect = measuredStageRect ?? stage.getBoundingClientRect();
    const imageWidth = Math.max(heroImage.naturalWidth || fullImage.naturalWidth || Number(fullImage.width), 1);
    const imageHeight = Math.max(heroImage.naturalHeight || fullImage.naturalHeight || Number(fullImage.height), 1);
    const [objectPositionX, objectPositionY] = parseObjectPosition(getComputedStyle(heroImage).objectPosition);
    return {
      imageWidth,
      imageHeight,
      geometry: computeHomeCoverMotionGeometry({
        sourceRect,
        stageRect,
        imageWidth,
        imageHeight,
        objectPositionX,
        objectPositionY,
        headerHeight: measuredHeaderHeight,
        toggleHeight: toggle.offsetHeight,
      }),
    };
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
    drawer.dataset.wavesVisible = String(shouldRun);
  };

  const restoreDrawerContent = () => {
    for (const element of motionCullCandidates) delete element.dataset.homeMotionOffscreen;
  };

  const cullOffscreenDrawerContent = () => {
    // 抽屉展开只会继续向下运动；初始视口下方的模块不可能在动画中出现。
    // 暂停这些子树的绘制可避免浏览器把整张长主页栅格化为一个巨型合成层。
    for (const element of motionCullCandidates) {
      if (element.getBoundingClientRect().top >= window.innerHeight + 96) {
        element.dataset.homeMotionOffscreen = 'true';
      } else {
        delete element.dataset.homeMotionOffscreen;
      }
    }
  };

  const restoreVisibleDrawerContent = () => {
    for (const element of motionCullCandidates) {
      if (element.getBoundingClientRect().top < window.innerHeight + 96) {
        delete element.dataset.homeMotionOffscreen;
      }
    }
  };

  const handleKeyboardReveal = (event: KeyboardEvent) => {
    if (state !== 'collapsed') return;
    const revealsOffscreenContent = KEYBOARD_REVEAL_KEYS.has(event.key)
      || (event.ctrlKey && event.key.toLowerCase() === 'f');
    if (revealsOffscreenContent) restoreDrawerContent();
  };

  const commitHighResolution = () => {
    if (!pendingHighResolutionSource || state !== 'expanded') return;
    fullImage.removeAttribute('srcset');
    fullImage.src = pendingHighResolutionSource;
    pendingHighResolutionSource = '';
  };

  const cancelHighResolutionRequest = () => {
    if (highResolutionLoader) {
      highResolutionLoader.removeAttribute('srcset');
      highResolutionLoader.removeAttribute('src');
    }
    highResolutionLoader = undefined;
    pendingHighResolutionSource = '';
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
      pendingHighResolutionSource = loader.currentSrc || src;
      commitHighResolution();
    }).catch(() => {});
  };

  const reuseDecodedHero = () => {
    const src = heroImage.currentSrc || heroImage.src;
    if (!src) return;
    fullImage.removeAttribute('srcset');
    fullImage.src = src;
  };

  const releaseHighResolution = () => {
    cancelHighResolutionRequest();
    highResolutionRequested = false;
    reuseDecodedHero();
  };

  const syncHeroTheme = () => {
    const theme = documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    if (theme === activeHeroTheme) return;
    activeHeroTheme = theme;
    cancelHighResolutionRequest();
    highResolutionRequested = false;

    const sourceSrcset = heroSource.getAttribute(`data-${theme}-srcset`);
    const sourceType = heroSource.getAttribute(`data-${theme}-type`);
    const heroSrcset = heroImage.getAttribute(`data-${theme}-srcset`);
    const heroSrc = heroImage.getAttribute(`data-${theme}-src`);
    const lqip = fullImage.getAttribute(`data-${theme}-lqip`);
    const fullSrc = fullImage.getAttribute(`data-${theme}-full-src`);
    const fullSrcset = fullImage.getAttribute(`data-${theme}-full-srcset`);
    if (!sourceType || !sourceSrcset || !heroSrcset || !heroSrc || !lqip || !fullSrc || !fullSrcset) return;

    heroSource.type = sourceType;
    heroSource.srcset = sourceSrcset;
    heroImage.srcset = heroSrcset;
    heroImage.src = heroSrc;
    fullImage.removeAttribute('srcset');
    fullImage.src = lqip;
    fullImage.dataset.fullSrc = fullSrc;
    fullImage.dataset.fullSrcset = fullSrcset;
    cachedMotionBlueprint = undefined;
    if (requestedTarget === 1) requestHighResolution();
  };

  const handleHeroLoad = () => {
    cachedMotionBlueprint = undefined;
    scheduleGeometryMeasurement();
    if (!highResolutionRequested) reuseDecodedHero();
  };

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
    cancelProgressFrame();
    if (stableCleanupTimer !== undefined) window.clearTimeout(stableCleanupTimer);
    stableCleanupTimer = undefined;
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

  const createTimelines = (blueprint: MotionBlueprint) => {
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

  const applyProgress = (nextProgress: number) => {
    progress = Math.min(Math.max(nextProgress, 0), 1);
    for (const animation of dragAnimations) animation.currentTime = progress * TIMELINE_DURATION;
  };

  const cancelProgressFrame = () => {
    if (progressFrame !== undefined) window.cancelAnimationFrame(progressFrame);
    progressFrame = undefined;
  };

  // 输入可以高于屏幕刷新率；保留最新进度，每个显示帧只写一次动画。
  const queueProgress = (nextProgress: number) => {
    progress = Math.min(Math.max(nextProgress, 0), 1);
    if (progressFrame !== undefined) return;
    progressFrame = window.requestAnimationFrame(() => {
      progressFrame = undefined;
      applyProgress(progress);
    });
  };

  const sampleProgress = () => {
    if (progressFrame !== undefined) return progress;
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

  const scheduleGeometryMeasurement = () => {
    if (geometryMeasureFrame !== undefined) window.cancelAnimationFrame(geometryMeasureFrame);
    geometryMeasureFrame = window.requestAnimationFrame(() => {
      geometryMeasureFrame = undefined;
      const currentProgress = sampleProgress();
      const wasSettling = state === 'settling';
      cachedMotionBlueprint = measureMotionBlueprint();
      cancelSettleAnimations();
      createTimelines(cachedMotionBlueprint);
      applyProgress(currentProgress);
      if (state === 'dragging') setMotionLayerHints(true);
      else if (wasSettling) settleTo(requestedTarget);
      else setMotionLayerHints(false);
    });
  };

  const scheduleLayoutUpdate = () => {
    if (layoutUpdateFrame !== undefined) return;
    layoutUpdateFrame = window.requestAnimationFrame(() => {
      layoutUpdateFrame = undefined;
      updateLayoutGeometry();
      scheduleGeometryMeasurement();
    });
  };

  const beginMotion = () => {
    // 先读取并缓存几何，再写入 inert、dataset 与 will-change，避免输入首帧强制同步布局。
    const blueprint = cachedMotionBlueprint ?? measureMotionBlueprint();
    cachedMotionBlueprint = blueprint;
    if (motionTracks.length === 0) createTimelines(blueprint);
    cullOffscreenDrawerContent();
    if (stableCleanupTimer !== undefined) window.clearTimeout(stableCleanupTimer);
    stableCleanupTimer = undefined;
    setElementUnavailable(drawer, false);
    setElementUnavailable(footer, false);
    source.removeAttribute('aria-hidden');
    documentElement.dataset.homeCoverMotionActive = 'true';
    shell.dataset.motionActive = 'true';
    setMotionLayerHints(true);
    applyProgress(progress);
  };

  const settleStable = (target: 0 | 1) => {
    cancelProgressFrame();
    const stableSequence = ++settleSequence;
    progress = target;
    requestedTarget = target;
    if (motionTracks.length > 0) applyProgress(target);
    cancelSettleAnimations();
    state = target === 1 ? 'expanded' : 'collapsed';
    shell.dataset.state = state;
    shell.dataset.expanded = String(target === 1);
    documentElement.dataset.homeCoverState = state;
    delete documentElement.dataset.homeCoverMotionActive;
    delete shell.dataset.motionActive;
    updateToggle(target === 1);

    if (target === 1) {
      documentElement.dataset.homeCoverExpanded = 'true';
      // 展开动画只复用已解码的首图；待舞台稳定后再请求高清资源，
      // 避免首次交互与图片网络调度、解码争抢同一批帧。
      requestHighResolution();
      commitHighResolution();
      if (status) status.textContent = '全图壁纸已展开';
    } else {
      delete documentElement.dataset.homeCoverExpanded;
      source.removeAttribute('aria-hidden');
      setElementUnavailable(drawer, false);
      setElementUnavailable(footer, false);
      if (status) status.textContent = '全图壁纸已收回';
    }
    updateWaves();
    syncWheelListener();

    const finalizeStableState = () => {
      stableCleanupTimer = undefined;
      if (stableSequence !== settleSequence) return;
      if (target === 1) {
        source.setAttribute('aria-hidden', 'true');
        setElementUnavailable(drawer, true);
        setElementUnavailable(footer, true);
      }
      setMotionLayerHints(false);
      if (target === 0) {
        // 收起态不保留带 transform 的暂停 WAAPI。否则长抽屉会持续成为一个
        // 数千像素高的合成层，恢复视口外内容时仍会整层重绘。
        disposeTimelines();
        releaseHighResolution();
        cullOffscreenDrawerContent();
      }
    };
    if (dragAnimations.length === 0 && settleAnimations.length === 0) finalizeStableState();
    else stableCleanupTimer = window.setTimeout(finalizeStableState, 48);
  };

  const settleTo = (target: 0 | 1, durationMs = resolveHomeCoverSettleDuration(progress, target, reduceMotion.matches)) => {
    const currentProgress = sampleProgress();
    cancelProgressFrame();
    requestedTarget = target;
    const duration = reduceMotion.matches ? 0 : durationMs;
    if (duration === 0 || currentProgress === target) {
      settleStable(target);
      return;
    }
    beginMotion();
    state = 'settling';
    shell.dataset.state = state;
    updateWaves();
    const sequence = ++settleSequence;
    settleStartProgress = currentProgress;
    settleTarget = target;
    settleDuration = duration;
    cancelSettleAnimations();
    for (const track of motionTracks) {
      settleAnimations.push(track.element.animate(
        [track.frameAt(currentProgress), track.frameAt(target)],
        { duration, easing: DRAWER_EASING, fill: 'both' },
      ));
    }
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
    cancelSettleAnimations();
    beginMotion();
    for (const animation of dragAnimations) animation.pause();
  };

  const beginGesture = (clientX: number, clientY: number) => {
    gestureStartX = clientX;
    gestureStartY = clientY;
    gestureStartTime = performance.now();
    gestureStartProgress = sampleProgress();
    gestureDirection = null;
    gestureEngaged = false;
    gestureCancelled = false;
  };

  const updateGesture = (clientX: number, clientY: number, preventDefault: () => void) => {
    const deltaX = clientX - gestureStartX;
    const intentDistance = clientY - gestureStartY;
    gestureDirection ??= resolveHomeCoverDirection(deltaX, intentDistance);
    if (gestureDirection === 'horizontal') {
      gestureCancelled = true;
      return;
    }
    if (gestureDirection !== 'vertical' || gestureCancelled) return;

    const currentProgress = sampleProgress();
    const canTakeOver = gestureEngaged || resolveHomeCoverTakeover({
      isHomeRoute: true,
      pageScrollY: window.scrollY,
      progress: currentProgress,
      intentDelta: intentDistance,
      clientY,
      headerHeight: measuredHeaderHeight,
    });
    if (!canTakeOver) return;

    preventDefault();
    if (!gestureEngaged) {
      interruptMotion();
      gestureStartProgress = progress;
      gestureEngaged = true;
    }
    if (state !== 'dragging') {
      state = 'dragging';
      shell.dataset.state = state;
      updateWaves();
    }
    queueProgress(resolveHomeCoverProgress({
      startProgress: gestureStartProgress,
      intentDelta: intentDistance,
      travelDistance: gestureTravelDistance,
    }));
  };

  const finishGesture = (clientX: number, clientY: number, cancelled = false) => {
    const deltaX = clientX - gestureStartX;
    const intentDistance = clientY - gestureStartY;
    const elapsedMs = Math.max(performance.now() - gestureStartTime, 1);
    const wasEngaged = gestureEngaged && gestureDirection === 'vertical' && !gestureCancelled;
    const release = resolveHomeCoverRelease({
      progress: sampleProgress(),
      deltaX,
      intentDistance,
      elapsedMs,
      cancelled: cancelled || gestureCancelled || gestureDirection !== 'vertical',
      reduceMotion: reduceMotion.matches,
    });
    if (wasEngaged) suppressClickUntil = performance.now() + 350;
    gestureEngaged = false;
    gestureDirection = null;
    settleTo(wasEngaged ? release.target : requestedTarget, wasEngaged ? release.durationMs : undefined);
  };

  const findTouch = (touches: TouchList, identifier: number) => {
    for (let index = 0; index < touches.length; index += 1) {
      const touch = touches.item(index);
      if (touch?.identifier === identifier) return touch;
    }
    return null;
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1 || activeTouchId !== null) {
      gestureCancelled = true;
      return;
    }
    const touch = event.touches[0];
    if (!touch || touch.clientY < measuredHeaderHeight) return;
    const currentProgress = sampleProgress();
    if (currentProgress <= 0 && window.scrollY > 1) return;
    if (shouldIgnoreHomeCoverGesture(event.target)) return;
    activeTouchId = touch.identifier;
    beginGesture(touch.clientX, touch.clientY);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (activeTouchId === null) return;
    if (event.touches.length > 1) {
      gestureCancelled = true;
      return;
    }
    const touch = findTouch(event.touches, activeTouchId);
    if (!touch) return;
    updateGesture(touch.clientX, touch.clientY, () => event.preventDefault());
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (activeTouchId === null) return;
    const touch = findTouch(event.changedTouches, activeTouchId);
    if (!touch) return;
    activeTouchId = null;
    document.removeEventListener('touchmove', handleTouchMove);
    finishGesture(touch.clientX, touch.clientY, event.type === 'touchcancel');
  };

  const handlePenDown = (event: PointerEvent) => {
    if (event.pointerType !== 'pen' || activePenId !== null || event.clientY < measuredHeaderHeight) return;
    const currentProgress = sampleProgress();
    if (currentProgress <= 0 && window.scrollY > 1) return;
    if (shouldIgnoreHomeCoverGesture(event.target)) return;
    trackedPenPointers.add(event.pointerId);
    if (trackedPenPointers.size > 1) gestureCancelled = true;
    activePenId = event.pointerId;
    beginGesture(event.clientX, event.clientY);
    documentElement.setPointerCapture(event.pointerId);
  };

  const handlePenMove = (event: PointerEvent) => {
    if (event.pointerId !== activePenId) return;
    updateGesture(event.clientX, event.clientY, () => event.preventDefault());
  };

  const handlePenFinish = (event: PointerEvent) => {
    trackedPenPointers.delete(event.pointerId);
    if (event.pointerId !== activePenId) return;
    activePenId = null;
    if (documentElement.hasPointerCapture(event.pointerId)) documentElement.releasePointerCapture(event.pointerId);
    finishGesture(event.clientX, event.clientY, event.type === 'pointercancel');
  };

  const handleToggle = (event: MouseEvent) => {
    if (performance.now() < suppressClickUntil) return;
    const nextTarget: 0 | 1 = requestedTarget === 1 ? 0 : 1;
    interruptMotion();
    settleTo(nextTarget, event.detail === 0 ? 0 : nextTarget === 1 ? TOGGLE_EXPAND_MS : TOGGLE_COLLAPSE_MS);
  };

  const resetWheelGesture = () => {
    if (wheelResetTimer !== undefined) window.clearTimeout(wheelResetTimer);
    wheelResetTimer = undefined;
    wheelIntentDistance = 0;
    wheelStartProgress = progress;
    wheelStartTime = 0;
    lastWheelTime = 0;
  };

  const holdWheelAtPageBoundary = () => {
    wheelRequiresFreshInput = true;
    if (wheelBoundaryTimer !== undefined) window.clearTimeout(wheelBoundaryTimer);
    wheelBoundaryTimer = window.setTimeout(() => {
      wheelBoundaryTimer = undefined;
      wheelRequiresFreshInput = false;
    }, WHEEL_GESTURE_IDLE_MS);
  };

  const finishWheelGesture = () => {
    if (wheelResetTimer !== undefined) window.clearTimeout(wheelResetTimer);
    wheelResetTimer = undefined;
    if (wheelStartTime === 0) return;
    const elapsedMs = Math.max(performance.now() - wheelStartTime, 1);
    const release = resolveHomeCoverRelease({
      progress: sampleProgress(),
      intentDistance: wheelIntentDistance,
      elapsedMs,
      reduceMotion: reduceMotion.matches,
    });
    wheelStartTime = 0;
    wheelIntentDistance = 0;
    settleTo(release.target, release.durationMs);
  };

  const handleWheel = (event: WheelEvent) => {
    if (!desktopWheel.matches || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    const intentDelta = normalizeHomeCoverWheelIntent(event.deltaY, event.deltaMode, window.innerHeight);
    if (intentDelta === 0) return;
    const currentProgress = sampleProgress();
    if (currentProgress <= 0 && intentDelta > 0 && (window.scrollY > 1 || wheelRequiresFreshInput)) {
      holdWheelAtPageBoundary();
      return;
    }
    if (!resolveHomeCoverTakeover({
      isHomeRoute: true,
      pageScrollY: window.scrollY,
      progress: currentProgress,
      intentDelta,
      freshInput: !wheelRequiresFreshInput,
    })) {
      if (wheelStartTime !== 0) finishWheelGesture();
      return;
    }

    if (shouldIgnoreHomeCoverGesture(event.target)) return;
    event.preventDefault();
    const now = performance.now();
    if (wheelStartTime === 0 || now - lastWheelTime > WHEEL_GESTURE_IDLE_MS) {
      interruptMotion();
      wheelStartProgress = progress;
      wheelIntentDistance = 0;
      wheelStartTime = now;
    }
    lastWheelTime = now;
    wheelIntentDistance += intentDelta;
    if (state !== 'dragging') {
      state = 'dragging';
      shell.dataset.state = state;
      updateWaves();
    }
    queueProgress(resolveHomeCoverProgress({
      startProgress: wheelStartProgress,
      intentDelta: wheelIntentDistance,
      travelDistance: wheelTravelDistance,
    }));
    if (wheelResetTimer !== undefined) window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(finishWheelGesture, WHEEL_GESTURE_IDLE_MS);
  };

  // 阅读正文时释放阻塞式滚轮监听，让浏览器直接滚动。
  const syncWheelListener = () => {
    const needed = desktopWheel.matches && (state !== 'collapsed' || window.scrollY <= 1);
    if (state === 'collapsed') {
      if (window.scrollY <= 1) cullOffscreenDrawerContent();
      else restoreVisibleDrawerContent();
    }
    if (needed === wheelListening) return;
    wheelListening = needed;
    if (needed) document.addEventListener('wheel', handleWheel, { passive: false });
    else document.removeEventListener('wheel', handleWheel);
  };

  const observeNativeWheel = (event: WheelEvent) => {
    if (!wheelListening && desktopWheel.matches && event.deltaY < 0 && !event.ctrlKey && !event.metaKey) {
      holdWheelAtPageBoundary();
    }
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
  const handleResize = () => scheduleLayoutUpdate();

  const layoutObserver = new ResizeObserver(scheduleLayoutUpdate);
  layoutObserver.observe(header);
  if (sidebar) layoutObserver.observe(sidebar);
  const coverObserver = new IntersectionObserver(([entry]) => {
    coverIsVisible = Boolean(entry?.isIntersecting);
    updateWaves();
  });
  coverObserver.observe(source);
  const motionCullObserver = new IntersectionObserver((entries) => {
    if (state !== 'collapsed') return;
    for (const entry of entries) {
      if (entry.isIntersecting && entry.target instanceof HTMLElement) {
        delete entry.target.dataset.homeMotionOffscreen;
      }
    }
  }, { rootMargin: '96px 0px' });
  for (const element of motionCullCandidates) motionCullObserver.observe(element);
  const themeObserver = new MutationObserver(syncHeroTheme);
  themeObserver.observe(documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  updateLayoutGeometry();
  scheduleGeometryMeasurement();
  settleStable(0);
  heroImage.addEventListener('load', handleHeroLoad);
  syncHeroTheme();
  if (heroImage.complete) handleHeroLoad();
  cullOffscreenDrawerContent();
  toggle.addEventListener('click', handleToggle);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd);
  document.addEventListener('touchcancel', handleTouchEnd);
  document.addEventListener('pointerdown', handlePenDown);
  document.addEventListener('pointermove', handlePenMove);
  document.addEventListener('pointerup', handlePenFinish);
  document.addEventListener('pointercancel', handlePenFinish);
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keydown', handleKeyboardReveal, true);
  document.addEventListener('wheel', observeNativeWheel, { passive: true });
  window.addEventListener('scroll', syncWheelListener, { passive: true });
  desktopWheel.addEventListener('change', syncWheelListener);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('resize', handleResize, { passive: true });
  reduceMotion.addEventListener('change', handleMotionPreference);

  cleanupCurrentHero = () => {
    settleSequence += 1;
    cancelHighResolutionRequest();
    layoutObserver.disconnect();
    coverObserver.disconnect();
    motionCullObserver.disconnect();
    themeObserver.disconnect();
    restoreDrawerContent();
    disposeTimelines();
    if (layoutUpdateFrame !== undefined) window.cancelAnimationFrame(layoutUpdateFrame);
    if (geometryMeasureFrame !== undefined) window.cancelAnimationFrame(geometryMeasureFrame);
    layoutUpdateFrame = undefined;
    geometryMeasureFrame = undefined;
    cachedMotionBlueprint = undefined;
    measuredStageRect = undefined;
    resetWheelGesture();
    if (wheelBoundaryTimer !== undefined) window.clearTimeout(wheelBoundaryTimer);
    wheelBoundaryTimer = undefined;
    wheelRequiresFreshInput = false;
    documentElement.style.overscrollBehaviorY = previousOverscrollBehavior;
    documentElement.style.removeProperty('--site-header-height');
    delete documentElement.dataset.homeCoverMotionActive;
    delete documentElement.dataset.homeCoverExpanded;
    delete documentElement.dataset.homeCoverState;
    shell.style.removeProperty('--home-cover-stage-center');
    stage.style.removeProperty('left');
    stage.style.removeProperty('width');
    stage.style.removeProperty('transform');
    viewport.style.removeProperty('transform');
    fullImage.style.removeProperty('width');
    fullImage.style.removeProperty('height');
    fullImage.style.removeProperty('transform');
    drawer.style.removeProperty('transform');
    toggle.style.removeProperty('transform');
    toggle.querySelector<SVGElement>('svg')?.style.removeProperty('transform');
    setElementUnavailable(drawer, false);
    setElementUnavailable(footer, false);
    toggle.removeEventListener('click', handleToggle);
    heroImage.removeEventListener('load', handleHeroLoad);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
    document.removeEventListener('pointerdown', handlePenDown);
    document.removeEventListener('pointermove', handlePenMove);
    document.removeEventListener('pointerup', handlePenFinish);
    document.removeEventListener('pointercancel', handlePenFinish);
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keydown', handleKeyboardReveal, true);
    document.removeEventListener('wheel', handleWheel);
    document.removeEventListener('wheel', observeNativeWheel);
    window.removeEventListener('scroll', syncWheelListener);
    desktopWheel.removeEventListener('change', syncWheelListener);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('resize', handleResize);
    reduceMotion.removeEventListener('change', handleMotionPreference);
  };
}

initHomeHeroMotion();
document.addEventListener('astro:page-load', initHomeHeroMotion);
document.addEventListener('astro:before-swap', () => {
  cleanupCurrentHero?.();
  cleanupCurrentHero = undefined;
});
