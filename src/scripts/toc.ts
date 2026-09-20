import { ensureHeadingId } from '../lib/headingAnchors';
import {
  DEFAULT_ARTICLE_HEADING_OFFSET,
  findActiveHeadingIndex,
  headingScrollTarget,
} from '../lib/tocGeometry';

declare global {
  interface Window {
    __tocLoaded?: boolean;
  }
}
if (!window.__tocLoaded) {
  window.__tocLoaded = true;

  const headingElements: { element: HTMLElement; tocItem: HTMLLIElement }[] = [];
  const tocItemElements: HTMLLIElement[] = [];

  let ticking = false;
  let previousActiveIndex = -1;
  let headingResizeObserver: ResizeObserver | null = null;
  let geometryRefreshFrame: number | null = null;
  let scrollSpyHandler: (() => void) | null = null;

  document.addEventListener('astro:page-load', initToc);
  document.addEventListener('astro:before-swap', teardownToc);

  function initToc() {
    teardownToc();
    if (!buildToc()) return;

    const article = document.querySelector<HTMLElement>('.blog-post-page');
    if (article) {
      headingResizeObserver = new ResizeObserver(scheduleGeometryRefresh);
      headingResizeObserver.observe(article);
    }

    window.addEventListener('resize', scheduleGeometryRefresh, { passive: true });
    window.addEventListener('load', scheduleGeometryRefresh, { once: true });
    document.fonts?.ready.then(() => scheduleGeometryRefresh());

    setupScrollSpy();
  }

  function teardownToc() {
    if (scrollSpyHandler) window.removeEventListener('scroll', scrollSpyHandler);
    window.removeEventListener('resize', scheduleGeometryRefresh);
    window.removeEventListener('load', scheduleGeometryRefresh);
    scrollSpyHandler = null;

    headingResizeObserver?.disconnect();
    headingResizeObserver = null;

    if (geometryRefreshFrame !== null) cancelAnimationFrame(geometryRefreshFrame);
    geometryRefreshFrame = null;

    headingElements.length = 0;
    tocItemElements.length = 0;
    ticking = false;
    previousActiveIndex = -1;
  }

  function buildToc(): boolean {
    const tocList = document.getElementById('toc-list');
    if (!tocList) return false;

    tocList.innerHTML = '';
    const headings = document.querySelectorAll<HTMLElement>(
      '.prose > h2, .prose > h3, .prose h2.mk-title, .prose h3.mk-title',
    );

    if (headings.length === 0) {
      tocList.innerHTML = '<li class="toc-empty">本部分无目录</li>';
      return false;
    }

    const occupiedIds = new Set(Array.from(headings, (heading) => heading.id).filter(Boolean));

    headings.forEach((heading, index) => {
      ensureHeadingId(heading, index, occupiedIds);

      const item = document.createElement('li');
      item.classList.add(heading.tagName === 'H2' ? 'toc-level-h2' : 'toc-level-h3');

      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = heading.textContent?.trim() || '';
      button.addEventListener('click', () => {
        const headingTop = documentTop(heading);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: headingScrollTarget(headingTop, getHeadingScrollOffset()),
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      });

      item.appendChild(button);
      tocList.appendChild(item);
      headingElements.push({ element: heading, tocItem: item });
      tocItemElements.push(item);
    });

    return true;
  }

  function documentTop(element: HTMLElement): number {
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function getHeadingScrollOffset(): number {
    const article = document.querySelector<HTMLElement>('.blog-post-page');
    if (!article) return DEFAULT_ARTICLE_HEADING_OFFSET;

    const rawOffset = getComputedStyle(article).getPropertyValue('--article-heading-offset');
    const parsedOffset = Number.parseFloat(rawOffset);
    return Number.isFinite(parsedOffset) ? parsedOffset : DEFAULT_ARTICLE_HEADING_OFFSET;
  }

  function scheduleGeometryRefresh() {
    if (geometryRefreshFrame !== null) return;

    geometryRefreshFrame = requestAnimationFrame(() => {
      geometryRefreshFrame = null;
      updateActive();
    });
  }

  function setupScrollSpy() {
    scrollSpyHandler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActive);
    };

    window.addEventListener('scroll', scrollSpyHandler, { passive: true });
    updateActive();
  }

  function updateActive() {
    const headingTops = headingElements.map(({ element }) => documentTop(element));
    const activeIndex = findActiveHeadingIndex(
      headingTops,
      window.scrollY,
      getHeadingScrollOffset(),
    );

    if (activeIndex !== previousActiveIndex) {
      previousActiveIndex = activeIndex;
      tocItemElements.forEach((item, index) => {
        item.classList.toggle('active', index === activeIndex);
      });

      if (activeIndex >= 0) scrollTocToView(tocItemElements[activeIndex]);
    }

    updateRightIndicator(activeIndex);
    ticking = false;
  }

  function updateRightIndicator(activeIndex: number) {
    const tocArea = document.querySelector<HTMLElement>('.toc-area');
    const indicator = tocArea?.querySelector<HTMLElement>('.position-indicator');
    const activeItem = tocItemElements[activeIndex];

    if (!tocArea || !indicator || !activeItem) {
      indicator?.classList.remove('visible');
      return;
    }

    const areaRect = tocArea.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const top = itemRect.top - areaRect.top + tocArea.scrollTop + 4;
    const bottom = top + activeItem.offsetHeight - 8;
    setIndicatorRange(indicator, top, bottom);
    indicator.classList.add('visible');
  }

  function setIndicatorRange(indicator: HTMLElement, top: number, bottom: number) {
    const length = Math.max(1, bottom - top);
    indicator.style.transform = `translateY(${top}px) scaleY(${length})`;
  }

  function scrollTocToView(tocItem: HTMLLIElement) {
    const tocArea = document.querySelector<HTMLElement>('.toc-area');
    if (!tocArea) return;

    const areaRect = tocArea.getBoundingClientRect();
    const itemRect = tocItem.getBoundingClientRect();
    const padding = 12;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth';

    if (itemRect.top < areaRect.top + padding) {
      tocArea.scrollBy({ top: itemRect.top - areaRect.top - padding, behavior });
    } else if (itemRect.bottom > areaRect.bottom - padding) {
      tocArea.scrollBy({ top: itemRect.bottom - areaRect.bottom + padding, behavior });
    }
  }
}
