import type Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';
import { searchExcerpt, type SearchItem } from '../lib/searchContent';
import { blogPostPath } from '../lib/urls';

// 防止 dev 模式下视图过渡导致脚本重复执行
if (!(window as any).__searchLoaded) {
  (window as any).__searchLoaded = true;

let fuse: Fuse<SearchItem> | null = null;
let fusePromise: Promise<Fuse<SearchItem> | null> | null = null;
let results: FuseResult<SearchItem>[] = [];
let selectedIndex = -1;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let composing = false;
let searchGeneration = 0;
let loadedIndexUrl = '';

// ---- Read search data ----
async function getSearchData(url: string): Promise<SearchItem[]> {
  if (!url) return [];
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`搜索索引加载失败：${response.status}`);
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(item => item && typeof item.title === 'string' && typeof item.slug === 'string' && typeof item.content === 'string')) {
    throw new Error('搜索索引格式不正确');
  }
  return data as SearchItem[];
}

// ---- Initialize Fuse ----
async function initFuse(data: SearchItem[]): Promise<Fuse<SearchItem>> {
  const { default: FuseConstructor } = await import('fuse.js');
  return new FuseConstructor(data, {
    keys: [
      { name: 'title', weight: 0.35 },
      { name: 'description', weight: 0.2 },
      { name: 'content', weight: 0.25 },
      { name: 'dir1', weight: 0.05 },
      { name: 'dir2', weight: 0.05 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.4,
    minMatchCharLength: 1,
    includeMatches: true,
    includeScore: true,
    ignoreLocation: true,
  });
}

function ensureFuse(): Promise<Fuse<SearchItem> | null> {
  const indexUrl = getModal()?.dataset.searchIndex ?? '';
  if (indexUrl !== loadedIndexUrl) {
    loadedIndexUrl = indexUrl;
    fuse = null;
    fusePromise = null;
  }
  if (fuse) return Promise.resolve(fuse);

  if (!fusePromise) {
    fusePromise = getSearchData(indexUrl).then(initFuse)
      .then((instance) => {
        if (indexUrl !== loadedIndexUrl) return null;
        fuse = instance;
        return instance;
      })
      .catch((error) => {
        console.error('搜索模块加载失败', error);
        if (indexUrl === loadedIndexUrl) fusePromise = null;
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

  // Clear previous state
  input.value = '';
  results = [];
  selectedIndex = -1;
  composing = false;
  void performSearch('');
}

function closeModal(): void {
  searchGeneration++;
  composing = false;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
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

// ---- Build post URL from slug ----
function buildPostUrl(slug: string): string {
  return blogPostPath(slug);
}

// ---- Perform search ----
async function performSearch(query: string): Promise<void> {
  const generation = ++searchGeneration;
  const normalizedQuery = query.trim();
  results = [];
  selectedIndex = -1;
  if (!fuse) renderSearchState('loading');

  const searchEngine = await ensureFuse();
  const input = getInput();
  if (!input || input.value.trim() !== normalizedQuery || generation !== searchGeneration || !getModal()?.open) return;

  if (!searchEngine) {
    renderSearchState('error');
    return;
  }

  results = searchEngine.search(normalizedQuery, { limit: 40 });
  selectedIndex = -1;
  renderResults();
}

function renderSearchState(state: 'idle' | 'loading' | 'empty' | 'error' | 'results'): void {
  const modal = getModal();
  const status = modal?.querySelector<HTMLElement>('[data-search-status]');
  const retry = modal?.querySelector<HTMLButtonElement>('[data-search-retry]');
  const list = getResultsList();
  const messages = {
    idle: '输入标题、正文关键词或标签，查找文章。',
    loading: '正在加载搜索索引…',
    empty: '没有找到相关文章，试试其他关键词。',
    error: '搜索索引加载失败，请检查网络后重试。',
    results: `找到 ${results.length} 条结果`,
  };
  if (status) status.textContent = messages[state];
  if (retry) retry.hidden = state !== 'error';
  if (modal) modal.dataset.searchState = state;
  list?.setAttribute('aria-busy', String(state === 'loading'));
  if (state !== 'results') {
    if (list) list.innerHTML = '';
    getInput()?.removeAttribute('aria-activedescendant');
  }
}

// ---- Render results ----
function renderResults(): void {
  const list = getResultsList();
  if (!list) return;

  const input = getInput();
  const hasQuery = input && input.value.trim().length > 0;

  if (!hasQuery) {
    renderSearchState('idle');
    return;
  }

  if (results.length === 0) {
    renderSearchState('empty');
  } else {
    renderSearchState('results');
    list.innerHTML = results
      .map((r, i) => {
        const item = r.item;
        const matches = r.matches || [];

        const titleMatch = matches.find(m => m.key === 'title');
        const descMatch = matches.find(m => m.key === 'description');
        const dir1Match = matches.find(m => m.key === 'dir1');
        const dir2Match = matches.find(m => m.key === 'dir2');
        const contentMatch = matches.find(m => m.key === 'content');

        const titleHtml = highlightMatches(item.title, titleMatch?.indices);
        const query = input?.value.trim() ?? '';
        const excerpt = contentMatch ? searchExcerpt(item.content, contentMatch.indices, 180, query) : searchExcerpt(item.description, descMatch?.indices, 180, query);
        const descHtml = highlightMatches(excerpt.text, excerpt.indices);

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
  if (composing || e.isComposing || e.keyCode === 229) return;
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      updateSelection(Math.min(selectedIndex + 1, results.length - 1));
      scrollSelectedIntoView();
      break;
    case 'ArrowUp':
      e.preventDefault();
      updateSelection(results.length ? Math.max(selectedIndex - 1, 0) : -1);
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

function updateSelection(nextIndex: number): void {
  const list = getResultsList();
  const previous = list?.querySelector<HTMLElement>(`#search-result-${selectedIndex}`);
  previous?.classList.remove('selected');
  previous?.setAttribute('aria-selected', 'false');
  selectedIndex = nextIndex;
  const next = list?.querySelector<HTMLElement>(`#search-result-${selectedIndex}`);
  next?.classList.add('selected');
  next?.setAttribute('aria-selected', 'true');
  if (next) getInput()?.setAttribute('aria-activedescendant', next.id);
  else getInput()?.removeAttribute('aria-activedescendant');
}

function scrollSelectedIntoView(): void {
  const selected = document.querySelector('.search-result-item.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'nearest' });
  }
}

// ---- Global keyboard shortcut ----
function handleGlobalKeydown(e: KeyboardEvent): void {
  if (e.isComposing || composing) return;
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
  updateSelection(-1);
  searchGeneration++;
  results = [];
  if (getResultsList()) getResultsList()!.innerHTML = '';
  if (composing || (e as InputEvent).isComposing) return;
  debounceTimer = setTimeout(() => {
    void performSearch((e.target as HTMLInputElement).value);
  }, 150);
}

function handleCompositionStart(): void {
  composing = true;
  searchGeneration++;
  if (debounceTimer) clearTimeout(debounceTimer);
}

function handleCompositionEnd(e: Event): void {
  composing = false;
  handleInput(e);
}

function handleCancel(e: Event): void {
  if (composing) e.preventDefault();
  else closeModal();
}

// ---- Initialization ----
function init(): void {
  // Bind modal listeners
  const modal = getModal();
  const input = getInput();
  const triggerBtn = document.getElementById('search-trigger-btn');
  const closeBtn = document.getElementById('search-close-btn');
  const retryBtn = modal?.querySelector<HTMLButtonElement>('[data-search-retry]');
  retryBtn?.removeEventListener('click', handleRetry);
  retryBtn?.addEventListener('click', handleRetry);

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
    input.removeEventListener('compositionstart', handleCompositionStart);
    input.addEventListener('compositionstart', handleCompositionStart);
    input.removeEventListener('compositionend', handleCompositionEnd);
    input.addEventListener('compositionend', handleCompositionEnd);
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
    modal.removeEventListener('cancel', handleCancel);
    modal.addEventListener('cancel', handleCancel);
  }

  // Global shortcut
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('keydown', handleGlobalKeydown);
}

function handleRetry(): void {
  getInput()?.focus({ preventScroll: true });
  void performSearch(getInput()?.value ?? '');
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
