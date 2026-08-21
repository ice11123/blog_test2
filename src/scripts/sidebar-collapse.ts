// 防止 Astro 视图切换导致事件重复绑定。
if (!(window as any).__sidebarCollapseLoaded) {
  (window as any).__sidebarCollapseLoaded = true;

  const STORAGE = 'blog-test2-right-sidebar-collapsed';
  const mobileViewport = window.matchMedia('(max-width: 760px)');

  function updateControls(): void {
    const mobileOpen = document.documentElement.classList.contains('mobile-sidebar-open');
    const desktopOpen = !document.documentElement.classList.contains('sidebar-collapsed');
    const open = mobileViewport.matches ? mobileOpen : desktopOpen;
    document.getElementById('toggleSidebarBtn')?.setAttribute('aria-expanded', String(open));
  }

  function closeMobileDrawer(): void {
    document.documentElement.classList.remove('mobile-sidebar-open');
    updateControls();
  }

  function syncCollapse(): void {
    if (mobileViewport.matches) {
      document.documentElement.classList.remove('sidebar-collapsed');
      closeMobileDrawer();
      return;
    }

    document.documentElement.classList.remove('mobile-sidebar-open');
    let collapsed = true;
    try {
      collapsed = localStorage.getItem(STORAGE) !== 'false';
    } catch {}
    document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
    updateControls();
  }

  function toggleDrawer(): void {
    if (mobileViewport.matches) {
      const opening = !document.documentElement.classList.contains('mobile-sidebar-open');
      document.documentElement.classList.toggle('mobile-sidebar-open', opening);
      if (opening) {
        document.getElementById('leftSidebar')?.classList.remove('overlay-open');
        document.querySelector('.left-sidebar-overlay-backdrop')?.classList.remove('open');
        const leftButton = document.getElementById('toggleLeftSidebarBtn');
        leftButton?.classList.remove('overlay-open');
        leftButton?.setAttribute('aria-expanded', 'false');
      }
      updateControls();
      return;
    }

    const collapsed = document.documentElement.classList.toggle('sidebar-collapsed');
    try { localStorage.setItem(STORAGE, String(collapsed)); } catch {}
    updateControls();
  }

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('#toggleSidebarBtn')) {
      toggleDrawer();
      return;
    }
    if (target.closest('.right-sidebar-overlay-backdrop')) closeMobileDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileViewport.matches) closeMobileDrawer();
  });

  document.addEventListener('astro:page-load', syncCollapse);
  document.addEventListener('astro:after-swap', syncCollapse);
  mobileViewport.addEventListener('change', syncCollapse);
  syncCollapse();
}
