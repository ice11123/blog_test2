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
    const current = htmlEl.dataset.theme === name;
    htmlEl.classList.toggle('current', current);
    htmlEl.setAttribute('aria-checked', String(current));
  });
}

function isDropdownOpen(dropdown: HTMLElement): boolean {
  return dropdown.classList.contains('open');
}

function showDropdown(instant = false) {
  const dropdown = document.getElementById('theme-dropdown');
  const button = document.getElementById('theme-switcher-btn');
  if (dropdown) {
    markCurrent(getEffectiveTheme());
    dropdown.dataset.instant = String(instant);
    dropdown.classList.add('open');
    dropdown.setAttribute('aria-hidden', 'false');
    button?.setAttribute('aria-expanded', 'true');
  }
}

function hideDropdown() {
  const dropdown = document.getElementById('theme-dropdown');
  const button = document.getElementById('theme-switcher-btn');
  if (dropdown) {
    dropdown.classList.remove('open');
    dropdown.setAttribute('aria-hidden', 'true');
    button?.setAttribute('aria-expanded', 'false');
  }
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
      const keyboardTriggered = e instanceof MouseEvent && e.detail === 0;
      if (!isDropdownOpen(dropdown)) showDropdown(keyboardTriggered);
      else hideDropdown();
      return;
    }

    if (!isDropdownOpen(dropdown)) return;

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
    hideDropdown();
    applyTheme(getEffectiveTheme());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const dropdown = document.getElementById('theme-dropdown');
    if (!dropdown || !isDropdownOpen(dropdown)) return;
    hideDropdown();
    document.getElementById('theme-switcher-btn')?.focus({ preventScroll: true });
  });
}
