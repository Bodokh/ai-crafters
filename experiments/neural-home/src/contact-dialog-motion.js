const ENTER_EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';

// The native dialog owns focus, scrolling, and dismissal. These effects only
// decorate its entrance, and their underlying styles are always fully visible.
export function createContactDialogMotion({ dialog, intro, fields, submit, direct, legal, close }) {
  const document = dialog.ownerDocument;
  const view = document?.defaultView;
  const active = new Set();
  let disposed = false;
  let listening = false;
  let reducedMotion;
  let compact;
  let sheen;

  function release(record) {
    if (!active.delete(record)) return;
    record.animation.cancel();
  }

  function cancel() {
    for (const record of [...active]) release(record);
  }

  function listen() {
    if (listening) return;
    listening = true;
    reducedMotion = view?.matchMedia?.('(prefers-reduced-motion: reduce)');
    compact = view?.matchMedia?.('(max-width: 600px)');
    reducedMotion?.addEventListener?.('change', cancel);
    // Mobile browsers may deliver native focus after opening. Let that focus
    // settle without cutting the reveal short; actual interaction finishes it.
    dialog.addEventListener('pointerdown', cancel, { capture: true, passive: true });
    dialog.addEventListener('keydown', cancel, { capture: true });
  }

  function animate(node, frames, options) {
    if (!node || typeof node.animate !== 'function') return;
    // Never hide or shift the field that already received native modal focus.
    if (node !== dialog && node.contains(document.activeElement)) return;
    try {
      const animation = node.animate(frames, { easing: ENTER_EASING, fill: 'both', ...options });
      const record = { animation };
      active.add(record);
      // Canceling a finished effect drops its fill/layer rather than retaining
      // animation styles. Old completions cannot affect a reopened dialog.
      Promise.resolve(animation.finished).then(() => release(record), () => release(record));
    } catch {
      // WAAPI is an enhancement. The native, fully styled form remains usable.
    }
  }

  function enter({ instant = false } = {}) {
    cancel();
    if (disposed || !dialog.open || instant || typeof dialog.animate !== 'function') return;
    listen();
    if (reducedMotion?.matches) {
      animate(dialog, [{ opacity: 0.65 }, { opacity: 1 }], { duration: 100 });
      return;
    }

    const mobile = compact?.matches || document.documentElement.dataset.renderer === 'mobile';
    animate(dialog, [
      { opacity: mobile ? 0.2 : 0.45, transform: mobile ? 'translateY(36px) scale(0.95)' : 'perspective(1200px) translateY(24px) rotateX(4deg) scale(0.94)' },
      { opacity: 1, transform: 'none' },
    ], { duration: mobile ? 360 : 420 });

    const fieldGroups = Array.from(fields?.children || [], (field, index) => [field, Math.max(1, index)]);
    const groups = [[intro, 0], ...fieldGroups, [submit, 4], [direct, 5], [legal, 5], [close, 0]];
    for (const [node, group] of groups) {
      animate(node, [
        { opacity: 0.4, transform: `translateY(${mobile ? 5 : 10}px)` },
        { opacity: 1, transform: 'none' },
      ], { duration: mobile ? 220 : 260, delay: group * (mobile ? 20 : 30) });
    }

    if (!sheen) {
      sheen = document.createElement('div');
      sheen.className = 'contact-dialog__sheen';
      sheen.setAttribute('aria-hidden', 'true');
      dialog.append(sheen);
    }
    animate(sheen, [
      { opacity: 0, transform: 'translateX(-110%)' },
      { opacity: mobile ? 0.45 : 0.7, offset: 0.3 },
      { opacity: 0, transform: 'translateX(110%)' },
    ], { duration: mobile ? 360 : 600, delay: mobile ? 0 : 20, easing: 'cubic-bezier(0.32, 0, 0.18, 1)' });
  }

  return {
    enter,
    cancel,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancel();
      reducedMotion?.removeEventListener?.('change', cancel);
      if (listening) {
        dialog.removeEventListener('pointerdown', cancel, { capture: true });
        dialog.removeEventListener('keydown', cancel, { capture: true });
      }
      sheen?.remove();
      sheen = null;
    },
  };
}
