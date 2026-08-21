const HERO_SELECTOR = '[data-home-hero-photo]';
const BASE_SCALE = 1.025;
const MAX_SCALE = 1.075;
const SCROLL_RANGE = 520;

let cleanupCurrentHero: (() => void) | undefined;

function initHomeHeroMotion() {
  cleanupCurrentHero?.();
  cleanupCurrentHero = undefined;

  const heroPhoto = document.querySelector<HTMLElement>(HERO_SELECTOR);
  if (!heroPhoto) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameId = 0;

  const render = () => {
    frameId = 0;
    if (reduceMotion.matches) {
      heroPhoto.style.transform = `scale(${BASE_SCALE})`;
      return;
    }

    const progress = Math.min(Math.max(window.scrollY / SCROLL_RANGE, 0), 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const scale = BASE_SCALE + (MAX_SCALE - BASE_SCALE) * easedProgress;
    heroPhoto.style.transform = `scale(${scale.toFixed(4)})`;
  };

  const requestRender = () => {
    if (frameId) return;
    frameId = window.requestAnimationFrame(render);
  };

  const handleMotionPreference = () => requestRender();

  render();
  window.addEventListener('scroll', requestRender, { passive: true });
  reduceMotion.addEventListener('change', handleMotionPreference);

  cleanupCurrentHero = () => {
    window.removeEventListener('scroll', requestRender);
    reduceMotion.removeEventListener('change', handleMotionPreference);
    if (frameId) window.cancelAnimationFrame(frameId);
  };
}

initHomeHeroMotion();
document.addEventListener('astro:page-load', initHomeHeroMotion);
