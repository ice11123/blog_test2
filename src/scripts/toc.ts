import { ensureHeadingId } from '../lib/headingAnchors';
import {
  DEFAULT_ARTICLE_HEADING_OFFSET,
  findActiveHeadingIndex,
  headingScrollTarget,
  readingProgress,
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
  let headingTops: number[] = [];
  let headingOffset = DEFAULT_ARTICLE_HEADING_OFFSET;
  let contentObserver: MutationObserver | null = null;
  let articleElement: HTMLElement | null = null;
  let activeFrame: number | null = null;
  let tocArea: HTMLElement | null = null;
  let indicator: HTMLElement | null = null;
  let generation = 0;
  let headingResizeObserver: ResizeObserver | null = null;
  let geometryRefreshFrame: number | null = null;
  let tocScrollFrame: number | null = null;
  let scrollSpyHandler: (() => void) | null = null;
  let tocScrollHandler: (() => void) | null = null;
  let tocScrollElement: HTMLElement | null = null;
  let tocSidebarElement: HTMLElement | null = null;
  let readingBar: HTMLElement | null = null;
  let readingLabel: HTMLElement | null = null;
  let readingPercent: HTMLElement | null = null;
  let readingTrack: HTMLElement | null = null;
  let articleStart = 0;
  let articleEnd = 0;
  let viewportHeight = 0;
  let articleTitle = '';

  document.addEventListener('astro:page-load', initToc);
  document.addEventListener('astro:before-swap', teardownToc);

  function initToc() {
    teardownToc();
    buildToc();
    setupTocScrollFeedback();

    const article = document.querySelector<HTMLElement>('.blog-post-page');
    if (!article) return;
    readingBar = document.querySelector<HTMLElement>('[data-reading-bar]');
    readingLabel = readingBar?.querySelector<HTMLElement>('[data-reading-section]') ?? null;
    readingPercent = readingBar?.querySelector<HTMLElement>('[data-reading-percent]') ?? null;
    readingTrack = readingBar?.querySelector<HTMLElement>('[data-reading-progress]') ?? null;
    articleTitle = readingLabel?.textContent ?? '';
    articleElement = article;
    if (article) {
      headingResizeObserver = new ResizeObserver(scheduleGeometryRefresh);
      headingResizeObserver.observe(article);
      const prose = article.querySelector('.prose');
      const blocks = new Set<Element>();
      const observeBlocks = () => {
        blocks.forEach(block => { if (!article.contains(block)) { headingResizeObserver?.unobserve(block); blocks.delete(block); } });
        article.querySelectorAll('.prose > *').forEach(block => {
          if (!blocks.has(block)) headingResizeObserver?.observe(block);
          blocks.add(block);
        });
      };
      observeBlocks();
      const header = document.getElementById('site-header');
      if (header) headingResizeObserver.observe(header);
      if (readingBar) headingResizeObserver.observe(readingBar);
      // 相同总高度的内容重排也会改变标题位置，不能只观察文章外框。
      // 不把图表内部每帧的 style/class 更新当成正文重排，尺寸变化由 ResizeObserver 兜底。
      contentObserver = new MutationObserver(records => {
        if (records.some(record => record.type === 'childList' && record.target === prose)) observeBlocks();
        const needsRefresh = records.some(record => {
          if (record.type === 'childList') return record.target === prose;
          return record.attributeName === 'open' || record.attributeName === 'hidden'
            || record.target === article || record.target === prose || blocks.has(record.target as Element);
        });
        if (needsRefresh) scheduleGeometryRefresh();
      });
      contentObserver.observe(article, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'hidden', 'class', 'style'] });
      article.addEventListener('load', scheduleGeometryRefresh, true);
      article.addEventListener('toggle', scheduleGeometryRefresh, true);
    }

    window.addEventListener('resize', scheduleGeometryRefresh, { passive: true });
    window.addEventListener('load', scheduleGeometryRefresh, { once: true });
    const mountedGeneration = generation;
    document.fonts?.ready.then(() => { if (generation === mountedGeneration) scheduleGeometryRefresh(); });

    refreshGeometry();
    setupScrollSpy();
  }

  function teardownToc() {
    generation++;
    if (scrollSpyHandler) window.removeEventListener('scroll', scrollSpyHandler);
    if (tocScrollHandler && tocScrollElement) {
      tocScrollElement.removeEventListener('scroll', tocScrollHandler);
    }
    window.removeEventListener('resize', scheduleGeometryRefresh);
    window.removeEventListener('load', scheduleGeometryRefresh);
    scrollSpyHandler = null;
    tocScrollHandler = null;
    tocScrollElement = null;
    tocSidebarElement = null;
    readingBar = null;
    readingLabel = null;
    readingPercent = null;
    readingTrack = null;
    tocArea = null;
    indicator = null;
    contentObserver?.disconnect();
    contentObserver = null;
    articleElement?.removeEventListener('load', scheduleGeometryRefresh, true);
    articleElement?.removeEventListener('toggle', scheduleGeometryRefresh, true);
    articleElement = null;

    headingResizeObserver?.disconnect();
    headingResizeObserver = null;

    if (geometryRefreshFrame !== null) cancelAnimationFrame(geometryRefreshFrame);
    geometryRefreshFrame = null;
    if (tocScrollFrame !== null) cancelAnimationFrame(tocScrollFrame);
    tocScrollFrame = null;
    if (activeFrame !== null) cancelAnimationFrame(activeFrame);
    activeFrame = null;

    headingElements.length = 0;
    tocItemElements.length = 0;
    ticking = false;
    previousActiveIndex = -1;
    headingTops = [];
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

      const link = document.createElement('a');
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent?.trim() || '';
      link.addEventListener('click', (event) => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        history.pushState(history.state, '', link.hash);
        // 先让遮罩式抽屉释放正文，再转交章节焦点。
        document.dispatchEvent(new CustomEvent('blog:heading-navigation', { detail: { id: heading.id } }));
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
        const headingTop = documentTop(heading);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: headingScrollTarget(headingTop, getHeadingScrollOffset()),
          behavior: reduceMotion || event.detail === 0 ? 'auto' : 'smooth',
        });
      });

      item.appendChild(link);
      tocList.appendChild(item);
      headingElements.push({ element: heading, tocItem: item });
      tocItemElements.push(item);
    });

    return true;
  }

  function refreshGeometry() {
    headingTops = headingElements.map(({ element }) => documentTop(element));
    headingOffset = getHeadingScrollOffset();
    const offsetValue = `${headingOffset}px`;
    if (articleElement && articleElement.style.getPropertyValue('--article-heading-offset') !== offsetValue) {
      articleElement.style.setProperty('--article-heading-offset', offsetValue);
    }
    const prose = articleElement?.querySelector<HTMLElement>('.prose');
    if (prose) {
      const rect = prose.getBoundingClientRect();
      articleStart = rect.top + window.scrollY;
      articleEnd = rect.bottom + window.scrollY;
    }
    viewportHeight = window.innerHeight;
  }

  function documentTop(element: HTMLElement): number {
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function getHeadingScrollOffset(): number {
    const article = document.querySelector<HTMLElement>('.blog-post-page');
    if (!article) return DEFAULT_ARTICLE_HEADING_OFFSET;
    if (window.matchMedia('(max-width: 1099.98px)').matches) {
      const headerHeight = document.getElementById('site-header')?.getBoundingClientRect().height ?? 100;
      const barHeight = readingBar?.getBoundingClientRect().height ?? 0;
      return headerHeight + barHeight + 16;
    }

    const rawOffset = getComputedStyle(article).getPropertyValue('--article-heading-offset');
    const parsedOffset = Number.parseFloat(rawOffset);
    return Number.isFinite(parsedOffset) ? parsedOffset : DEFAULT_ARTICLE_HEADING_OFFSET;
  }

  function scheduleGeometryRefresh() {
    if (geometryRefreshFrame !== null) return;

    geometryRefreshFrame = requestAnimationFrame(() => {
      geometryRefreshFrame = null;
      refreshGeometry();
      updateActive();
      updateRightIndicator(previousActiveIndex);
      scheduleTocScrollFeedback();
    });
  }

  function setupScrollSpy() {
    scrollSpyHandler = () => {
      if (ticking) return;
      ticking = true;
      activeFrame = requestAnimationFrame(() => { activeFrame = null; updateActive(); });
    };

    window.addEventListener('scroll', scrollSpyHandler, { passive: true });
    updateActive();
  }

  function setupTocScrollFeedback() {
    tocScrollElement = document.querySelector<HTMLElement>('.article-toc-scroll');
    tocSidebarElement = document.querySelector<HTMLElement>('[data-article-toc-sidebar]');
    tocArea = tocScrollElement;
    indicator = tocArea?.querySelector<HTMLElement>('.position-indicator') ?? null;
    if (!tocScrollElement || !tocSidebarElement) return;

    tocScrollHandler = scheduleTocScrollFeedback;
    tocScrollElement.addEventListener('scroll', tocScrollHandler, { passive: true });
    scheduleTocScrollFeedback();
  }

  function scheduleTocScrollFeedback() {
    if (tocScrollFrame !== null) return;

    tocScrollFrame = requestAnimationFrame(() => {
      tocScrollFrame = null;
      updateTocScrollFeedback();
      updateRightIndicator(previousActiveIndex);
    });
  }

  function updateTocScrollFeedback() {
    if (!tocScrollElement || !tocSidebarElement) return;

    const edgeTolerance = 2;
    const maxScrollTop = Math.max(0, tocScrollElement.scrollHeight - tocScrollElement.clientHeight);
    const atStart = tocScrollElement.scrollTop <= edgeTolerance;
    const atEnd = tocScrollElement.scrollTop >= maxScrollTop - edgeTolerance;

    if (tocSidebarElement.dataset.scrollStart !== String(atStart)) {
      tocSidebarElement.dataset.scrollStart = String(atStart);
    }
    if (tocSidebarElement.dataset.scrollEnd !== String(atEnd)) {
      tocSidebarElement.dataset.scrollEnd = String(atEnd);
    }
  }

  function updateActive() {
    const activeIndex = findActiveHeadingIndex(
      headingTops,
      window.scrollY,
      headingOffset,
    );
    const progress = readingProgress(window.scrollY, articleStart, articleEnd, viewportHeight, headingOffset);
    if (readingTrack) readingTrack.style.transform = `scaleX(${progress})`;
    const percent = `${Math.round(progress * 100)}%`;
    if (readingPercent && readingPercent.textContent !== percent) readingPercent.textContent = percent;
    const label = headingElements[activeIndex]?.element.textContent?.trim() || articleTitle;
    if (readingLabel && readingLabel.textContent !== label) readingLabel.textContent = label;

    if (activeIndex !== previousActiveIndex) {
      const previous = tocItemElements[previousActiveIndex];
      previousActiveIndex = activeIndex;
      previous?.classList.remove('active');
      previous?.querySelector('a')?.removeAttribute('aria-current');
      const current = tocItemElements[activeIndex];
      current?.classList.add('active');
      current?.querySelector('a')?.setAttribute('aria-current', 'location');

      if (activeIndex >= 0) scrollTocToView(tocItemElements[activeIndex]);
      updateRightIndicator(activeIndex);
    }

    ticking = false;
  }

  function updateRightIndicator(activeIndex: number) {
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
