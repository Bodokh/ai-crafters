'use client';

import React, { useState, useRef, useCallback, ChangeEvent, FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import type { Value as PhoneValue } from 'react-phone-number-input';

type ApplicationFormState = {
  fullName: string;
  phone: PhoneValue;
  email: string;
  cv: File | null;
  linkedinUrl: string;
  heardFrom: string;
  heardFromOther: string;
};

const initialFormState: ApplicationFormState = {
  fullName: '',
  phone: '' as PhoneValue,
  email: '',
  cv: null,
  linkedinUrl: '',
  heardFrom: '',
  heardFromOther: '',
};

type ApplicationFormErrors = Partial<Record<keyof ApplicationFormState, string>>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
}

export const ApplicationDialog: React.FC<ApplicationDialogProps> = ({
  open,
  onOpenChange,
  jobTitle,
}) => {
  const t = useTranslations('careers.applicationForm');
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const alignmentClass = dir === 'rtl' ? 'text-right' : 'text-left';

  const [formData, setFormData] = useState<ApplicationFormState>(initialFormState);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { ref: recaptchaRef, executeRecaptcha } = useRecaptcha();

  const dialogContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      recaptchaRef(node);
    },
    [recaptchaRef]
  );

  const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
  };

  const isValidFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: t('validation.cvSize') };
    }
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: t('validation.cvFormat') };
    }
    return { valid: true };
  };

  const validate = (): ApplicationFormErrors => {
    const validationErrors: ApplicationFormErrors = {};
    
    if (!formData.fullName.trim()) {
      validationErrors.fullName = t('validation.fullName');
    }
    if (!formData.phone) {
      validationErrors.phone = t('validation.phone');
    }
    if (!formData.email.trim()) {
      validationErrors.email = t('validation.email');
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      validationErrors.email = t('validation.emailFormat');
    }
    if (!formData.cv) {
      validationErrors.cv = t('validation.cv');
    } else {
      const fileValidation = isValidFile(formData.cv);
      if (!fileValidation.valid) {
        validationErrors.cv = fileValidation.error;
      }
    }
    if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
      validationErrors.linkedinUrl = t('validation.linkedinUrl');
    }
    
    return validationErrors;
  };

  const handleChange = (field: keyof ApplicationFormState) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handlePhoneChange = (value: PhoneValue) => {
    setFormData((prev) => ({ ...prev, phone: value || ('' as PhoneValue) }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, heardFrom: value, heardFromOther: '' }));
    setErrors((prev) => ({ ...prev, heardFrom: undefined }));
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handleFileSelect = (file: File) => {
    const validation = isValidFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, cv: validation.error }));
      return;
    }
    setFormData((prev) => ({ ...prev, cv: file }));
    setErrors((prev) => ({ ...prev, cv: undefined }));
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, cv: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      const recaptchaToken = await executeRecaptcha('careers_apply');

      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('phone', formData.phone || '');
      submitData.append('email', formData.email);
      submitData.append('cv', formData.cv!);
      submitData.append('linkedinUrl', formData.linkedinUrl);
      submitData.append('heardFrom', formData.heardFrom);
      submitData.append('heardFromOther', formData.heardFromOther);
      submitData.append('jobTitle', jobTitle);
      submitData.append('locale', locale);
      if (recaptchaToken) {
        submitData.append('recaptchaToken', recaptchaToken);
      }

      const response = await fetch('/api/careers', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        if (payload?.errors) {
          setErrors((prev) => ({ ...prev, ...payload.errors }));
        }
        throw new Error('Failed to submit application');
      }

      setStatus('success');
      setFormData(initialFormState);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        className="max-w-md max-h-[90vh] overflow-y-auto bg-card border-border"
        dir={dir}
      >
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold text-foreground ${alignmentClass}`}>
            {t('title')}
          </DialogTitle>
          <DialogDescription className={`text-muted-foreground ${alignmentClass}`}>
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-2">{t('success')}</p>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="mt-4"
            >
              {locale === 'he' ? 'סגור' : 'Close'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className={`text-xs font-mono text-cyan-500 uppercase tracking-wider ${alignmentClass}`}>
                {t('fullName')} *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                className={`bg-muted/50 border ${errors.fullName ? 'border-red-500' : 'border-border'} focus:border-cyan-500`}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && (
                <p className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className={`text-xs font-mono text-cyan-500 uppercase tracking-wider ${alignmentClass}`}>
                {t('phone')} *
              </Label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                defaultCountry="IL"
                className={`${errors.phone ? '[&_input]:border-red-500' : ''}`}
              />
              {errors.phone && (
                <p className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className={`text-xs font-mono text-cyan-500 uppercase tracking-wider ${alignmentClass}`}>
                {t('email')} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                className={`bg-muted/50 border ${errors.email ? 'border-red-500' : 'border-border'} focus:border-cyan-500`}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <Label className={`text-xs font-mono text-cyan-500 uppercase tracking-wider ${alignmentClass}`}>
                {t('cv')} *
              </Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : errors.cv
                    ? 'border-red-500 bg-red-500/5'
                    : 'border-border hover:border-cyan-500/50 hover:bg-muted/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                {formData.cv ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-500" />
                      <span className="text-sm text-foreground truncate max-w-[200px]">
                        {formData.cv.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t('cvUpload')}</p>
                  </div>
                )}
              </div>
              {errors.cv && (
                <p className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                  {errors.cv}
                </p>
              )}
            </div>

            {/* LinkedIn URL (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className={`text-xs font-mono text-cyan-500 uppercase tracking-wider ${alignmentClass}`}>
                {t('linkedinUrl')}
              </Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleChange('linkedinUrl')}
                placeholder="https://linkedin.com/in/..."
                className={`bg-muted/50 border ${errors.linkedinUrl ? 'border-red-500' : 'border-border'} focus:border-cyan-500`}
                aria-invalid={Boolean(errors.linkedinUrl)}
              />
              {errors.linkedinUrl && (
                <p className={`text-xs text-red-400 font-mono ${alignmentClass}`}>
                  {errors.linkedinUrl}
                </p>
              )}
            </div>

            {/* How did you hear about us (Optional) */}
            <div className="space-y-2">
              <Label className={`text-xs font-mono text-cyan-500 uppercase tracking-wider ${alignmentClass}`}>
                {t('heardFrom')}
              </Label>
              <Select value={formData.heardFrom} onValueChange={handleSelectChange}>
                <SelectTrigger className="bg-muted/50 border border-border focus:border-cyan-500">
                  <SelectValue placeholder={t('heardFromPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">{t('heardFromOptions.linkedin')}</SelectItem>
                  <SelectItem value="google">{t('heardFromOptions.google')}</SelectItem>
                  <SelectItem value="other">{t('heardFromOptions.other')}</SelectItem>
                </SelectContent>
              </Select>
              {formData.heardFrom === 'other' && (
                <Input
                  type="text"
                  value={formData.heardFromOther}
                  onChange={handleChange('heardFromOther')}
                  placeholder={t('heardFromOther')}
                  className="mt-2 bg-muted/50 border border-border focus:border-cyan-500"
                />
              )}
            </div>

            {/* Error Status */}
            {status === 'error' && (
              <div
                className={`text-sm font-mono text-red-400 ${alignmentClass}`}
                role="status"
                aria-live="polite"
              >
                {t('error')}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-muted disabled:text-muted-foreground text-white font-bold tracking-widest uppercase transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('sending')}
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

