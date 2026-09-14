'use client';

import { Component, createContext, forwardRef, lazy, Suspense, useCallback, useContext, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { createContactDialogMotion } from '@/lib/contact-dialog-motion.js';

const LazyContact = lazy(() => import('./Contact').then(module => ({ default: module.Contact })));
const ContactContext = createContext<((trigger: HTMLButtonElement, instant: boolean) => void) | null>(null);
type ScrollLock = { x: number; y: number; rootOverflow: string; bodyOverflow: string };

class ContactLoadBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function SiteContactProvider({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const motion = useRef<ReturnType<typeof createContactDialogMotion> | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const scrollLock = useRef<ScrollLock | null>(null);
  const backdropStart = useRef(false);
  const entrance = useRef({ instant: false, focusClose: false, interacted: false });
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const unlock = useCallback(() => {
    const locked = scrollLock.current;
    if (!locked) return;
    document.documentElement.style.overflow = locked.rootOverflow;
    document.body.style.overflow = locked.bodyOverflow;
    window.scrollTo({ left: locked.x, top: locked.y, behavior: 'instant' });
    scrollLock.current = null;
  }, []);
  const restoreFocus = useCallback(() => {
    const opener = trigger.current;
    trigger.current = null;
    if (!opener) return;
    const visible = (node: HTMLElement | null): node is HTMLElement => Boolean(node?.isConnected && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden' && !node.closest('[inert]'));
    const summary = opener.closest('details:not([open])')?.querySelector<HTMLElement>(':scope > summary') || null;
    const target = visible(summary) ? summary : visible(opener) ? opener : [...document.querySelectorAll<HTMLElement>('[data-contact-menu-trigger], header [aria-controls][aria-expanded], header [data-site-contact-trigger]')].find(visible);
    target?.focus({ preventScroll: true });
  }, []);
  const close = useCallback(() => {
    motion.current?.cancel();
    dialog.current?.close();
    setOpen(false);
    unlock();
    restoreFocus();
  }, [restoreFocus, unlock]);
  const show = useCallback((opener: HTMLButtonElement, instant: boolean) => {
    if (dialog.current?.open) return;
    trigger.current = opener;
    entrance.current = {
      instant,
      focusClose: !instant && window.matchMedia('(max-width: 600px)').matches,
      interacted: false,
    };
    setHasOpened(true);
    setOpen(true);
  }, []);

  const focusInitialControl = useCallback(() => {
    const node = dialog.current;
    if (!node?.open || entrance.current.interacted) return;
    const target = entrance.current.focusClose
      ? closeButton.current
      : node.querySelector<HTMLInputElement>('input') || closeButton.current;
    target?.focus({ preventScroll: true });
  }, []);
  const contentReady = useCallback(() => {
    if (!dialog.current?.open) return;
    focusInitialControl();
    motion.current?.revealContent();
  }, [focusInitialControl]);

  useLayoutEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const controller = createContactDialogMotion({
      dialog: node,
      close: closeButton.current,
      getContent: () => ({
        intro: node.querySelector<HTMLElement>('.aic-contact-intro'),
        fields: node.querySelector<HTMLElement>('.aic-contact-fields'),
        submit: node.querySelector<HTMLElement>('.aic-contact-submit'),
        direct: node.querySelector<HTMLElement>('.aic-contact-direct'),
        legal: node.querySelector<HTMLElement>('.aic-contact-legal'),
      }),
    });
    motion.current = controller;
    return () => {
      controller.dispose();
      motion.current = null;
      node.close();
      unlock();
    };
  }, [unlock]);
  useLayoutEffect(() => {
    const node = dialog.current;
    if (!open || !node || node.open) return;
    scrollLock.current = { x: scrollX, y: scrollY, rootOverflow: document.documentElement.style.overflow, bodyOverflow: document.body.style.overflow };
    // Set this before showModal so mobile reopen cannot restore a remembered input.
    if (closeButton.current) closeButton.current.autofocus = entrance.current.focusClose;
    node.showModal();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (surface.current) surface.current.scrollTop = 0;
    focusInitialControl();
    motion.current?.enter({ instant: entrance.current.instant });
  }, [focusInitialControl, open]);

  return (
    <ContactContext.Provider value={show}>
      {children}
      <dialog
        ref={dialog}
        className="aic-site-contact-dialog"
        aria-label={t('nav.contact')}
        dir={locale === 'he' ? 'rtl' : 'ltr'}
        onCancel={event => { event.preventDefault(); close(); }}
        onClose={() => { if (!dialog.current?.open) close(); }}
        onKeyDownCapture={() => { entrance.current.interacted = true; }}
        onPointerDownCapture={() => { entrance.current.interacted = true; }}
        onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation(); }}
        onPointerDown={event => { backdropStart.current = event.target === event.currentTarget; }}
        onClick={event => { if (backdropStart.current && event.target === event.currentTarget) close(); backdropStart.current = false; }}
      >
        <div ref={surface} className="aic-site-contact-surface">
          <button ref={closeButton} className="aic-site-contact-close" type="button" onClick={close} aria-label={locale === 'he' ? 'סגירת טופס יצירת קשר' : 'Close contact form'}><X size={18} aria-hidden="true" /></button>
          {hasOpened && <ContactLoadBoundary fallback={<p className="aic-contact-loading" role="status">{t('contact.form.error')} <a href="mailto:automate@ai-crafters.com">automate@ai-crafters.com</a></p>}>
            <Suspense fallback={<p className="aic-contact-loading" role="status">{locale === 'he' ? 'טוענים את הטופס…' : 'Loading contact form…'}</p>}>
              <LazyContact variant="modal" active={open} onReady={contentReady} />
            </Suspense>
          </ContactLoadBoundary>}
        </div>
      </dialog>
    </ContactContext.Provider>
  );
}

export const ContactButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function ContactButton({ children, onClick, onPointerDown, onPointerCancel, onKeyDown, type = 'button', className = 'aic-button', ...props }, ref) {
  const show = useContext(ContactContext);
  const pointerTime = useRef<number | null>(null);
  return <button
    {...props}
    ref={ref}
    type={type}
    className={className}
    data-site-contact-trigger
    aria-haspopup="dialog"
    onPointerDown={event => {
      onPointerDown?.(event);
      pointerTime.current = event.defaultPrevented ? null : performance.now();
    }}
    onPointerCancel={event => {
      pointerTime.current = null;
      onPointerCancel?.(event);
    }}
    onKeyDown={event => {
      pointerTime.current = null;
      onKeyDown?.(event);
    }}
    onClick={event => {
      const pointerType = (event.nativeEvent as MouseEvent & { pointerType?: string }).pointerType;
      const pointerActivated = Boolean(pointerType) || (pointerTime.current !== null && performance.now() - pointerTime.current < 1500);
      pointerTime.current = null;
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (show) { event.preventDefault(); show(event.currentTarget, event.detail === 0 && !pointerActivated); }
    }}
  >{children}</button>;
});
