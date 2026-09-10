const MEASUREMENT_ID = 'AW-17903861190';
const SCRIPT_URL = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
const interactionEvents = ['pointerdown', 'touchstart', 'keydown', 'scroll'];
const setups = new WeakMap();

/** Preserve the site's existing Google tag, deferred until the first interaction. */
export function initializeSiteAnalytics({ window: view, document } = {}) {
  if (!view || !document) return () => {};
  const previous = setups.get(view);
  if (previous) return previous.dispose;

  let disposed = false;
  const state = { loaded: false, dispose };

  function removeListeners() {
    for (const event of interactionEvents) view.removeEventListener(event, load);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    removeListeners();
    // Loaded tags persist for this document; a canceled setup may be mounted again.
    if (!state.loaded && setups.get(view) === state) setups.delete(view);
  }

  function load() {
    if (disposed || state.loaded) return;
    state.loaded = true;
    removeListeners();

    const queue = view.dataLayer || (view.dataLayer = []);
    view.gtag ||= function () { queue.push(arguments); };
    if (!queue.some(command => command?.[0] === 'js')) view.gtag('js', new Date());
    if (!queue.some(command => command?.[0] === 'config' && command[1] === MEASUREMENT_ID)) {
      view.gtag('config', MEASUREMENT_ID);
    }

    if (!document.getElementById('google-ads-library') && !document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      const script = document.createElement('script');
      script.id = 'google-ads-library';
      script.async = true;
      script.src = SCRIPT_URL;
      document.head.append(script);
    }
  }

  setups.set(view, state);
  for (const event of interactionEvents) view.addEventListener(event, load, { once: true, passive: true });
  return dispose;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initializeSiteAnalytics({ window, document });
}
