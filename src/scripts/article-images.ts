let teardownImages: (() => void) | null = null;
let viewerPromise: Promise<typeof import('./image-viewer')> | null = null;

function initArticleImages() {
  teardownImages?.();
  const prose = document.querySelector<HTMLElement>('.blog-post-page .prose');
  if (!prose) return;
  const controller = new AbortController();
  const images = Array.from(prose.querySelectorAll<HTMLImageElement>('img')).filter(image => !image.closest('a, button, summary'));
  const attributes = images.map(image => [image, image.getAttribute('tabindex'), image.getAttribute('role'), image.getAttribute('aria-label')] as const);
  const retries = new Map<HTMLImageElement, HTMLButtonElement>();
  let disposed = false;
  images.forEach(image => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `${image.alt || '正文图片'}，点击放大查看`);
    image.classList.add('article-image-zoomable');
  });

  async function open(image: HTMLImageElement) {
    if (!image.complete || !image.naturalWidth) return;
    image.setAttribute('aria-busy', 'true');
    try {
      viewerPromise ??= import('./image-viewer').catch(error => { viewerPromise = null; throw error; });
      const viewer = await viewerPromise;
      if (!disposed && image.isConnected) viewer.openImageViewer(images, image);
    } catch {
      image.setAttribute('aria-label', `${image.alt || '正文图片'}，查看器加载失败，点击重试`);
    } finally { image.removeAttribute('aria-busy'); }
  }

  prose.addEventListener('click', event => {
    const image = event.target;
    if (image instanceof HTMLImageElement && images.includes(image)) void open(image);
  }, { signal: controller.signal });
  prose.addEventListener('keydown', event => {
    const image = event.target;
    if (image instanceof HTMLImageElement && images.includes(image) && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      void open(image);
    }
  }, { signal: controller.signal });

  function showRetry(image: HTMLImageElement) {
    if (retries.has(image)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'article-image-retry';
    button.textContent = '图片未加载 · 点击重试';
    button.addEventListener('click', () => {
      const retryUrl = (src: string) => { const url = new URL(src, document.baseURI); url.searchParams.set('_image_retry', String(Date.now())); return url.href; };
      // 保留 picture 的格式和响应式选择，重试当前资源，不替换笔记图片内容。
      image.closest('picture')?.querySelectorAll('source').forEach(source => {
        source.srcset = source.srcset.replace(/([^\s,]+)(\s+\d+[wx])?/g, (_, src: string, size = '') => `${retryUrl(src)}${size}`);
      });
      if (image.srcset) image.srcset = image.srcset.replace(/([^\s,]+)(\s+\d+[wx])?/g, (_, src: string, size = '') => `${retryUrl(src)}${size}`);
      image.src = retryUrl(image.src);
    }, { signal: controller.signal });
    image.after(button);
    retries.set(image, button);
  }
  prose.addEventListener('error', event => { if (event.target instanceof HTMLImageElement && images.includes(event.target)) showRetry(event.target); }, { capture: true, signal: controller.signal });
  prose.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) { retries.get(event.target)?.remove(); retries.delete(event.target); }
  }, { capture: true, signal: controller.signal });
  images.filter(image => image.complete && !image.naturalWidth).forEach(showRetry);

  teardownImages = () => {
    disposed = true;
    controller.abort();
    for (const [image, tabindex, role, label] of attributes) {
      for (const [key, value] of [['tabindex', tabindex], ['role', role], ['aria-label', label]]) {
        if (value === null) image.removeAttribute(key!); else image.setAttribute(key!, value!);
      }
      image.classList.remove('article-image-zoomable');
    }
    retries.forEach(button => button.remove());
  };
}
document.addEventListener('astro:page-load', initArticleImages);
document.addEventListener('astro:before-swap', () => { teardownImages?.(); teardownImages = null; });
