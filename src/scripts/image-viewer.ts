let closeCurrent: (() => void) | null = null;
document.addEventListener('astro:before-swap', () => closeCurrent?.());

export function openImageViewer(candidates: HTMLImageElement[], selected: HTMLImageElement) {
  closeCurrent?.();
  const images = candidates.filter(image => image.isConnected && image.complete && image.naturalWidth > 0);
  let index = images.indexOf(selected);
  if (index < 0) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'article-image-viewer';
  dialog.setAttribute('aria-label', '正文图片查看器');
  dialog.innerHTML = `<div class="image-viewer-toolbar"><button type="button" data-action="previous" aria-label="上一张">←</button><span data-counter></span><button type="button" data-action="next" aria-label="下一张">→</button><button type="button" data-action="zoom" aria-label="放大图片">＋</button><button type="button" data-action="reset">适应窗口</button><button type="button" data-action="close" aria-label="关闭图片查看器">✕</button></div><div class="image-viewer-stage"><img alt="" draggable="false" /></div><p data-caption></p><p class="image-viewer-status" role="status"></p>`;
  const image = dialog.querySelector<HTMLImageElement>('img')!;
  const stage = dialog.querySelector<HTMLElement>('.image-viewer-stage')!;
  const controller = new AbortController();
  const { signal } = controller;
  const oldOverflow = document.documentElement.style.overflow;
  const oldGutter = document.documentElement.style.scrollbarGutter;
  const readingPosition = { top: window.scrollY, left: window.scrollX };
  let zoom = 1;
  let x = 0;
  let y = 0;
  let pointer: { id: number; x: number; y: number; startX: number; startY: number } | null = null;

  const zoomButton = dialog.querySelector<HTMLButtonElement>('[data-action="zoom"]')!;
  const renderTransform = () => {
    image.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    stage.dataset.zoomed = String(zoom > 1);
    zoomButton.setAttribute('aria-pressed', String(zoom > 1));
    zoomButton.setAttribute('aria-label', zoom > 1 ? '恢复原始缩放' : '放大图片');
    zoomButton.textContent = zoom > 1 ? '－' : '＋';
  };
  const endDrag = () => {
    if (pointer && stage.hasPointerCapture(pointer.id)) stage.releasePointerCapture(pointer.id);
    pointer = null;
  };
  const reset = () => { endDrag(); zoom = 1; x = 0; y = 0; renderTransform(); };
  const changeImage = (next: number) => {
    index = Math.max(0, Math.min(images.length - 1, next));
    reset();
    image.src = images[index].currentSrc || images[index].src;
    image.alt = images[index].alt;
    dialog.querySelector<HTMLElement>('[data-counter]')!.textContent = `${index + 1} / ${images.length}`;
    dialog.querySelector<HTMLElement>('[data-caption]')!.textContent = image.alt || '正文图片';
    dialog.querySelector<HTMLButtonElement>('[data-action="previous"]')!.disabled = index === 0;
    dialog.querySelector<HTMLButtonElement>('[data-action="next"]')!.disabled = index === images.length - 1;
    dialog.querySelector<HTMLElement>('.image-viewer-status')!.textContent = '正在加载图片…';
  };
  const close = () => {
    endDrag();
    controller.abort();
    dialog.close();
    dialog.remove();
    document.documentElement.style.overflow = oldOverflow;
    document.documentElement.style.scrollbarGutter = oldGutter;
    window.scrollTo({ ...readingPosition, behavior: 'instant' });
    if (selected.isConnected) selected.focus({ preventScroll: true });
    if (closeCurrent === close) closeCurrent = null;
  };
  closeCurrent = close;
  image.addEventListener('load', () => { dialog.querySelector<HTMLElement>('.image-viewer-status')!.textContent = ''; }, { signal });
  image.addEventListener('error', () => { dialog.querySelector<HTMLElement>('.image-viewer-status')!.textContent = '图片加载失败，请关闭后重试。'; }, { signal });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }, { signal });
  dialog.addEventListener('click', event => {
    const action = (event.target as Element).closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action === 'close') close();
    if (action === 'previous') changeImage(index - 1);
    if (action === 'next') changeImage(index + 1);
    if (action === 'reset') reset();
    if (action === 'zoom') { endDrag(); zoom = zoom === 1 ? 2 : 1; x = 0; y = 0; renderTransform(); }
    if (event.target === dialog || (event.target === stage && zoom === 1)) close();
  }, { signal });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); changeImage(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); changeImage(index + 1); }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom = Math.min(3, zoom + .5); renderTransform(); }
    if (event.key === '-') { event.preventDefault(); zoom = Math.max(1, zoom - .5); if (zoom === 1) reset(); else renderTransform(); }
    if (event.key === '0') reset();
  }, { signal });
  stage.addEventListener('pointerdown', event => {
    if (zoom === 1 || pointer || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: x, startY: y };
    stage.setPointerCapture(event.pointerId);
  }, { signal });
  stage.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    x = pointer.startX + event.clientX - pointer.x;
    y = pointer.startY + event.clientY - pointer.y;
    renderTransform();
  }, { signal });
  const release = (event: PointerEvent) => { if (pointer?.id === event.pointerId) pointer = null; };
  stage.addEventListener('pointerup', release, { signal });
  stage.addEventListener('pointercancel', release, { signal });
  stage.addEventListener('lostpointercapture', release, { signal });
  document.body.append(dialog);
  changeImage(index);
  dialog.showModal();
  // 锁定滚动时保留原滚动条槽，避免长文重排和浏览器滚动锚定改变阅读位置。
  document.documentElement.style.scrollbarGutter = 'stable';
  document.documentElement.style.overflow = 'hidden';
  dialog.querySelector<HTMLButtonElement>('[data-action="close"]')!.focus({ preventScroll: true });
}
