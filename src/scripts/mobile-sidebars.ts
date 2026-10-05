type SidebarName = 'left' | 'right';

const MOBILE_QUERY = '(max-width: 1099.98px)';
const ROOT_ATTRIBUTE = 'data-mobile-sidebar';

let teardownCurrentPage: (() => void) | null = null;

function initMobileSidebars() {
  teardownCurrentPage?.();

  const controls = document.querySelector<HTMLElement>('[data-mobile-sidebar-controls]');
  const leftDrawer = document.querySelector<HTMLElement>('[data-persistent-sidebar]');
  const rightDrawer = document.querySelector<HTMLElement>('[data-article-toc-sidebar]');
  const header = document.getElementById('site-header');
  if (!controls || !leftDrawer || !header) {
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    teardownCurrentPage = null;
    return;
  }

  const siteSidebar = leftDrawer;
  const siteHeader = header;

  const media = window.matchMedia(MOBILE_QUERY);
  const toggles = Array.from(controls.querySelectorAll<HTMLButtonElement>('[data-mobile-sidebar-toggle]'));
  const backdrop = controls.querySelector<HTMLButtonElement>('[data-mobile-sidebar-backdrop]');
  const status = controls.querySelector<HTMLElement>('[data-mobile-sidebar-status]');
  const readingToggle = document.querySelector<HTMLButtonElement>('[data-reading-toc]');
  const abortController = new AbortController();
  const { signal } = abortController;
  let returnFocus: HTMLButtonElement | null = null;
  const unavailableBeforeOpen = new Map<HTMLElement, boolean>();
  const pageContent = Array.from(document.querySelectorAll<HTMLElement>('main.public-main, body > footer'));

  function restorePageContent() {
    for (const [element, previous] of unavailableBeforeOpen) element.inert = previous;
    unavailableBeforeOpen.clear();
  }

  function focusDrawer(name: SidebarName) {
    const drawer = drawerFor(name);
    const target = drawer?.querySelector<HTMLElement>('[aria-current], [role="tab"][aria-selected="true"]')
      ?? drawer?.querySelector<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
    target?.focus({ preventScroll: true });
  }

  controls.dataset.mobileSidebarReady = 'true';
  toggles.forEach((toggle) => { toggle.disabled = false; });

  const drawerFor = (name: SidebarName) => name === 'left' ? siteSidebar : rightDrawer;

  function updateHeaderHeight() {
    const height = Math.max(0, siteHeader.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty('--public-header-height', `${height}px`);
  }

  function syncAvailability(openName: SidebarName | null) {
    const mobile = media.matches;
    siteSidebar.inert = mobile && openName !== 'left';
    if (rightDrawer) rightDrawer.inert = mobile && openName !== 'right';
    readingToggle?.setAttribute('aria-expanded', String(mobile && openName === 'right'));

    toggles.forEach((toggle) => {
      const name = toggle.dataset.mobileSidebarToggle as SidebarName;
      const expanded = mobile && name === openName;
      toggle.setAttribute('aria-expanded', String(expanded));
      const label = name === 'left'
        ? `${expanded ? '收起' : '展开'}站点侧栏`
        : `${expanded ? '收起' : '展开'}文章目录`;
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    });
  }

  function close({ restoreFocus = false, announce = true } = {}) {
    const openName = document.documentElement.getAttribute(ROOT_ATTRIBUTE) as SidebarName | null;
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    syncAvailability(null);
    restorePageContent();
    if (announce && openName && status) status.textContent = openName === 'left' ? '站点侧栏已收起' : '文章目录已收起';
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  function open(name: SidebarName, trigger: HTMLButtonElement) {
    if (!media.matches || !drawerFor(name)) return;
    const current = document.documentElement.getAttribute(ROOT_ATTRIBUTE);
    if (current === name) {
      close({ restoreFocus: true });
      return;
    }

    returnFocus = trigger;
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, name);
    syncAvailability(name);
    for (const element of pageContent) {
      if (!unavailableBeforeOpen.has(element)) unavailableBeforeOpen.set(element, element.inert);
      element.inert = true;
    }
    focusDrawer(name);
    if (status) status.textContent = name === 'left' ? '站点侧栏已展开' : '文章目录已展开';
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const name = toggle.dataset.mobileSidebarToggle as SidebarName | undefined;
      if (name) open(name, toggle);
    }, { signal });
  });
  readingToggle?.addEventListener('click', () => open('right', readingToggle), { signal });

  backdrop?.addEventListener('click', () => close({ restoreFocus: true }), { signal });
  document.addEventListener('keydown', (event) => {
    if (event.isComposing || document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape' && document.documentElement.hasAttribute(ROOT_ATTRIBUTE)) {
      event.preventDefault();
      close({ restoreFocus: true });
    }
    const name = document.documentElement.getAttribute(ROOT_ATTRIBUTE) as SidebarName | null;
    if (event.key !== 'Tab' || !media.matches || !name || document.querySelector('dialog[open]')) return;
    // 顶栏仍可用；焦点只在顶栏、当前抽屉和展开控件之间循环。
    const scopes = [siteHeader, drawerFor(name), controls];
    const focusable = scopes.flatMap(scope => scope ? Array.from(scope.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex="0"]')) : [])
      .filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden' && !element.closest('[inert]'));
    if (!focusable.length) return;
    const current = focusable.indexOf(document.activeElement as HTMLElement);
    const next = current < 0 ? (event.shiftKey ? focusable.length - 1 : 0)
      : (current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
    event.preventDefault();
    focusable[next].focus({ preventScroll: true });
  }, { signal });

  document.addEventListener('blog:heading-navigation', () => {
    if (media.matches) close({ announce: false });
  }, { signal });

  const resizeObserver = new ResizeObserver(updateHeaderHeight);
  resizeObserver.observe(siteHeader);
  media.addEventListener('change', () => {
    close({ announce: false });
    updateHeaderHeight();
    syncAvailability(null);
  }, { signal });

  updateHeaderHeight();
  close({ announce: false });

  teardownCurrentPage = () => {
    abortController.abort();
    resizeObserver.disconnect();
    restorePageContent();
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    document.documentElement.style.removeProperty('--public-header-height');
    siteSidebar.inert = false;
    if (rightDrawer) rightDrawer.inert = false;
    delete controls.dataset.mobileSidebarReady;
  };
}

document.addEventListener('astro:page-load', initMobileSidebars);
document.addEventListener('astro:before-swap', () => teardownCurrentPage?.());
