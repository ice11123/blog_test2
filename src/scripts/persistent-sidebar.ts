const TAB_SELECTOR = '[data-sidebar-tab]';

function activateTab(root: HTMLElement, button: HTMLButtonElement, focus = false) {
  const name = button.dataset.sidebarTab;
  if (!name) return;

  root.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR).forEach((tab) => {
    const active = tab === button;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  root.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach((panel) => {
    panel.hidden = panel.id !== `sidebar-panel-${name}`;
  });

  if (focus) button.focus();
}

function initPersistentSidebars() {
  document.querySelectorAll<HTMLElement>('[data-persistent-sidebar]').forEach((root) => {
    if (root.dataset.sidebarBound === 'true') return;
    root.dataset.sidebarBound = 'true';

    root.addEventListener('click', (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(TAB_SELECTOR);
      if (button && root.contains(button)) activateTab(root, button);
    });

    root.addEventListener('keydown', (event) => {
      const current = (event.target as Element).closest<HTMLButtonElement>(TAB_SELECTOR);
      if (!current || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

      const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR));
      const currentIndex = tabs.indexOf(current);
      let nextIndex = currentIndex;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      event.preventDefault();
      activateTab(root, tabs[nextIndex], true);
    });
  });
}

document.addEventListener('astro:page-load', initPersistentSidebars);
