import { createContactDialogMotion } from './contact-dialog-motion.js';

const EN_COPY = {
  close: 'Close contact form',
  eyebrow: 'Custom AI for your business',
  title: 'Let’s discuss your project.',
  description: 'Tell us what you want to build or improve and which systems you use. We’ll review your inquiry and reply to discuss fit and next steps.',
  direct: 'Prefer email? ',
  legal: 'Protected by reCAPTCHA. Google’s ',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  legalJoin: ' and ',
  legalEnd: ' apply.',
  emailFormat: 'Enter a valid email address.',
  verifying: 'Verifying your request…',
  submit: 'Discuss your project',
  sending: 'Sending...',
  success: 'Thanks, your message has been sent. We’ll reply by email to discuss your project.',
  error: "Something went wrong. Email automate@ai-crafters.com and we'll help.",
  unavailable: 'Secure verification is unavailable here. Please email automate@ai-crafters.com.',
  verification: 'Secure verification could not complete. Please try again, or email automate@ai-crafters.com.',
  timeout: 'This is taking longer than expected. Please try again, or email automate@ai-crafters.com.',
};
const EN_FIELDS = [
  { name: 'firstName', label: 'Your name', autocomplete: 'name', required: 'Please tell us who we should contact.' },
  { name: 'lastName', label: 'Company', autocomplete: 'organization', required: 'Let us know the company you represent.' },
  { name: 'email', label: 'Work email', type: 'email', autocomplete: 'email', required: 'An email address is required.' },
  { name: 'message', label: 'What would you like to build or improve?', multiline: true, required: 'Share a short description of your challenge.' },
];
const HE_COPY = {
  close: 'סגירת טופס יצירת קשר',
  eyebrow: 'AI מותאם לעסק שלכם',
  title: 'נדבר על הפרויקט שלכם.',
  description: 'ספרו לנו מה תרצו לבנות או לשפר ובאילו מערכות אתם משתמשים. נבחן את הפנייה ונחזור אליכם כדי לדבר על ההתאמה והשלב הבא.',
  direct: 'מעדיפים אימייל? ',
  legal: 'טופס זה מוגן באמצעות reCAPTCHA. חלים ',
  privacy: 'מדיניות הפרטיות',
  terms: 'תנאי השימוש',
  legalJoin: ' ו',
  legalEnd: ' של Google.',
  emailFormat: 'אנא הזינו כתובת אימייל תקינה.',
  verifying: 'מאמתים את הבקשה…',
  submit: 'נדבר על הפרויקט שלכם',
  sending: 'שולחים...',
  success: 'תודה, ההודעה נשלחה. נחזור אליכם באימייל כדי לדבר על הפרויקט.',
  error: 'משהו השתבש. אפשר גם לכתוב ל־automate@ai-crafters.com.',
  unavailable: 'האימות המאובטח אינו זמין כאן. אפשר לכתוב ל־automate@ai-crafters.com.',
  verification: 'האימות המאובטח לא הושלם. נסו שוב, או כתבו ל־automate@ai-crafters.com.',
  timeout: 'זה לוקח יותר זמן מהצפוי. נסו שוב, או כתבו ל־automate@ai-crafters.com.',
};
const HE_FIELDS = [
  { ...EN_FIELDS[0], label: 'שם', required: 'אנא הזינו שם ליצירת קשר.' },
  { ...EN_FIELDS[1], label: 'חברה', required: 'אנא ציינו את החברה שאתם מייצגים.' },
  { ...EN_FIELDS[2], label: 'אימייל', required: 'נדרשת כתובת אימייל.' },
  { ...EN_FIELDS[3], label: 'מה תרצו לבנות או לשפר?', required: 'ספרו לנו בקצרה על האתגר.' },
];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function icon(symbol) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${symbol}`);
  svg.append(use);
  return svg;
}

// reCAPTCHA cannot be aborted, so stop waiting and fence every late result.
function bounded(operation, milliseconds, signal, message) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', aborted);
      callback(value);
    };
    const aborted = () => finish(reject, new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(() => finish(reject, new Error(message)), milliseconds);
    if (signal?.aborted) { aborted(); return; }
    signal?.addEventListener('abort', aborted, { once: true });
    Promise.resolve().then(operation).then(
      value => finish(resolve, value),
      error => finish(reject, error),
    );
  });
}

export function createContactDialog({ siteKey } = {}) {
  const locale = document.documentElement.lang === 'he' ? 'he' : 'en';
  const COPY = locale === 'he' ? HE_COPY : EN_COPY;
  const FIELDS = locale === 'he' ? HE_FIELDS : EN_FIELDS;
  const key = typeof siteKey === 'string' ? siteKey.trim() : '';
  const lifetime = new AbortController();
  const events = { signal: lifetime.signal };
  const dialog = element('dialog', 'contact-dialog');
  dialog.setAttribute('aria-labelledby', 'journey-contact-title');
  dialog.setAttribute('aria-describedby', 'journey-contact-description');
  const surface = element('div', 'contact-dialog__surface');
  const close = element('button', 'contact-dialog__close');
  close.type = 'button';
  close.setAttribute('aria-label', COPY.close);
  close.append(icon('i-close'));
  const intro = element('header', 'contact-dialog__intro');
  const eyebrow = element('p', 'contact-dialog__eyebrow', COPY.eyebrow);
  const title = element('h2', 'contact-dialog__title', COPY.title);
  title.id = 'journey-contact-title';
  const description = element('p', 'contact-dialog__description', COPY.description);
  description.id = 'journey-contact-description';
  intro.append(eyebrow, title, description);
  const form = element('form', 'contact-dialog__form');
  form.noValidate = true;
  const fields = element('div', 'contact-dialog__fields');
  const inputs = new Map();
  const errors = new Map();
  const touched = new Set();
  for (const field of FIELDS) {
    const group = element('div', `contact-dialog__field contact-dialog__field--${field.name}`);
    const id = `journey-contact-${field.name}`;
    const label = element('label', '', field.label);
    label.htmlFor = id;
    const input = element(field.multiline ? 'textarea' : 'input');
    input.id = id;
    input.name = field.name;
    input.required = true;
    input.setAttribute('aria-invalid', 'false');
    if (field.multiline) input.rows = 4;
    else {
      input.type = field.type || 'text';
      input.autocomplete = field.autocomplete;
    }
    const error = element('p', 'contact-dialog__field-error');
    error.id = `${id}-error`;
    error.hidden = true;
    group.append(label, input, error);
    fields.append(group);
    inputs.set(field.name, input);
    errors.set(field.name, error);
  }
  const status = element('p', 'contact-dialog__status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const submit = element('button', 'button contact-dialog__submit');
  submit.type = 'submit';
  const submitLabel = element('span', '', COPY.submit);
  submit.append(submitLabel, icon('i-arrow'));
  const direct = element('p', 'contact-dialog__direct', COPY.direct);
  const email = element('a', '', 'automate@ai-crafters.com');
  email.href = 'mailto:automate@ai-crafters.com';
  direct.append(email);
  const legal = element('p', 'contact-dialog__legal', COPY.legal);
  const privacy = element('a', '', COPY.privacy);
  privacy.href = 'https://policies.google.com/privacy';
  const terms = element('a', '', COPY.terms);
  terms.href = 'https://policies.google.com/terms';
  for (const link of [privacy, terms]) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  legal.append(privacy, document.createTextNode(COPY.legalJoin), terms, document.createTextNode(COPY.legalEnd));
  form.append(fields, status, submit, direct, legal);
  surface.append(close, intro, form);
  dialog.append(surface);
  document.body.append(dialog);
  const motion = createContactDialogMotion({ dialog, surface, intro, fields, submit, direct, legal, close });

  let disposed = false;
  let generation = 0;
  let busy = false;
  let trigger = null;
  let scrollLock = null;
  let activeRequest = null;
  let captchaPromise = null;
  let captchaReloadRequired = false;
  let ownedScript = null;
  let captchaCleanup = () => {};
  let backdropStart = false;
  let pointerActivation = null;
  const current = version => !disposed && dialog.open && version === generation;

  function showStatus(text, tone = '') {
    status.textContent = text;
    status.dataset.tone = tone;
  }
  function setBusy(value) {
    busy = value;
    submit.disabled = value;
    submitLabel.textContent = value ? COPY.sending : COPY.submit;
    form.setAttribute('aria-busy', String(value));
    // A successful response must not erase edits made while that request was in flight.
    for (const input of inputs.values()) input.readOnly = value;
  }
  function setError(name, text = '') {
    const input = inputs.get(name);
    const error = errors.get(name);
    error.textContent = text;
    error.hidden = !text;
    input.setAttribute('aria-invalid', String(Boolean(text)));
    if (text) input.setAttribute('aria-describedby', error.id);
    else input.removeAttribute('aria-describedby');
  }
  function validate(field) {
    const value = inputs.get(field.name).value.trim();
    const error = !value ? field.required : field.name === 'email' && !EMAIL.test(value) ? COPY.emailFormat : '';
    setError(field.name, error);
    return !error;
  }
  for (const field of FIELDS) {
    const input = inputs.get(field.name);
    input.addEventListener('blur', () => { touched.add(field.name); validate(field); }, events);
    input.addEventListener('input', () => {
      if (touched.has(field.name)) validate(field);
      if (!busy && status.dataset.tone === 'success') showStatus('');
    }, events);
  }

  function loadCaptcha() {
    if (!key) return Promise.reject(new Error(COPY.unavailable));
    if (captchaPromise) return captchaPromise;
    captchaPromise = new Promise((resolve, reject) => {
      let settled = false;
      let script = document.getElementById('recaptcha-v3-script');
      const finish = error => {
        if (settled) return;
        settled = true;
        captchaCleanup();
        if (error) {
          captchaReloadRequired = typeof window.grecaptcha?.execute !== 'function';
          if (ownedScript) { ownedScript.remove(); ownedScript = null; }
          reject(error);
        } else {
          captchaReloadRequired = false;
          resolve(window.grecaptcha);
        }
      };
      const ready = () => {
        if (typeof window.grecaptcha?.ready !== 'function') {
          finish(new Error(COPY.verification));
          return;
        }
        try {
          // api.js installs ready before the asynchronous engine installs execute.
          window.grecaptcha.ready(() => {
            finish(typeof window.grecaptcha?.execute === 'function' ? undefined : new Error(COPY.verification));
          });
        }
        catch { finish(new Error(COPY.verification)); }
      };
      const failed = () => finish(new Error(COPY.verification));
      const aborted = () => finish(new DOMException('Aborted', 'AbortError'));
      const timeout = setTimeout(failed, 12000);
      captchaCleanup = () => {
        clearTimeout(timeout);
        script?.removeEventListener('load', ready);
        script?.removeEventListener('error', failed);
        lifetime.signal.removeEventListener('abort', aborted);
      };
      lifetime.signal.addEventListener('abort', aborted, { once: true });
      if (typeof window.grecaptcha?.ready === 'function' && (!captchaReloadRequired || typeof window.grecaptcha.execute === 'function')) { ready(); return; }
      if (captchaReloadRequired) { script?.remove(); script = null; }
      if (!script) {
        script = element('script');
        script.id = 'recaptcha-v3-script';
        script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}&hl=${locale}`;
        script.async = true;
        ownedScript = script;
      }
      script.addEventListener('load', ready, { once: true });
      script.addEventListener('error', failed, { once: true });
      if (ownedScript && !script.isConnected) document.head.append(script);
    }).catch(error => { captchaPromise = null; throw error; });
    return captchaPromise;
  }

  function unlock() {
    if (!scrollLock) return;
    document.documentElement.style.overflow = scrollLock.rootOverflow;
    document.body.style.overflow = scrollLock.bodyOverflow;
    window.scrollTo({ left: scrollLock.x, top: scrollLock.y, behavior: 'instant' });
    scrollLock = null;
  }
  function closed() {
    // Native close events are queued; an old close must not cancel a new session.
    if (dialog.open) return;
    motion.cancel();
    generation += 1;
    activeRequest?.abort();
    activeRequest = null;
    setBusy(false);
    unlock();
    if (!disposed && trigger?.isConnected) {
      // Opening from the mobile menu closes its <details>; return to its summary.
      const menu = trigger.closest('details:not([open])');
      const candidate = menu?.querySelector(':scope > summary') || trigger;
      const visible = node => node?.isConnected && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden' && !node.closest('[inert]');
      const target = visible(candidate) ? candidate : [...document.querySelectorAll('.site-header [data-contact-open]')].find(visible);
      target?.focus({ preventScroll: true });
    }
    trigger = null;
  }
  function closeDialog() {
    if (!dialog.open) return;
    motion.cancel();
    dialog.close();
    closed();
  }
  function openDialog(opener, { instant = false } = {}) {
    if (disposed || dialog.open) return;
    trigger = opener;
    ++generation;
    scrollLock = {
      x: window.scrollX, y: window.scrollY,
      rootOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
    };
    const mobile = window.matchMedia('(max-width: 600px)').matches || document.documentElement.dataset.renderer === 'mobile';
    // Avoid summoning the phone keyboard while the panel is entering, including
    // on reopen when a browser may remember the previously focused text field.
    close.autofocus = mobile && !instant;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    surface.scrollTop = 0;
    (close.autofocus ? close : inputs.get('firstName')).focus({ preventScroll: true });
    showStatus('');
    motion.enter({ instant });
    // Warm up quietly; submission retries and reports any actual failure.
    void loadCaptcha().catch(() => {});
  }
  document.addEventListener('pointerdown', event => {
    const opener = event.target.closest?.('[data-contact-open]');
    pointerActivation = opener ? { opener, time: event.timeStamp } : null;
  }, { ...events, capture: true });
  const clearPointerActivation = () => { pointerActivation = null; };
  document.addEventListener('pointercancel', clearPointerActivation, events);
  document.addEventListener('keydown', clearPointerActivation, { ...events, capture: true });
  document.addEventListener('click', event => {
    const opener = event.target.closest?.('[data-contact-open]');
    const pointer = pointerActivation;
    pointerActivation = null;
    if (!opener || event.defaultPrevented || event.button !== 0) return;
    event.preventDefault();
    // Touch-generated clicks can have detail=0. A matching recent pointer press
    // distinguishes them from keyboard and assistive activation.
    const fromPointer = Boolean(event.pointerType) || (pointer?.opener === opener && event.timeStamp - pointer.time < 1500);
    openDialog(opener, { instant: event.detail === 0 && !fromPointer });
  }, { ...events, capture: true });
  close.addEventListener('click', closeDialog, events);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); }, events);
  dialog.addEventListener('close', closed, events);
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') event.stopPropagation();
  }, events);
  dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog; }, events);
  dialog.addEventListener('click', event => {
    if (backdropStart && event.target === dialog) closeDialog();
    backdropStart = false;
  }, events);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || disposed || !dialog.open) return;
    let firstInvalid;
    for (const field of FIELDS) {
      touched.add(field.name);
      if (!validate(field) && !firstInvalid) firstInvalid = inputs.get(field.name);
    }
    if (firstInvalid) { firstInvalid.focus(); return; }
    const version = generation;
    const controller = new AbortController();
    activeRequest = controller;
    const payload = Object.fromEntries(FIELDS.map(field => [field.name, inputs.get(field.name).value.trim()]));
    setBusy(true);
    showStatus(COPY.verifying);
    let requestTimer;
    try {
      const captcha = await bounded(loadCaptcha, 12500, controller.signal, COPY.verification);
      if (!current(version)) return;
      const token = await bounded(() => captcha.execute(key, { action: 'contact_submit' }), 12000, controller.signal, COPY.verification)
        .catch(error => { if (error.name === 'AbortError') throw error; throw new Error(COPY.verification); });
      if (!current(version)) return;
      if (typeof token !== 'string' || !token.trim()) throw new Error(COPY.verification);
      showStatus(COPY.sending);
      requestTimer = setTimeout(() => controller.abort(), 15000);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, locale, recaptchaToken: token }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!current(version)) return;
      if (!response.ok) {
        if (result?.errors && typeof result.errors === 'object') {
          for (const field of FIELDS) {
            if (typeof result.errors[field.name] === 'string') setError(field.name, result.errors[field.name]);
          }
        }
        const message = typeof result?.message === 'string' && /recaptcha/i.test(result.message) ? COPY.verification : COPY.error;
        throw new Error(message);
      }
      // Vite's HTML fallback (or a proxy error) is never a successful submission.
      if (result?.ok !== true) throw new Error(COPY.error);
      form.reset();
      touched.clear();
      for (const field of FIELDS) setError(field.name);
      showStatus(COPY.success, 'success');
    } catch (error) {
      if (!current(version)) return;
      const allowed = [COPY.unavailable, COPY.verification, COPY.error];
      showStatus(error.name === 'AbortError' ? COPY.timeout : allowed.includes(error.message) ? error.message : COPY.error, 'error');
    } finally {
      clearTimeout(requestTimer);
      if (current(version)) { activeRequest = null; setBusy(false); }
    }
  }, events);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      motion.dispose();
      closeDialog();
      generation += 1;
      activeRequest?.abort();
      lifetime.abort();
      captchaCleanup();
      unlock();
      dialog.remove();
    },
  };
}
