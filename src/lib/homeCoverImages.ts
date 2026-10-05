export function createHomeCoverImages({ root, heroImage, heroSource, fullImage, getMotionState, onGeometryInvalidated }: {
  root: HTMLElement; heroImage: HTMLImageElement; heroSource: HTMLSourceElement; fullImage: HTMLImageElement;
  getMotionState: () => { expanded: boolean; wantsExpanded: boolean };
  onGeometryInvalidated: () => void;
}) {
  let disposed = false;
  let highResolutionRequested = false;
  let highResolutionLoader: HTMLImageElement | undefined;
  let pendingHighResolutionSource = '';
  let activeHeroTheme: 'light' | 'dark' | undefined;

  const commitHighResolution = () => {
    if (disposed || !pendingHighResolutionSource || !getMotionState().expanded) return;
    fullImage.removeAttribute('srcset');
    fullImage.src = pendingHighResolutionSource;
    pendingHighResolutionSource = '';
  };
  const cancelHighResolutionRequest = () => {
    const loader = highResolutionLoader;
    highResolutionLoader = undefined;
    pendingHighResolutionSource = '';
    loader?.removeAttribute('srcset');
    loader?.removeAttribute('src');
  };
  const requestHighResolution = () => {
    if (disposed || highResolutionRequested) return;
    const src = fullImage.dataset.fullSrc;
    if (!src) return;
    highResolutionRequested = true;
    const loader = new Image();
    highResolutionLoader = loader;
    loader.decoding = 'async';
    if (fullImage.dataset.fullSrcset) loader.srcset = fullImage.dataset.fullSrcset;
    loader.sizes = fullImage.dataset.fullSizes || '100vw';
    loader.src = src;
    void loader.decode().then(() => {
      // 旧主题、收回和页面卸载都会撤销此 loader 的写入资格。
      if (disposed || highResolutionLoader !== loader || !document.contains(fullImage)) return;
      pendingHighResolutionSource = loader.currentSrc || src;
      commitHighResolution();
    }).catch(() => {
      if (!disposed && highResolutionLoader === loader) {
        highResolutionRequested = false;
        highResolutionLoader = undefined;
      }
    });
  };
  const reuseDecodedHero = () => {
    const src = heroImage.currentSrc || heroImage.src;
    if (disposed || !src) return;
    fullImage.removeAttribute('srcset');
    fullImage.src = src;
  };
  const releaseHighResolution = () => {
    cancelHighResolutionRequest();
    highResolutionRequested = false;
    reuseDecodedHero();
  };
  const syncHeroTheme = () => {
    const theme = root.dataset.theme === 'dark' ? 'dark' : 'light';
    if (disposed || theme === activeHeroTheme) return;
    const sourceSrcset = heroSource.getAttribute(`data-${theme}-srcset`);
    const sourceType = heroSource.getAttribute(`data-${theme}-type`);
    const heroSrcset = heroImage.getAttribute(`data-${theme}-srcset`);
    const heroSrc = heroImage.getAttribute(`data-${theme}-src`);
    const lqip = fullImage.getAttribute(`data-${theme}-lqip`);
    const fullSrc = fullImage.getAttribute(`data-${theme}-full-src`);
    const fullSrcset = fullImage.getAttribute(`data-${theme}-full-srcset`);
    if (!sourceType || !sourceSrcset || !heroSrcset || !heroSrc || !lqip || !fullSrc || !fullSrcset) return;
    activeHeroTheme = theme;
    cancelHighResolutionRequest();
    highResolutionRequested = false;
    heroSource.type = sourceType;
    heroSource.srcset = sourceSrcset;
    heroImage.srcset = heroSrcset;
    heroImage.src = heroSrc;
    fullImage.removeAttribute('srcset');
    fullImage.src = lqip;
    fullImage.dataset.fullSrc = fullSrc;
    fullImage.dataset.fullSrcset = fullSrcset;
    onGeometryInvalidated();
    if (getMotionState().wantsExpanded) requestHighResolution();
  };
  const handleHeroLoad = () => {
    if (disposed) return;
    onGeometryInvalidated();
    if (!highResolutionRequested) reuseDecodedHero();
  };
  const themeObserver = new MutationObserver(syncHeroTheme);
  return {
    mount() {
      heroImage.addEventListener('load', handleHeroLoad);
      themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
      syncHeroTheme();
      if (heroImage.complete) handleHeroLoad();
    },
    enterExpanded() { requestHighResolution(); commitHighResolution(); },
    releaseToPreview: releaseHighResolution,
    dispose() {
      disposed = true;
      cancelHighResolutionRequest();
      heroImage.removeEventListener('load', handleHeroLoad);
      themeObserver.disconnect();
    },
  };
}
