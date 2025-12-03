'use client';

import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, PhoneCall, Send, SendHorizonal, Terminal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRecaptcha } from '@/hooks/useRecaptcha';

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

const initialFormState: ContactFormState = {
  firstName: '',
  lastName: '',
  email: '',
  message: '',
};

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>;

export const Contact = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const SendIcon = dir === 'rtl' ? SendHorizonal : Send;
  const alignmentClass = dir === 'rtl' ? 'text-right' : 'text-left';

  const [formData, setFormData] = useState<ContactFormState>(initialFormState);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { ref: recaptchaRef, executeRecaptcha } = useRecaptcha();

  // Combine refs for the section element
  const sectionRef = useCallback(
    (node: HTMLElement | null) => {
      recaptchaRef(node);
    },
    [recaptchaRef]
  );

  const validate = (): ContactFormErrors => {
    const validationErrors: ContactFormErrors = {};
    if (!formData.firstName.trim()) {
      validationErrors.firstName = t('contact.form.validation.firstName');
    }
    if (!formData.lastName.trim()) {
      validationErrors.lastName = t('contact.form.validation.lastName');
    }
    if (!formData.email.trim()) {
      validationErrors.email = t('contact.form.validation.email');
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      validationErrors.email = t('contact.form.validation.emailFormat');
    }
    if (!formData.message.trim()) {
      validationErrors.message = t('contact.form.validation.message');
    }
    return validationErrors;
  };

  const handleChange =
    (field: keyof ContactFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      if (status !== 'idle') {
        setStatus('idle');
      }
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      // Execute reCAPTCHA and get token
      const recaptchaToken = await executeRecaptcha('contact_submit');

      const response = await fetch(`/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, locale, recaptchaToken }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        if (payload?.errors) {
          setErrors((prev) => ({ ...prev, ...payload.errors }));
        }
        throw new Error('Failed to submit contact form');
      }

      setStatus('success');
      setFormData(initialFormState);
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="py-24 bg-background relative overflow-hidden border-t border-border">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 text-cyan-500 mb-4 font-mono text-sm">
                <Terminal size={16} />
                <span>root@aicrafters:~# ./initiate_automation.sh</span>
            </div>
            <h2 className="font-display font-bold text-5xl text-foreground mb-6 leading-tight">
                <span className="dark:scanline-effect inline-block">{t('contact.title.1')}</span> <br />
                <span className="dark:scanline-effect inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400 animate-pulse">
                    {t('contact.title.2')}
                </span>
            </h2>
            <p className={`text-muted-foreground text-lg mb-8 font-light font-sans ${dir === 'rtl' ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-border`}>
              {t('contact.desc')}
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Mail, text: "automate@aicrafters.com", href: "mailto:automate@aicrafters.com" },
                { icon: PhoneCall, text: t('contact.coverage'), href: `tel:${t('contact.coverage')}` },
                { icon: MapPin, text: t('contact.location') }
              ].map((item, idx) => (
                <a key={idx} href={item.href} className="flex items-center gap-4 text-foreground group p-4 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <div className="text-brand-500 group-hover:text-cyan-400 transition-colors">
                    <item.icon size={24} />
                  </div>
                  <span className="text-lg font-mono">{item.text}</span>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-1 rounded-3xl bg-gradient-to-b from-muted to-background"
          >
            <div className="bg-card rounded-[22px] p-8 border border-border">
                <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider" htmlFor="contact-first-name">
                        {t('contact.form.firstName')}
                    </label>
                    <input
                        id="contact-first-name"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange('firstName')}
                        className={`w-full bg-muted/50 border rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-cyan-500 focus:bg-muted transition-all font-sans ${errors.firstName ? 'border-red-500' : 'border-border'}`}
                        aria-invalid={Boolean(errors.firstName)}
                        aria-describedby={errors.firstName ? 'contact-first-name-error' : undefined}
                    />
                    {errors.firstName && (
                        <p id="contact-first-name-error" className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                        {errors.firstName}
                        </p>
                    )}
                    </div>
                    <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider" htmlFor="contact-last-name">
                        {t('contact.form.lastName')}
                    </label>
                    <input
                        id="contact-last-name"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange('lastName')}
                        className={`w-full bg-muted/50 border rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-cyan-500 focus:bg-muted transition-all font-sans ${errors.lastName ? 'border-red-500' : 'border-border'}`}
                        aria-invalid={Boolean(errors.lastName)}
                        aria-describedby={errors.lastName ? 'contact-last-name-error' : undefined}
                    />
                    {errors.lastName && (
                        <p id="contact-last-name-error" className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                        {errors.lastName}
                        </p>
                    )}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider" htmlFor="contact-email">
                    {t('contact.form.email')}
                    </label>
                    <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className={`w-full bg-muted/50 border rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-cyan-500 focus:bg-muted transition-all font-sans ${errors.email ? 'border-red-500' : 'border-border'}`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    />
                    {errors.email && (
                    <p id="contact-email-error" className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                        {errors.email}
                    </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider" htmlFor="contact-message">
                    {t('contact.form.message')}
                    </label>
                    <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange('message')}
                    className={`w-full bg-muted/50 border rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-cyan-500 focus:bg-muted transition-all font-sans ${errors.message ? 'border-red-500' : 'border-border'}`}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    ></textarea>
                    {errors.message && (
                    <p id="contact-message-error" className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                        {errors.message}
                    </p>
                    )}
                </div>

                {status !== 'idle' && (
                    <div
                    className={`text-sm font-mono ${alignmentClass} ${
                        status === 'success' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                    role="status"
                    aria-live="polite"
                    >
                    {status === 'success' ? t('contact.form.success') : t('contact.form.error')}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="dark:scanline-effect w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-muted disabled:text-muted-foreground text-white font-bold tracking-widest uppercase rounded-none transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] group"
                >
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                    <SendIcon
                    size={18}
                    className={`transition-transform ${dir === 'rtl' ? 'rotate-180' : 'group-hover:translate-x-1'} ${
                        isSubmitting ? 'opacity-50' : ''
                    }`}
                    />
                </button>
                </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
