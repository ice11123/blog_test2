const THEMES = ['light', 'dark'] as const;
const STORAGE_KEY = 'blog-test2-theme';
const TRANSITION_WATCHDOG_MS = 700;

type ThemeName = (typeof THEMES)[number];

interface ThemeWindow extends Window {
  __themeScriptLoaded?: boolean;
}

const THEME_MIGRATIONS: Record<string, ThemeName> = {
  'dark-blue': 'dark',
  'dark-green': 'dark',
  'dark-purple': 'dark',
  'light-blue': 'light',
  'light-green': 'light',
  'light-rose': 'light',
};

let activeTransition: ViewTransition | null = null;
let activeTransitionTimer: number | null = null;
let requestedTheme: ThemeName | null = null;

function isThemeName(value: string | null): value is ThemeName {
  return value !== null && THEMES.includes(value as ThemeName);
}

function getSavedTheme(): ThemeName | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isThemeName(saved)) return saved;
    if (saved && THEME_MIGRATIONS[saved]) {
      const migrated = THEME_MIGRATIONS[saved];
      localStorage.setItem(STORAGE_KEY, migrated);
      return migrated;
    }
  } catch (_) {
    // 隐私模式或禁用存储时仍允许本次会话切换主题。
  }
  return null;
}

function getSystemPreference(): ThemeName {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getEffectiveTheme(): ThemeName {
  const current = document.documentElement.getAttribute('data-theme');
  if (isThemeName(current)) return current;
  return getSavedTheme() || getSystemPreference();
}

function syncThemeButton(name: ThemeName) {
  const button = document.getElementById('theme-switcher-btn');
  if (!button) return;
  const targetLabel = name === 'light' ? '切换到深色主题' : '切换到浅色主题';
  button.setAttribute('aria-label', targetLabel);
  button.setAttribute('title', targetLabel);
  button.setAttribute('aria-pressed', String(name === 'dark'));
}

function applyTheme(name: ThemeName) {
  document.documentElement.setAttribute('data-theme', name);
  syncThemeButton(name);
}

function selectTheme(name: ThemeName) {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch (_) {
    // 存储失败不应阻止当前页面完成切换。
  }
  applyTheme(name);
}

function clearTransitionState() {
  const root = document.documentElement;
  root.removeAttribute('data-theme-transition');
  root.style.removeProperty('--theme-transition-x');
  root.style.removeProperty('--theme-transition-y');
  root.style.removeProperty('--theme-transition-radius');
}

function stopActiveTransition() {
  if (activeTransitionTimer !== null) {
    window.clearTimeout(activeTransitionTimer);
    activeTransitionTimer = null;
  }
  activeTransition?.skipTransition();
  activeTransition = null;
  clearTransitionState();
}

function setTransitionGeometry(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const farthestX = Math.max(x, window.innerWidth - x);
  const farthestY = Math.max(y, window.innerHeight - y);
  const radius = Math.hypot(farthestX, farthestY);
  const root = document.documentElement;
  root.style.setProperty('--theme-transition-x', `${x}px`);
  root.style.setProperty('--theme-transition-y', `${y}px`);
  root.style.setProperty('--theme-transition-radius', `${radius}px`);
}

function switchTheme(button: HTMLElement, pointerTriggered: boolean) {
  const current = requestedTheme ?? getEffectiveTheme();
  const next: ThemeName = current === 'light' ? 'dark' : 'light';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!pointerTriggered || reduceMotion || typeof document.startViewTransition !== 'function') {
    stopActiveTransition();
    requestedTheme = null;
    selectTheme(next);
    return;
  }

  stopActiveTransition();
  requestedTheme = next;
  setTransitionGeometry(button);
  document.documentElement.setAttribute('data-theme-transition', next === 'dark' ? 'expand' : 'contract');

  try {
    const transition = document.startViewTransition(() => selectTheme(requestedTheme ?? next));
    activeTransition = transition;
    // skipTransition() 会拒绝 ready；显式吸收预期中的 AbortError，避免快速切换污染控制台。
    void transition.ready.catch(() => {});
    void transition.updateCallbackDone.catch(() => {});
    activeTransitionTimer = window.setTimeout(() => {
      if (activeTransition !== transition) return;
      transition.skipTransition();
      selectTheme(requestedTheme ?? next);
      activeTransition = null;
      activeTransitionTimer = null;
      requestedTheme = null;
      clearTransitionState();
    }, TRANSITION_WATCHDOG_MS);
    const finishTransition = () => {
      if (activeTransition !== transition) return;
      if (activeTransitionTimer !== null) window.clearTimeout(activeTransitionTimer);
      activeTransition = null;
      activeTransitionTimer = null;
      requestedTheme = null;
      clearTransitionState();
    };
    void transition.finished.then(finishTransition, finishTransition);
  } catch (_) {
    stopActiveTransition();
    requestedTheme = null;
    selectTheme(next);
  }
}

const themeWindow = window as ThemeWindow;
if (!themeWindow.__themeScriptLoaded) {
  themeWindow.__themeScriptLoaded = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLElement>('#theme-switcher-btn');
    if (!button) return;
    const pointerTriggered = event instanceof MouseEvent && event.detail > 0;
    switchTheme(button, pointerTriggered);
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || !isThemeName(event.newValue)) return;
    stopActiveTransition();
    requestedTheme = null;
    applyTheme(event.newValue);
  });

  applyTheme(getEffectiveTheme());

  document.addEventListener('astro:page-load', () => {
    stopActiveTransition();
    requestedTheme = null;
    applyTheme(getEffectiveTheme());
  });
}
