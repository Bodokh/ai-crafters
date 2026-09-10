const SIZE = 288;
const SOURCES = [
  new URL('./assets/neurons/neuron-0.webp', import.meta.url).href,
  new URL('./assets/neurons/neuron-1.webp', import.meta.url).href,
  new URL('./assets/neurons/neuron-2.webp', import.meta.url).href,
  new URL('./assets/neurons/neuron-3.webp', import.meta.url).href,
];

/** Upgrade the existing raster surfaces after the first frame has been painted.
 * vGPU runs only in tools/neural-bake. This optional decode adds no render work,
 * changes no sprite bounds, and never blocks readiness or restarts the clock.
 */
export function upgradeMobileNeuronSprites(window, sprites) {
  if (typeof window.Image !== 'function') return () => {};
  let disposed = false;
  const images = [];
  const release = image => {
    image.onload = image.onerror = null;
    image.removeAttribute('src');
  };
  const frame = window.requestAnimationFrame(() => {
    if (disposed) return;
    SOURCES.forEach((source, index) => {
      const image = new window.Image();
      images.push(image);
      image.decoding = 'async';
      image.onload = async () => {
        try {
          if (typeof image.decode === 'function') await image.decode();
          if (disposed || image.naturalWidth !== SIZE || image.naturalHeight !== SIZE) return;
          const context = sprites[index].getContext('2d', { alpha: true });
          if (!context) return;
          context.setTransform(1, 0, 0, 1, 0, 0);
          // A single copy replaces all pixels, including transparent branches;
          // failed loads/decodes leave the procedural fallback untouched.
          context.globalCompositeOperation = 'copy';
          context.drawImage(image, 0, 0, SIZE, SIZE);
          context.globalCompositeOperation = 'source-over';
        } catch {
          // The existing fallback is sufficient if an optional asset fails.
        } finally {
          release(image);
        }
      };
      image.onerror = () => release(image);
      image.src = source;
    });
  });
  return () => {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(frame);
    for (const image of images) release(image);
  };
}
