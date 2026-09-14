'use client';

import { ChangeEvent, FormEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, PhoneCall, Send, SendHorizonal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

type ContactFormState = { firstName: string; lastName: string; email: string; message: string };
type ContactField = keyof ContactFormState;
type ContactFormErrors = Partial<Record<ContactField, string>>;
type Captcha = { ready: (callback: () => void) => void; execute: (key: string, options: { action: string }) => Promise<string> };
type ContactProps = { variant?: 'section' | 'modal'; active?: boolean; onReady?: () => void };

const initialFormState: ContactFormState = { firstName: '', lastName: '', email: '', message: '' };
const fields: ContactField[] = ['firstName', 'lastName', 'email', 'message'];
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
let captchaLoad: Promise<Captcha> | null = null;
let captchaReloadRequired = false;

function loadCaptcha(): Promise<Captcha> {
  if (!siteKey) return Promise.reject(new Error('verification'));
  if (captchaLoad) return captchaLoad;
  captchaLoad = new Promise<Captcha>((resolve, reject) => {
    let script = document.getElementById('recaptcha-v3-script') as HTMLScriptElement | null;
    let owned = false;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      script?.removeEventListener('load', ready);
      script?.removeEventListener('error', failed);
      if (error) {
        captchaReloadRequired = typeof (window as unknown as { grecaptcha?: Captcha }).grecaptcha?.execute !== 'function';
        if (owned) script?.remove();
        reject(error);
      } else {
        captchaReloadRequired = false;
        resolve((window as unknown as { grecaptcha: Captcha }).grecaptcha);
      }
    };
    const ready = () => {
      const captcha = (window as unknown as { grecaptcha?: Captcha }).grecaptcha;
      if (typeof captcha?.ready !== 'function') { finish(new Error('verification')); return; }
      try {
        // api.js installs ready before the asynchronous engine installs execute.
        captcha.ready(() => {
          const loaded = (window as unknown as { grecaptcha?: Captcha }).grecaptcha;
          finish(typeof loaded?.execute === 'function' ? undefined : new Error('verification'));
        });
      } catch { finish(new Error('verification')); }
    };
    const failed = () => finish(new Error('verification'));
    const timeout = setTimeout(failed, 12000);
    const captcha = (window as unknown as { grecaptcha?: Captcha }).grecaptcha;
    if (typeof captcha?.ready === 'function' && (!captchaReloadRequired || typeof captcha.execute === 'function')) { ready(); return; }
    if (captchaReloadRequired) { script?.remove(); script = null; }
    if (!script) {
      script = document.createElement('script');
      script.id = 'recaptcha-v3-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      owned = true;
    }
    script.addEventListener('load', ready, { once: true });
    script.addEventListener('error', failed, { once: true });
    if (owned) document.head.append(script);
  }).catch(error => { captchaLoad = null; throw error; });
  return captchaLoad;
}

function bounded<T>(operation: () => Promise<T>, signal: AbortSignal, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: (value: never) => void, value: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener('abort', aborted);
      callback(value as never);
    };
    const aborted = () => finish(reject, new DOMException('Aborted', 'AbortError'));
    const timeout = setTimeout(() => finish(reject, new Error('verification')), milliseconds);
    if (signal.aborted) { aborted(); return; }
    signal.addEventListener('abort', aborted, { once: true });
    Promise.resolve().then(() => {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      return operation();
    }).then(value => finish(resolve, value), error => finish(reject, error));
  });
}

export const Contact = ({ variant = 'section', active = true, onReady }: ContactProps = {}) => {
  const t = useTranslations();
  const locale = useLocale();
  const rtl = locale === 'he';
  const modal = variant === 'modal';
  const id = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const mounted = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const attempt = useRef(0);
  const request = useRef<AbortController | null>(null);
  const submitting = useRef(false);
  const touched = useRef(new Set<ContactField>());
  const [formData, setFormData] = useState<ContactFormState>(initialFormState);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'verification'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verificationMessage = rtl
    ? 'לא ניתן להשלים את האימות המאובטח. נסו שוב או כתבו ל־automate@ai-crafters.com.'
    : 'Secure verification could not complete. Please try again, or email automate@ai-crafters.com.';

  useLayoutEffect(() => {
    if (modal) onReady?.();
  }, [modal, onReady]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; attempt.current += 1; request.current?.abort(); };
  }, []);
  useEffect(() => {
    if (!active) {
      attempt.current += 1;
      request.current?.abort();
      request.current = null;
      submitting.current = false;
      setIsSubmitting(false);
    }
  }, [active]);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const load = () => {
      // Warm up quietly; submission retries and reports any actual failure.
      if (!cancelled) void loadCaptcha().catch(() => {});
    };
    if (modal) {
      load();
      return () => { cancelled = true; };
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { load(); observer.disconnect(); }
    }, { rootMargin: '100px' });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { cancelled = true; observer.disconnect(); };
  }, [active, modal]);

  const validateField = (field: ContactField, value: string) => {
    if (!value.trim()) return t(`contact.form.validation.${field}`);
    if (field === 'email' && !emailRegex.test(value.trim())) return t('contact.form.validation.emailFormat');
    return undefined;
  };
  const handleChange = (field: ContactField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: touched.current.has(field) ? validateField(field, value) : undefined }));
    if (status !== 'idle') setStatus('idle');
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || !activeRef.current) return;
    const validationErrors: ContactFormErrors = {};
    for (const field of fields) {
      touched.current.add(field);
      const error = validateField(field, formData[field]);
      if (error) validationErrors[field] = error;
    }
    setErrors(validationErrors);
    const invalid = fields.find(field => validationErrors[field]);
    if (invalid) {
      (formRef.current?.elements.namedItem(invalid) as HTMLElement | null)?.focus();
      return;
    }
    const currentAttempt = ++attempt.current;
    const controller = new AbortController();
    request.current = controller;
    const current = () => mounted.current && activeRef.current && currentAttempt === attempt.current;
    submitting.current = true;
    setIsSubmitting(true);
    setStatus('idle');
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const captcha = await bounded(loadCaptcha, controller.signal, 12500);
      if (!current()) return;
      const recaptchaToken = await bounded(() => captcha.execute(siteKey!, { action: 'contact_submit' }), controller.signal, 12000)
        .catch(() => { throw new Error('verification'); });
      if (!current()) return;
      if (typeof recaptchaToken !== 'string' || !recaptchaToken.trim()) throw new Error('verification');
      const payload = Object.fromEntries(fields.map(field => [field, formData[field].trim()]));
      timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, locale, recaptchaToken }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!current()) return;
      if (!response.ok) {
        if (result?.errors && typeof result.errors === 'object') {
          const serverErrors: ContactFormErrors = {};
          for (const field of fields) if (typeof result.errors[field] === 'string') serverErrors[field] = result.errors[field];
          setErrors(serverErrors);
        }
        if (typeof result?.message === 'string' && /recaptcha/i.test(result.message)) throw new Error('verification');
        throw new Error('submission');
      }
      if (result?.ok !== true) throw new Error('submission');
      setStatus('success');
      setFormData(initialFormState);
      setErrors({});
      touched.current.clear();
    } catch (error) {
      if (current()) setStatus(error instanceof Error && error.message === 'verification' ? 'verification' : 'error');
    } finally {
      clearTimeout(timeout);
      if (current()) {
        request.current = null;
        submitting.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const SendIcon = modal ? ArrowUpRight : rtl ? SendHorizonal : Send;
  const form = (
    <form ref={formRef} className={modal ? 'aic-contact-form' : 'space-y-6'} noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className={modal ? 'aic-contact-fields' : 'grid grid-cols-1 gap-6 md:grid-cols-2'}>
        {fields.map(field => {
          const fieldId = `${id}-${field}`;
          const errorId = `${fieldId}-error`;
          const inputClass = modal ? 'aic-contact-input' : `w-full bg-muted/50 border px-4 py-3 text-foreground focus:outline-none focus:border-cyan-500 font-sans ${errors[field] ? 'border-red-500' : 'border-border'}`;
          const inputProps = {
            id: fieldId, name: field, required: true, readOnly: isSubmitting,
            value: formData[field], onChange: handleChange(field),
            onBlur: () => { touched.current.add(field); setErrors(previous => ({ ...previous, [field]: validateField(field, formData[field]) })); },
            className: inputClass, 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? errorId : undefined,
          };
          return (
            <div key={field} className={modal ? `aic-contact-field aic-contact-field--${field}` : `space-y-2 ${field === 'email' || field === 'message' ? 'md:col-span-2' : ''}`}>
              <label className={modal ? 'aic-contact-label' : 'text-xs font-mono text-cyan-500 uppercase tracking-wider'} htmlFor={fieldId}>{t(`contact.form.${field}`)}</label>
              {field === 'message' ? <textarea {...inputProps} rows={4} placeholder={t('contact.form.messagePlaceholder')} /> : <input {...inputProps} type={field === 'email' ? 'email' : 'text'} autoComplete={field === 'firstName' ? 'name' : field === 'lastName' ? 'organization' : 'email'} dir={field === 'email' ? 'ltr' : undefined} />}
              {errors[field] && <p id={errorId} className={modal ? 'aic-contact-error' : 'text-xs text-red-400'}>{errors[field]}</p>}
            </div>
          );
        })}
      </div>
      <div className={modal ? 'aic-contact-status' : `text-sm ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`} role="status" aria-live="polite" aria-atomic="true" data-tone={status === 'success' ? 'success' : status !== 'idle' ? 'error' : undefined}>
        {status === 'success' ? t('contact.form.success') : status === 'error' ? t('contact.form.error') : status === 'verification' ? verificationMessage : ''}
      </div>
      <button type="submit" disabled={isSubmitting} className={modal ? 'aic-button aic-contact-submit' : 'group flex w-full items-center justify-center gap-2 bg-cyan-700 py-4 font-bold uppercase tracking-widest text-white transition-colors hover:bg-cyan-600 disabled:bg-muted disabled:text-muted-foreground'}>
        {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
        <SendIcon size={20} className="aic-button-icon" aria-hidden="true" />
      </button>
      <p className={modal ? 'aic-contact-description text-sm' : 'text-sm leading-6 text-muted-foreground'}>{t('contact.form.nextStep')}</p>
      {modal && <p className="aic-contact-direct"><a href="mailto:automate@ai-crafters.com">automate@ai-crafters.com</a></p>}
      <p className={modal ? 'aic-contact-legal' : 'mt-4 text-xs text-muted-foreground'}>
        {rtl ? 'טופס זה מוגן באמצעות reCAPTCHA. ' : 'This form is protected by reCAPTCHA. '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">{rtl ? 'מדיניות הפרטיות' : 'Privacy Policy'}</a>
        {rtl ? ' ו' : ' and '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">{rtl ? 'תנאי השימוש של Google' : 'Google Terms of Service'}</a>
        {rtl ? ' חלים.' : ' apply.'}
      </p>
    </form>
  );

  if (modal) return (
    <section className="aic-contact-modal" dir={rtl ? 'rtl' : 'ltr'}>
      <header className="aic-contact-intro">
        <p className="aic-contact-eyebrow">{t('nav.contact')}</p>
        <h2>{t('contact.title.1')} {t('contact.title.2')}</h2>
        <p className="aic-contact-description">{t('contact.desc')}</p>
      </header>
      {form}
    </section>
  );

  const coverageDisplay = t('contact.coverage');
  return (
    <section ref={sectionRef} id="contact" className="py-24 bg-background relative overflow-hidden border-t border-border" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="mb-4 text-sm font-medium text-cyan-500">{t('contact.eyebrow')}</p>
            <h2 className="font-display font-bold text-5xl text-foreground mb-6 leading-tight"><span>{t('contact.title.1')}</span><br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">{t('contact.title.2')}</span></h2>
            <p className={`text-muted-foreground text-lg mb-8 font-light font-sans ${rtl ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-border`}>{t('contact.desc')}</p>
            <div className="space-y-6">
              {[
                { icon: Mail, text: 'automate@ai-crafters.com', href: 'mailto:automate@ai-crafters.com' },
                { icon: PhoneCall, text: coverageDisplay, href: `tel:+${coverageDisplay.replace(/\D/g, '')}` },
                { icon: MapPin, text: t('contact.location'), href: undefined },
              ].map(item => <a key={item.text} href={item.href} className="flex items-center gap-4 text-foreground group p-4 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"><item.icon size={24} className="text-brand-500 group-hover:text-cyan-400" aria-hidden="true" /><span className="text-lg font-mono">{item.text}</span></a>)}
            </div>
          </div>
          <div className="p-1 rounded-3xl bg-gradient-to-b from-muted to-background"><div className="bg-card rounded-[22px] p-8 border border-border">{form}</div></div>
        </div>
      </div>
    </section>
  );
};
