const ACCORDION_SELECTOR = '[data-directory-accordion]';
const PANEL_SELECTOR = '[data-directory-panel]';
const SUMMARY_SELECTOR = 'summary';
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

interface AccordionRuntime {
  animation: Animation | null;
  targetOpen: boolean;
  revision: number;
}

const runtimes = new WeakMap<HTMLDetailsElement, AccordionRuntime>();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function getRuntime(details: HTMLDetailsElement): AccordionRuntime {
  const existing = runtimes.get(details);
  if (existing) return existing;
  const runtime = { animation: null, targetOpen: details.open, revision: 0 };
  runtimes.set(details, runtime);
  return runtime;
}

function clearPanelStyles(panel: HTMLElement) {
  panel.style.removeProperty('height');
  panel.style.removeProperty('opacity');
  panel.style.removeProperty('overflow');
}

function settleImmediately(details: HTMLDetailsElement, open: boolean) {
  const panel = details.querySelector<HTMLElement>(PANEL_SELECTOR);
  const summary = details.querySelector<HTMLElement>(SUMMARY_SELECTOR);
  const runtime = getRuntime(details);

  runtime.revision += 1;
  runtime.animation?.cancel();
  runtime.animation = null;
  runtime.targetOpen = open;
  details.open = open;
  details.dataset.state = open ? 'open' : 'closed';
  summary?.setAttribute('aria-expanded', String(open));
  if (panel) clearPanelStyles(panel);
}

function animateAccordion(details: HTMLDetailsElement, open: boolean) {
  const panel = details.querySelector<HTMLElement>(PANEL_SELECTOR);
  const inner = panel?.firstElementChild as HTMLElement | null;
  const summary = details.querySelector<HTMLElement>(SUMMARY_SELECTOR);
  if (!panel || !inner || !summary) return settleImmediately(details, open);

  const runtime = getRuntime(details);
  const revision = runtime.revision + 1;
  runtime.revision = revision;

  let currentHeight = 0;
  let currentOpacity = 0;
  if (details.open) {
    currentHeight = panel.getBoundingClientRect().height;
    currentOpacity = Number.parseFloat(getComputedStyle(panel).opacity) || 0;
    panel.style.height = `${currentHeight}px`;
    panel.style.opacity = String(currentOpacity);
  } else if (open) {
    details.open = true;
    panel.style.height = '0px';
    panel.style.opacity = '0';
  }

  runtime.animation?.cancel();
  runtime.targetOpen = open;
  details.dataset.state = open ? 'opening' : 'closing';
  summary.setAttribute('aria-expanded', String(open));

  const fullHeight = inner.scrollHeight;
  const targetHeight = open ? fullHeight : 0;
  const targetOpacity = open ? 1 : 0;
  const distanceRatio = Math.min(1, Math.abs(targetHeight - currentHeight) / Math.max(fullHeight, 1));
  const fullDuration = open ? 220 : 180;
  const duration = Math.round(Math.max(90, fullDuration * distanceRatio));

  panel.style.overflow = 'hidden';
  const animation = panel.animate(
    [
      { height: `${currentHeight}px`, opacity: currentOpacity },
      { height: `${targetHeight}px`, opacity: targetOpacity },
    ],
    { duration, easing: EASE_OUT, fill: 'forwards' },
  );
  runtime.animation = animation;

  animation.onfinish = () => {
    if (runtime.revision !== revision || runtime.targetOpen !== open) return;
    runtime.animation = null;
    animation.cancel();
    details.open = open;
    details.dataset.state = open ? 'open' : 'closed';
    clearPanelStyles(panel);
  };
}

function initializeAccordion(details: HTMLDetailsElement) {
  if (details.dataset.accordionReady === 'true') return;
  const summary = details.querySelector<HTMLElement>(SUMMARY_SELECTOR);
  if (!summary) return;

  details.dataset.accordionReady = 'true';
  settleImmediately(details, false);
  summary.addEventListener('click', (event) => {
    event.preventDefault();
    const runtime = getRuntime(details);
    const open = !runtime.targetOpen;
    if (event.detail === 0 || reduceMotion.matches) {
      settleImmediately(details, open);
      return;
    }
    animateAccordion(details, open);
  });
}

export function initializeDirectoryAccordions(root: ParentNode = document) {
  root.querySelectorAll<HTMLDetailsElement>(ACCORDION_SELECTOR).forEach(initializeAccordion);
}
