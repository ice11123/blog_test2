import type Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';
import { blogPostPath } from '../lib/urls';

// 防止 dev 模式下视图过渡导致脚本重复执行
if (!(window as any).__searchLoaded) {
  (window as any).__searchLoaded = true;

interface SearchItem {
  title: string;
  description: string;
  dir1: string;
  dir2: string;
  tags: string;
  slug: string;
}

let fuse: Fuse<SearchItem> | null = null;
let fusePromise: Promise<Fuse<SearchItem> | null> | null = null;
let results: FuseResult<SearchItem>[] = [];
let selectedIndex = -1;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ---- Read search data ----
function getSearchData(): SearchItem[] {
  return (window as any).__SEARCH_DATA__ || [];
}

// ---- Initialize Fuse ----
async function initFuse(data: SearchItem[]): Promise<Fuse<SearchItem>> {
  const { default: FuseConstructor } = await import('fuse.js');
  return new FuseConstructor(data, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'dir1', weight: 0.1 },
      { name: 'dir2', weight: 0.1 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.4,
    minMatchCharLength: 1,
    includeMatches: true,
    includeScore: true,
  });
}

function ensureFuse(): Promise<Fuse<SearchItem> | null> {
  if (fuse) return Promise.resolve(fuse);

  const data = getSearchData();
  if (data.length === 0) return Promise.resolve(null);

  if (!fusePromise) {
    fusePromise = initFuse(data)
      .then((instance) => {
        fuse = instance;
        return instance;
      })
      .catch((error) => {
        console.error('搜索模块加载失败', error);
        fusePromise = null;
        return null;
      });
  }
  return fusePromise;
}

// ---- DOM refs ----
function getModal(): HTMLDialogElement | null {
  return document.getElementById('search-modal') as HTMLDialogElement | null;
}

function getInput(): HTMLInputElement | null {
  return document.getElementById('search-input') as HTMLInputElement | null;
}

function getResultsList(): HTMLUListElement | null {
  return document.getElementById('search-results') as HTMLUListElement | null;
}

// ---- Modal open/close ----
type SearchOpenSource = 'keyboard' | 'pointer';

function openModal(source: SearchOpenSource): void {
  const modal = getModal();
  const input = getInput();
  if (!modal || !input) return;

  modal.dataset.openSource = source;
  modal.showModal();
  input.setAttribute('aria-expanded', 'true');
  input.focus({ preventScroll: true });
  void ensureFuse();

  // Clear previous state
  input.value = '';
  results = [];
  selectedIndex = -1;
  renderResults();
}

function closeModal(): void {
  const modal = getModal();
  const input = getInput();
  input?.setAttribute('aria-expanded', 'false');
  input?.removeAttribute('aria-activedescendant');
  if (modal) modal.close();
}

// ---- Escape HTML ----
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Highlight matches ----
function highlightMatches(value: string, indices?: readonly [number, number][]): string {
  if (!indices || indices.length === 0) return escapeHtml(value);

  let result = '';
  let lastEnd = 0;
  for (const [start, end] of indices) {
    result += escapeHtml(value.slice(lastEnd, start));
    result += '<mark class="search-highlight">' + escapeHtml(value.slice(start, end + 1)) + '</mark>';
    lastEnd = end + 1;
  }
  result += escapeHtml(value.slice(lastEnd));
  return result;
}

// ---- Truncate text ----
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

// ---- Build post URL from slug ----
function buildPostUrl(slug: string): string {
  return blogPostPath(slug);
}

// ---- Perform search ----
async function performSearch(query: string): Promise<void> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    results = [];
    selectedIndex = -1;
    renderResults();
    return;
  }

  const searchEngine = await ensureFuse();
  const input = getInput();
  if (!input || input.value.trim() !== normalizedQuery) return;

  if (!searchEngine) {
    const list = getResultsList();
    if (list) list.innerHTML = '<li class="search-no-results">搜索功能加载失败，请稍后重试</li>';
    return;
  }

  results = searchEngine.search(normalizedQuery);
  selectedIndex = -1;
  renderResults();
}

// ---- Render results ----
function renderResults(): void {
  const list = getResultsList();
  if (!list) return;

  const input = getInput();
  const hasQuery = input && input.value.trim().length > 0;

  if (!hasQuery) {
    list.innerHTML = '';
    input?.removeAttribute('aria-activedescendant');
    return;
  }

  if (results.length === 0) {
    list.innerHTML = '<li class="search-no-results">没有找到相关文章</li>';
  } else {
    list.innerHTML = results
      .map((r, i) => {
        const item = r.item;
        const matches = r.matches || [];

        const titleMatch = matches.find(m => m.key === 'title');
        const descMatch = matches.find(m => m.key === 'description');
        const dir1Match = matches.find(m => m.key === 'dir1');
        const dir2Match = matches.find(m => m.key === 'dir2');

        const titleHtml = highlightMatches(item.title, titleMatch?.indices);
        const descHtml = highlightMatches(truncate(item.description, 200), descMatch?.indices);

        const categoryParts: string[] = [];
        if (item.dir1) categoryParts.push(highlightMatches(item.dir1, dir1Match?.indices));
        if (item.dir2) categoryParts.push(highlightMatches(item.dir2, dir2Match?.indices));
        const categoryHtml = categoryParts.join(' / ');

        const cls = i === selectedIndex ? 'search-result-item selected' : 'search-result-item';
        return `
        <li id="search-result-${i}" class="${cls}" data-index="${i}" role="option" aria-selected="${i === selectedIndex}">
          <a href="${buildPostUrl(item.slug)}" class="search-result-link" data-index="${i}">
            <span class="search-result-title">${titleHtml}</span>
            ${categoryHtml ? `<span class="search-result-category">${categoryHtml}</span>` : ''}
            <span class="search-result-desc">${descHtml}</span>
          </a>
        </li>`;
      })
      .join('');
  }

  if (selectedIndex >= 0 && results[selectedIndex]) {
    input?.setAttribute('aria-activedescendant', `search-result-${selectedIndex}`);
  } else {
    input?.removeAttribute('aria-activedescendant');
  }
}

// ---- Keyboard navigation ----
function handleKeydown(e: KeyboardEvent): void {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
      renderResults();
      scrollSelectedIntoView();
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      renderResults();
      scrollSelectedIntoView();
      break;
    case 'Enter':
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        const item = results[selectedIndex].item;
        closeModal();
        window.location.href = buildPostUrl(item.slug);
      }
      break;
    case 'Escape':
      e.preventDefault();
      closeModal();
      break;
  }
}

function scrollSelectedIntoView(): void {
  const selected = document.querySelector('.search-result-item.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'nearest' });
  }
}

// ---- Global keyboard shortcut ----
function handleGlobalKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openModal('keyboard');
  }
}

function handleTriggerClick(): void {
  openModal('pointer');
}

// ---- Debounced input ----
function handleInput(e: Event): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void performSearch((e.target as HTMLInputElement).value);
  }, 150);
}

// ---- Initialization ----
function init(): void {
  const data = getSearchData();
  if (data.length === 0) return;

  // Bind modal listeners
  const modal = getModal();
  const input = getInput();
  const triggerBtn = document.getElementById('search-trigger-btn');
  const closeBtn = document.getElementById('search-close-btn');

  // Search trigger button
  if (triggerBtn) {
    triggerBtn.removeEventListener('click', handleTriggerClick);
    triggerBtn.addEventListener('click', handleTriggerClick);
  }

  // Input
  if (input) {
    input.removeEventListener('input', handleInput);
    input.addEventListener('input', handleInput);
    input.removeEventListener('keydown', handleKeydown);
    input.addEventListener('keydown', handleKeydown);
  }

  // Close button
  if (closeBtn) {
    closeBtn.removeEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
  }

  // Click on modal backdrop to close
  if (modal) {
    modal.removeEventListener('click', handleModalBackdropClick);
    modal.addEventListener('click', handleModalBackdropClick);
  }

  // Global shortcut
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('keydown', handleGlobalKeydown);
}

function handleModalBackdropClick(e: MouseEvent): void {
  const modal = getModal();
  if (!modal) return;
  // Close if clicking the backdrop, not the content inside
  if (e.target === modal) {
    closeModal();
  }
}

// Close modal on SPA navigation
document.addEventListener('astro:before-swap', () => {
  closeModal();
});

// Initialize on page load (follows toc.ts pattern)
document.addEventListener('astro:page-load', init);
document.addEventListener('DOMContentLoaded', init);

}
