import { selectDiscoveryTags, TAG_BATCH_SIZE, type DiscoveryTag } from '../lib/tagDiscovery';

let cleanup: (() => void) | undefined;

function initTagDiscovery() {
  cleanup?.();
  const root = document.querySelector<HTMLElement>('[data-tag-discovery]');
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>('[data-discovery-search]');
  if (!input) return;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  cleanup = () => controller.abort();
  const tags = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-discovery-tag]'));
  const entries: DiscoveryTag[] = tags.map((tag) => ({ name: tag.dataset.tagName ?? '', count: 0 }));
  const more = root.querySelector<HTMLDetailsElement>('[data-more-group]');
  const common = root.querySelector<HTMLElement>('[data-common-group]');
  const moreTags = more ? tags.filter((tag) => more.contains(tag)) : [];
  const moreNames = new Set(moreTags.map((tag) => tag.dataset.tagName ?? ''));
  const moreEntries = entries.filter((tag) => moreNames.has(tag.name));
  const clear = root.querySelector<HTMLButtonElement>('[data-discovery-clear]');
  const next = root.querySelector<HTMLButtonElement>('[data-discovery-more]');
  const all = root.querySelector<HTMLAnchorElement>('[data-discovery-all]');
  const status = root.querySelector<HTMLElement>('[data-discovery-status]');
  const empty = root.querySelector<HTMLElement>('[data-discovery-empty]');
  let limit = TAG_BATCH_SIZE;
  let composing = false;
  let searching = false;
  let previousOpen = more?.open ?? false;

  function render() {
    const query = input!.value.trim();
    if (query && !searching) previousOpen = more?.open ?? false;
    if (!query && searching && more) more.open = previousOpen;
    searching = Boolean(query);
    const matches = selectDiscoveryTags(entries, query);
    const matchedNames = new Set(matches.map((tag) => tag.name));
    const visibleMore = new Set(selectDiscoveryTags(moreEntries, query, limit).map((tag) => tag.name));
    for (const tag of tags) {
      const name = tag.dataset.tagName ?? '';
      tag.hidden = !matchedNames.has(name) || (moreNames.has(name) && !visibleMore.has(name));
    }
    if (common) common.hidden = !tags.some((tag) => common.contains(tag) && !tag.hidden);
    if (more) {
      more.hidden = visibleMore.size === 0;
      if (query && visibleMore.size > 0) more.open = true;
    }
    if (clear) clear.hidden = !input!.value;
    if (empty) empty.hidden = matches.length > 0;
    if (next) {
      next.hidden = Boolean(query) || limit >= moreTags.length;
      next.textContent = `继续展开 ${Math.min(TAG_BATCH_SIZE, Math.max(0, moreTags.length - limit))} 个 · 还剩 ${Math.max(0, moreTags.length - limit)} 个`;
    }
    if (status) status.textContent = query ? `找到 ${matches.length} / ${tags.length} 个标签` : `共 ${tags.length} 个标签 · 按文章篇数排列`;
  }

  root.querySelector<HTMLElement>('[data-search-controls]')?.removeAttribute('hidden');
  input.addEventListener('compositionstart', () => { composing = true; }, options);
  input.addEventListener('compositionend', () => { composing = false; render(); }, options);
  input.addEventListener('input', () => { if (!composing) render(); }, options);
  clear?.addEventListener('click', () => { input.value = ''; composing = false; render(); input.focus(); }, options);
  next?.addEventListener('click', (event) => {
    const firstNew = moreTags[limit];
    limit += TAG_BATCH_SIZE;
    render();
    if (event.detail === 0 || next?.hidden) firstNew?.focus({ preventScroll: true });
  }, options);
  all?.addEventListener('click', (event) => {
    event.preventDefault();
    input.value = '';
    limit = moreTags.length;
    render();
    if (more) more.open = true;
    // 键盘用户直接进入新内容；指针用户保留阅读位置。
    if (event.detail === 0) (moreTags[0] ?? tags[0])?.focus();
  }, options);
  render();
}

document.addEventListener('astro:page-load', initTagDiscovery);
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
if (document.readyState !== 'loading') initTagDiscovery();
else document.addEventListener('DOMContentLoaded', initTagDiscovery, { once: true });
