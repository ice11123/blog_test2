const THEMES = ['dark-blue', 'dark-green', 'dark-purple', 'light-blue', 'light-green', 'light-rose'];
const STORAGE_KEY = 'blog-test2-theme';

function getSavedTheme(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.includes(saved)) return saved;
  } catch (e) {}
  return null;
}

function getSystemPreference(): string {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light-blue' : 'dark-blue';
}

function getEffectiveTheme(): string {
  return getSavedTheme() || getSystemPreference();
}

function applyTheme(name: string) {
  document.documentElement.setAttribute('data-theme', name);
  markCurrent(name);
}

function markCurrent(name: string) {
  const dropdown = document.getElementById('theme-dropdown');
  if (!dropdown) return;
  dropdown.querySelectorAll('div[data-theme]').forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.classList.toggle('current', htmlEl.dataset.theme === name);
  });
}

function showDropdown() {
  const dropdown = document.getElementById('theme-dropdown');
  if (dropdown) {
    markCurrent(getEffectiveTheme());
    dropdown.hidden = false;
  }
}

function hideDropdown() {
  const dropdown = document.getElementById('theme-dropdown');
  if (dropdown) dropdown.hidden = true;
}

function selectTheme(name: string) {
  try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
  applyTheme(name);
}

// 防止视图过渡导致重复绑定
if (!(window as any).__themeScriptLoaded) {
  (window as any).__themeScriptLoaded = true;

  document.addEventListener('click', (e) => {
    const btn = document.getElementById('theme-switcher-btn');
    const dropdown = document.getElementById('theme-dropdown');
    if (!btn || !dropdown) return;

    if (btn.contains(e.target as Node)) {
      if (dropdown.hidden) showDropdown();
      else hideDropdown();
      return;
    }

    if (dropdown.hidden) return;

    const option = (e.target as HTMLElement).closest<HTMLElement>('div[data-theme]');
    if (option && dropdown.contains(option)) {
      selectTheme(option.dataset.theme!);
      return;
    }

    if (!dropdown.contains(e.target as Node)) {
      hideDropdown();
    }
  });

  applyTheme(getEffectiveTheme());

  document.addEventListener('astro:page-load', () => {
    applyTheme(getEffectiveTheme());
  });
}
