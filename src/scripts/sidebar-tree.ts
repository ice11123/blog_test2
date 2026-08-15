import { stripBase } from '../lib/urls';

// 防止 dev 模式下视图过渡导致脚本重复执行
if (!(window as any).__sidebarTreeLoaded) {
  (window as any).__sidebarTreeLoaded = true;

const STORAGE_KEY = 'blog-test2-left-sidebar-state';

interface State {
  mode: 'directory' | 'tag';
  expandedPaths: string[];
  collapsed: boolean;
  scrollTop: number;
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { mode: 'directory', expandedPaths: [], collapsed: false, scrollTop: 0 };
}

const state = loadState();

/* ===== 滚动位置记忆 ===== */
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

function saveScrollPosition(): void {
  const container = document.querySelector<HTMLElement>('.left-sidebar .sidebar-inner');
  if (!container) return;
  state.scrollTop = container.scrollTop;
  saveState(state);
}

function restoreScrollPosition(): void {
  const container = document.querySelector<HTMLElement>('.left-sidebar .sidebar-inner');
  if (!container || state.scrollTop <= 0) return;
  container.scrollTop = state.scrollTop;
}

function bindScrollListener(): void {
  const container = document.querySelector<HTMLElement>('.left-sidebar .sidebar-inner');
  if (!container) return;
  container.removeEventListener('scroll', onSidebarScroll);
  container.addEventListener('scroll', onSidebarScroll, { passive: true });
}

function onSidebarScroll(): void {
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(saveScrollPosition, 200);
}

function isInViewport(container: HTMLElement, el: HTMLElement): boolean {
  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  return eRect.top >= cRect.top && eRect.bottom <= cRect.bottom;
}

function saveState(state: State): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function getSlugFromPath(path: string): string | null {
  const m = stripBase(path).match(/^\/blog\/(.+)/);
  if (!m) return null;
  const slug = decodeURIComponent(m[1].replace(/\/+$/, ''));
  if (slug === 'tags' || slug.startsWith('tag/') || slug.startsWith('category/')) return null;
  return slug;
}

function findArticleBySlug(slug: string): HTMLElement | null {
  const visibleTree = document.querySelector('.ls-tree:not([hidden])');
  if (!visibleTree) return null;
  const links = visibleTree.querySelectorAll<HTMLElement>('a[data-slug]');
  for (const link of links) {
    if (link.dataset.slug === slug) return link;
  }
  return null;
}

function isMobile(): boolean {
  return window.innerWidth < 900;
}

function updateIndicator(): void {
  const container = document.querySelector<HTMLElement>('.left-sidebar .sidebar-inner');
  if (!container) return;

  const path = window.location.pathname;
  const slug = getSlugFromPath(path);

  if (slug) {
    const target = findArticleBySlug(slug);
    if (target) {
      expandAncestors(target);
      if (!isMobile() && !isInViewport(container, target)) {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }
}

function expandAncestors(el: HTMLElement): void {
  let cur: HTMLElement | null = el.parentElement;
  while (cur) {
    if (cur.classList.contains('node-children') && cur.classList.contains('collapsed')) {
      cur.classList.remove('collapsed');
      const header = cur.previousElementSibling as HTMLElement | null;
      if (header && header.classList.contains('node-header')) {
        header.classList.add('expanded');
        const label = header.querySelector('.node-label')?.textContent?.trim();
        if (label && !state.expandedPaths.includes(label)) {
          state.expandedPaths.push(label);
        }
      }
    }
    if (cur.classList.contains('sidebar-inner')) break;
    cur = cur.parentElement;
  }
  saveState(state);
}

function switchMode(mode: 'directory' | 'tag'): void {
  state.mode = mode;
  saveState(state);

  const dirTree = document.getElementById('ls-tree-dir');
  const tagTree = document.getElementById('ls-tree-tag');
  const dirBtn = document.getElementById('ls-mode-dir');
  const tagBtn = document.getElementById('ls-mode-tag');
  const toggleBar = document.querySelector('.ls-mode-toggle');

  if (mode === 'directory') {
    dirTree?.removeAttribute('hidden');
    tagTree?.setAttribute('hidden', '');
    dirBtn?.classList.add('active');
    tagBtn?.classList.remove('active');
    toggleBar?.classList.remove('tag-mode');
  } else {
    dirTree?.setAttribute('hidden', '');
    tagTree?.removeAttribute('hidden');
    dirBtn?.classList.remove('active');
    tagBtn?.classList.add('active');
    toggleBar?.classList.add('tag-mode');
  }

  requestAnimationFrame(() => updateIndicator());
}

function toggleNode(header: HTMLElement): void {
  const children = header.nextElementSibling as HTMLElement | null;
  if (!children || !children.classList.contains('node-children')) return;

  const isCollapsed = children.classList.contains('collapsed');
  if (isCollapsed) {
    children.classList.remove('collapsed');
    header.classList.add('expanded');
  } else {
    children.classList.add('collapsed');
    header.classList.remove('expanded');
  }

  const label = header.querySelector('.node-label')?.textContent?.trim();
  if (label) {
    if (isCollapsed) {
      if (!state.expandedPaths.includes(label)) state.expandedPaths.push(label);
    } else {
      state.expandedPaths = state.expandedPaths.filter(p => p !== label);
    }
    saveState(state);
  }
}

function applyExpandedState(): void {
  document.querySelectorAll('.ls-tree .node-header').forEach(header => {
    const label = header.querySelector('.node-label')?.textContent?.trim();
    if (label && state.expandedPaths.includes(label)) {
      header.classList.add('expanded');
      const children = header.nextElementSibling as HTMLElement | null;
      if (children && children.classList.contains('node-children')) {
        children.classList.remove('collapsed');
      }
    }
  });
}

function closeMobileOverlay(): void {
  if (window.innerWidth >= 900) return;
  const sidebar = document.getElementById('leftSidebar');
  const backdrop = document.querySelector('.left-sidebar-overlay-backdrop');
  const btn = document.getElementById('toggleLeftSidebarBtn');
  if (sidebar) sidebar.classList.remove('overlay-open');
  if (backdrop) backdrop.classList.remove('open');
  if (btn) btn.classList.remove('overlay-open');
}

function handleSidebarToggleClick(): void {
  if (window.innerWidth < 900) {
    const sidebar = document.getElementById('leftSidebar');
    const backdrop = document.querySelector('.left-sidebar-overlay-backdrop');
    const btn = document.getElementById('toggleLeftSidebarBtn');
    if (!sidebar || !backdrop) return;
    const isOpen = sidebar.classList.contains('overlay-open');
    if (isOpen) {
      sidebar.classList.remove('overlay-open');
      backdrop.classList.remove('open');
      if (btn) btn.classList.remove('overlay-open');
    } else {
      sidebar.classList.add('overlay-open');
      backdrop.classList.add('open');
      if (btn) btn.classList.add('overlay-open');
    }
  } else {
    // 桌面端左栏常驻；只有移动端使用覆盖层按钮。
    document.documentElement.classList.remove('left-sidebar-collapsed');
    state.collapsed = false;
    saveState(state);
  }
}

// 事件委托 (兼容 Astro 视图过渡)
document.addEventListener('click', (e: Event) => {
  const target = e.target as HTMLElement;

  // 树节点展开/折叠
  const header = target.closest('.ls-tree .node-header');
  if (header) {
    e.preventDefault();
    toggleNode(header as HTMLElement);
    return;
  }

  // 模式切换按钮
  const modeBtn = target.closest('#ls-mode-dir, #ls-mode-tag');
  if (modeBtn) {
    const mode = (modeBtn as HTMLElement).dataset.mode as 'directory' | 'tag';
    if (mode) switchMode(mode);
    return;
  }

  // 左侧栏内文章链接 — 移动端点击后关闭覆盖层
  const articleLink = target.closest('.ls-tree a[data-slug]');
  if (articleLink) {
    closeMobileOverlay();
    return;
  }

  // 左侧栏切换按钮
  if (target.closest('#toggleLeftSidebarBtn')) {
    handleSidebarToggleClick();
    return;
  }
});

function init(): void {
  // 视图过渡后重新读取，确保状态正确
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      state.collapsed = saved.collapsed;
      state.mode = saved.mode || 'directory';
    }
  } catch {}

  if (state.mode === 'tag') {
    switchMode('tag');
  }

  applyExpandedState();
  bindScrollListener();

  // 桌面端左栏始终常驻；移动端可通过 overlay-open 临时打开。
  state.collapsed = false;
  document.documentElement.classList.remove('left-sidebar-collapsed');

  requestAnimationFrame(() => {
    restoreScrollPosition();
    updateIndicator();
  });
}

// 生命周期
document.addEventListener('astro:page-load', () => {
  init();
  updateIndicator();
});

document.addEventListener('astro:after-swap', () => {
  // 桌面端左栏常驻，视图切换后清理旧折叠类。
  document.documentElement.classList.remove('left-sidebar-collapsed');

  requestAnimationFrame(() => {
    restoreScrollPosition();
    updateIndicator();
  });
});

document.addEventListener('DOMContentLoaded', init);

}
