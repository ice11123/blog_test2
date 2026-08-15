const THEMES = ['light', 'dark'] as const;
const STORAGE_KEY = 'blog-test2-theme';

const THEME_MIGRATIONS: Record<string, 'light' | 'dark'> = {
  'dark-blue': 'dark',
  'dark-green': 'dark',
  'dark-purple': 'dark',
  'light-blue': 'light',
  'light-green': 'light',
  'light-rose': 'light',
};

function getSavedTheme(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.includes(saved as (typeof THEMES)[number])) return saved;
    if (saved && THEME_MIGRATIONS[saved]) {
      const migrated = THEME_MIGRATIONS[saved];
      localStorage.setItem(STORAGE_KEY, migrated);
      return migrated;
    }
  } catch (e) {}
  return null;
}

function getSystemPreference(): string {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
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
  dropdown.querySelectorAll('[data-theme]').forEach(el => {
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

    const option = (e.target as HTMLElement).closest<HTMLElement>('[data-theme]');
    if (option && dropdown.contains(option)) {
      selectTheme(option.dataset.theme!);
      hideDropdown();
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
