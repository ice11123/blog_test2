import { matchesTagFilter } from '../lib/persistentSidebar';

const TAB_SELECTOR = '[data-sidebar-tab]';

function activateTab(root: HTMLElement, button: HTMLButtonElement, focus = false, animate = false) {
  const name = button.dataset.sidebarTab;
  if (!name) return;

  root.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR).forEach((tab) => {
    const active = tab === button;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  root.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach((panel) => {
    const wasHidden = panel.hidden;
    panel.getAnimations().forEach(animation => animation.cancel());
    panel.hidden = panel.id !== `sidebar-panel-${name}`;
    if (animate && wasHidden && !panel.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const animation = panel.animate([
        { opacity: .65, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 160, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      animation.onfinish = () => animation.cancel();
    }
  });

  if (focus) button.focus();
}

function initPersistentSidebars() {
  document.querySelectorAll<HTMLElement>('[data-persistent-sidebar]').forEach((root) => {
    if (root.dataset.sidebarBound === 'true') return;
    root.dataset.sidebarBound = 'true';

    const filter = root.querySelector<HTMLInputElement>('[data-tag-filter]');
    const tags = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-tag-name]'));
    const count = root.querySelector<HTMLElement>('[data-tag-count]');
    filter?.addEventListener('input', () => {
      let visible = 0;
      for (const tag of tags) {
        tag.hidden = !matchesTagFilter(tag.dataset.tagName ?? '', filter.value);
        if (!tag.hidden) visible++;
      }
      if (count) count.textContent = visible ? `${visible} / ${tags.length} 个标签` : '没有匹配的标签';
    });

    root.addEventListener('click', (event) => {
      if (event.detail > 0) root.dataset.keyboardNav = 'false';
      const button = (event.target as Element).closest<HTMLButtonElement>(TAB_SELECTOR);
      if (button && root.contains(button)) activateTab(root, button, false, event.detail > 0);
    });

    root.addEventListener('keydown', (event) => {
      root.dataset.keyboardNav = 'true';
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
