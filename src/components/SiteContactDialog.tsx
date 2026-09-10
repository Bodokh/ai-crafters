'use client';

import { Component, createContext, forwardRef, lazy, Suspense, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const LazyContact = lazy(() => import('./Contact').then(module => ({ default: module.Contact })));
const ContactContext = createContext<((trigger: HTMLButtonElement) => void) | null>(null);
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
  const trigger = useRef<HTMLButtonElement | null>(null);
  const scrollLock = useRef<ScrollLock | null>(null);
  const backdropStart = useRef(false);
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
    dialog.current?.close();
    setOpen(false);
    unlock();
    restoreFocus();
  }, [restoreFocus, unlock]);
  const show = useCallback((opener: HTMLButtonElement) => {
    if (dialog.current?.open) return;
    trigger.current = opener;
    setHasOpened(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    const node = dialog.current;
    if (!open || !node || node.open) return;
    scrollLock.current = { x: scrollX, y: scrollY, rootOverflow: document.documentElement.style.overflow, bodyOverflow: document.body.style.overflow };
    node.showModal();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (surface.current) surface.current.scrollTop = 0;
    node.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => () => {
    dialog.current?.close();
    unlock();
  }, [unlock]);

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
        onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation(); }}
        onPointerDown={event => { backdropStart.current = event.target === event.currentTarget; }}
        onClick={event => { if (backdropStart.current && event.target === event.currentTarget) close(); backdropStart.current = false; }}
      >
        <div ref={surface} className="aic-site-contact-surface">
          <button className="aic-site-contact-close" type="button" onClick={close} aria-label={locale === 'he' ? 'סגירת טופס יצירת קשר' : 'Close contact form'}><X size={18} aria-hidden="true" /></button>
          {hasOpened && <ContactLoadBoundary fallback={<p className="aic-contact-loading" role="status">{t('contact.form.error')} <a href="mailto:automate@ai-crafters.com">automate@ai-crafters.com</a></p>}>
            <Suspense fallback={<p className="aic-contact-loading" role="status">{locale === 'he' ? 'טוענים את הטופס…' : 'Loading contact form…'}</p>}>
              <LazyContact variant="modal" active={open} />
            </Suspense>
          </ContactLoadBoundary>}
        </div>
      </dialog>
    </ContactContext.Provider>
  );
}

export const ContactButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function ContactButton({ children, onClick, type = 'button', className = 'aic-button', ...props }, ref) {
  const show = useContext(ContactContext);
  return <button {...props} ref={ref} type={type} className={className} data-site-contact-trigger aria-haspopup="dialog" onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (show) { event.preventDefault(); show(event.currentTarget); }
  }}>{children}</button>;
});
