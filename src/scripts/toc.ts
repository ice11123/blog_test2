import { ensureHeadingId } from '../lib/headingAnchors';

// 防止 dev 模式下视图过渡导致脚本重复执行
if (!(window as any).__tocLoaded) {
  (window as any).__tocLoaded = true;

const headingElements: { element: HTMLElement; tocItem: HTMLLIElement }[] = [];
const tocItemElements: HTMLLIElement[] = [];
const headingAbsTops: number[] = []; // 文档绝对偏移，buildToc 时缓存
const headingAbsBottoms: number[] = [];

let ticking = false;
let prevActiveIndex = -1;
let programmaticScrolling = false;

let animFrame: number | null = null;
let animStartY = 0;
let animTargetY = 0;
let animStartTop = 0;
let animStartBottom = 0;
let animTargetTop = 0;
let animTargetBottom = 0;
const V_PAD = 4;
let headingResizeObserver: ResizeObserver | null = null;
let headingGeometryFrame: number | null = null;

document.addEventListener('astro:page-load', initToc);
document.addEventListener('astro:before-swap', teardownToc);

function initToc() {
  teardownToc();
  if (!buildToc()) return;
  setupScrollSpy();
}

function teardownToc() {
  if (scrollSpyHandler) window.removeEventListener('scroll', scrollSpyHandler);
  scrollSpyHandler = null;
  headingResizeObserver?.disconnect();
  headingResizeObserver = null;
  if (headingGeometryFrame !== null) cancelAnimationFrame(headingGeometryFrame);
  headingGeometryFrame = null;
  stopAnim();
  headingElements.length = 0;
  tocItemElements.length = 0;
  headingAbsTops.length = 0;
  headingAbsBottoms.length = 0;
  ticking = false;
  prevActiveIndex = -1;
  programmaticScrolling = false;
}

function cacheHeadingGeometry() {
  headingAbsTops.length = 0;
  headingAbsBottoms.length = 0;
  for (const { element } of headingElements) {
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    headingAbsTops.push(top);
    headingAbsBottoms.push(top + rect.height);
  }
}

function scheduleHeadingGeometry() {
  if (headingGeometryFrame !== null) return;
  headingGeometryFrame = requestAnimationFrame(() => {
    headingGeometryFrame = null;
    cacheHeadingGeometry();
    updateActive();
  });
}

function buildToc(): boolean {
  const tocList = document.getElementById('toc-list');
  if (!tocList) return false;

  tocList.innerHTML = '';

  const headings = document.querySelectorAll('.prose > h2, .prose > h3, .prose h2.mk-title, .prose h3.mk-title');
  if (headings.length === 0) {
    tocList.innerHTML = '<li class="toc-empty">本部分无目录</li>';
    return false;
  }

  const occupiedIds = new Set(Array.from(headings, heading => (heading as HTMLElement).id).filter(Boolean));
  headings.forEach((heading, index) => {
    const el = heading as HTMLElement;
    ensureHeadingId(el, index, occupiedIds);

    const li = document.createElement('li');
    if (heading.tagName === 'H2') li.classList.add('toc-level-h2');
    if (heading.tagName === 'H3') li.classList.add('toc-level-h3');

    const div = document.createElement('div');
    div.style.cursor = 'pointer';
    div.onclick = () => {
      const targetIdx = headingElements.findIndex(h => h.tocItem === li);
      if (targetIdx < 0) return;

      tocItemElements.forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      programmaticScrolling = true;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reduceMotion) startAnim(targetIdx);

      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        stopAnim();
        programmaticScrolling = false;
        prevActiveIndex = -1;
        tocItemElements.forEach(item => item.classList.remove('active'));
        li.classList.add('active');
        updateRightIndicator();
      };

      if (reduceMotion) {
        requestAnimationFrame(settle);
        return;
      }

      window.addEventListener('scrollend', settle, { once: true });

      let debounceTimer: ReturnType<typeof setTimeout>;
      const onScroll = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          window.removeEventListener('scroll', onScroll);
          settle();
        }, 200);
      };
      setTimeout(() => {
        if (!settled) {
          window.addEventListener('scroll', onScroll);
        }
      }, 120);
    };
    div.textContent = heading.textContent?.trim() || '';
    li.appendChild(div);
    tocList.appendChild(li);

    headingElements.push({ element: el, tocItem: li });
    tocItemElements.push(li);
  });

  if (headingElements.length === 0) {
    tocList.innerHTML = '<li class="toc-empty">本部分无目录</li>';
    return false;
  }

  cacheHeadingGeometry();
  const prose = document.querySelector<HTMLElement>('.prose');
  if (prose) {
    headingResizeObserver = new ResizeObserver(scheduleHeadingGeometry);
    headingResizeObserver.observe(prose);
  }
  return true;
}

// 使用缓存的绝对偏移模拟指定 scrollY 处的可见范围
function computeRangeAt(scrollY: number): { firstIdx: number; lastIdx: number } {
  const viewportHeight = window.innerHeight;
  let firstIdx = -1;
  let lastIdx = -1;

  for (let i = 0; i < headingAbsTops.length; i++) {
    const top = headingAbsTops[i];
    const bottom = headingAbsBottoms[i];
    if (top < scrollY + viewportHeight && bottom >= scrollY) {
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
    }
  }

  return { firstIdx, lastIdx };
}

// 获取 TOC 项在 .toc-area 内的相对偏移（不受页面滚动影响）
function tocItemRect(idx: number): { top: number; bottom: number } {
  const container = document.querySelector('.toc-area');
  if (!container || idx < 0 || idx >= tocItemElements.length) return { top: 0, bottom: 0 };
  const item = tocItemElements[idx] as HTMLElement;
  const cRect = container.getBoundingClientRect();
  const iRect = item.getBoundingClientRect();
  const top = iRect.top - cRect.top + container.scrollTop;
  return { top: top + V_PAD, bottom: top + item.offsetHeight - V_PAD };
}

function setIndicatorRange(indicator: HTMLElement, top: number, bottom: number): void {
  const length = Math.max(1, bottom - top);
  indicator.style.transform = `translateY(${top}px) scaleY(${length})`;
}

function startAnim(targetIdx: number) {
  const container = document.querySelector('.toc-area');
  const indicator = container?.querySelector('.position-indicator') as HTMLElement | null;
  if (!container || !indicator) return;

  indicator.style.transition = 'none';

  animStartY = window.scrollY;
  animTargetY = Math.max(0, headingAbsTops[targetIdx] - 20);

  // 起点：直接用指示器当前的视觉位置（getBoundingClientRect，保证准确）
  const cRect = container.getBoundingClientRect();
  const iRect = indicator.getBoundingClientRect();
  animStartTop = iRect.top - cRect.top + container.scrollTop;
  animStartBottom = iRect.bottom - cRect.top + container.scrollTop;

  // 终点：用缓存的绝对偏移模拟目标位置的可见范围
  const tr = computeRangeAt(animTargetY);
  if (tr.firstIdx >= 0) {
    const a = tocItemRect(tr.firstIdx);
    const b = tocItemRect(tr.lastIdx);
    animTargetTop = a.top;
    animTargetBottom = b.bottom;
  } else {
    const r = tocItemRect(targetIdx);
    animTargetTop = r.top;
    animTargetBottom = r.bottom;
  }

  // 若已在目标位置则跳过动画
  if (Math.abs(animTargetY - animStartY) < 2) {
    setIndicatorRange(indicator, animTargetTop, animTargetBottom);
    indicator.classList.add('visible');
    indicator.style.transition = '';
    animFrame = null;
    return;
  }

  // 先渲染起点，再启动插值
  setIndicatorRange(indicator, animStartTop, animStartBottom);
  indicator.classList.add('visible');

  if (animFrame !== null) cancelAnimationFrame(animFrame);
  tick();
}

function stopAnim() {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  const indicator = document.querySelector('.toc-area .position-indicator') as HTMLElement | null;
  if (indicator) indicator.style.transition = '';
}

function tick() {
  const container = document.querySelector('.toc-area');
  const indicator = container?.querySelector('.position-indicator') as HTMLElement | null;
  if (!container || !indicator) return;

  const sy = window.scrollY;
  const progress = Math.max(0, Math.min(1, (sy - animStartY) / (animTargetY - animStartY)));

  const t = animStartTop + (animTargetTop - animStartTop) * progress;
  const b = animStartBottom + (animTargetBottom - animStartBottom) * progress;

  setIndicatorRange(indicator, t, b);

  if (progress < 1) {
    animFrame = requestAnimationFrame(tick);
  } else {
    animFrame = null;
  }
}

function scrollTocToView(tocItem: HTMLLIElement) {
  const tocArea = document.querySelector('.toc-area');
  if (!tocArea || !tocItem) return;

  const areaRect = tocArea.getBoundingClientRect();
  const itemRect = tocItem.getBoundingClientRect();
  const leadOffset = -100;
  const itemTop = itemRect.top - areaRect.top;
  const itemBottom = itemRect.bottom - areaRect.top;

  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (itemTop < -leadOffset) {
    tocArea.scrollBy({ top: itemTop + leadOffset, behavior });
  } else if (itemBottom > areaRect.height + leadOffset) {
    tocArea.scrollBy({ top: itemBottom - areaRect.height - leadOffset, behavior });
  }
}

let scrollSpyHandler: (() => void) | null = null;

function setupScrollSpy() {
  if (scrollSpyHandler) window.removeEventListener('scroll', scrollSpyHandler);
  scrollSpyHandler = () => {
    if (!ticking) {
      requestAnimationFrame(updateActive);
      ticking = true;
    }
  };
  window.addEventListener('scroll', scrollSpyHandler);
  updateActive();
}

function updateRightIndicator(firstVisibleIdx?: number, lastVisibleIdx?: number) {
  const container = document.querySelector('.toc-area');
  const indicator = document.querySelector<HTMLElement>('.toc-area .position-indicator');
  if (!container || !indicator) return;

  if (firstVisibleIdx === undefined || lastVisibleIdx === undefined) {
    const range = computeRangeAt(window.scrollY);
    firstVisibleIdx = range.firstIdx;
    lastVisibleIdx = range.lastIdx;
  }

  if (firstVisibleIdx === -1) {
    const active = document.querySelector('#toc-list li.active');
    if (!active) {
      indicator.classList.remove('visible');
      return;
    }
    const item = active as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const relTop = itemRect.top - containerRect.top + container.scrollTop;
    setIndicatorRange(indicator, relTop + V_PAD, relTop + item.offsetHeight - V_PAD);
    indicator.classList.add('visible');
    return;
  }

  const firstItem = tocItemElements[firstVisibleIdx] as HTMLElement;
  const lastItem = tocItemElements[lastVisibleIdx] as HTMLElement;
  const containerRect = container.getBoundingClientRect();
  const firstRect = firstItem.getBoundingClientRect();
  const lastRect = lastItem.getBoundingClientRect();
  const topRel = firstRect.top - containerRect.top + container.scrollTop + V_PAD;
  const bottomRel = lastRect.top - containerRect.top + container.scrollTop + lastItem.offsetHeight - V_PAD;

  setIndicatorRange(indicator, topRel, bottomRel);
  indicator.classList.add('visible');
}

function updateActive() {
  if (programmaticScrolling) {
    ticking = false;
    return;
  }

  let bestMatchIndex = -1;
  const scrollY = window.scrollY;
  const offset = 20;

  for (let i = headingAbsTops.length - 1; i >= 0; i--) {
    if (scrollY + offset >= headingAbsTops[i]) {
      bestMatchIndex = i;
      break;
    }
  }

  if (bestMatchIndex !== prevActiveIndex) {
    prevActiveIndex = bestMatchIndex;
    tocItemElements.forEach(item => item.classList.remove('active'));
    if (bestMatchIndex !== -1) {
      const active = tocItemElements[bestMatchIndex];
      active.classList.add('active');
      scrollTocToView(active);
    }
  }

  const range = computeRangeAt(scrollY);
  updateRightIndicator(range.firstIdx, range.lastIdx);
  ticking = false;
}

}
