'use client';

import React, { useState, useRef, useCallback, ChangeEvent, FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Upload, X, FileText, Loader2, ArrowUpRight } from 'lucide-react';
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
        className="aic-application-dialog"
        dir={dir}
      >
        <DialogHeader className="aic-application-dialog__header">
          <DialogTitle className={`aic-application-dialog__title ${alignmentClass}`}>
            {t('title')}
          </DialogTitle>
          <DialogDescription className={`aic-application-dialog__description ${alignmentClass}`}>
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="aic-application-dialog__success">
            <div className="aic-application-dialog__success-icon">
              <svg
                className="w-8 h-8"
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
            <p className="aic-application-dialog__success-message">{t('success')}</p>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="aic-button aic-button--secondary"
            >
              {locale === 'he' ? 'סגור' : 'Close'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className={`aic-application-label ${alignmentClass}`}>
                {t('fullName')} *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                className={`aic-application-input ${errors.fullName ? 'is-invalid' : ''}`}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && (
                <p className={`aic-application-error ${alignmentClass}`}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className={`aic-application-label ${alignmentClass}`}>
                {t('phone')} *
              </Label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                defaultCountry="IL"
                className={`aic-application-phone ${errors.phone ? 'is-invalid' : ''}`}
              />
              {errors.phone && (
                <p className={`aic-application-error ${alignmentClass}`}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className={`aic-application-label ${alignmentClass}`}>
                {t('email')} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                className={`aic-application-input ${errors.email ? 'is-invalid' : ''}`}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className={`aic-application-error ${alignmentClass}`}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <Label className={`aic-application-label ${alignmentClass}`}>
                {t('cv')} *
              </Label>
              <div
                className={`aic-application-upload ${isDragging ? 'is-dragging' : errors.cv ? 'is-invalid' : ''}`}
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
                      <FileText className="aic-application-upload__file-icon" />
                      <span className="aic-application-upload__filename">
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
                      className="aic-application-upload__remove"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Upload className="aic-application-upload__icon" />
                    <p className="aic-application-upload__hint">{t('cvUpload')}</p>
                  </div>
                )}
              </div>
              {errors.cv && (
                <p className={`aic-application-error ${alignmentClass}`}>
                  {errors.cv}
                </p>
              )}
            </div>

            {/* LinkedIn URL (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className={`aic-application-label ${alignmentClass}`}>
                {t('linkedinUrl')}
              </Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleChange('linkedinUrl')}
                placeholder="https://linkedin.com/in/..."
                className={`aic-application-input ${errors.linkedinUrl ? 'is-invalid' : ''}`}
                aria-invalid={Boolean(errors.linkedinUrl)}
              />
              {errors.linkedinUrl && (
                <p className={`aic-application-error ${alignmentClass}`}>
                  {errors.linkedinUrl}
                </p>
              )}
            </div>

            {/* How did you hear about us (Optional) */}
            <div className="space-y-2">
              <Label className={`aic-application-label ${alignmentClass}`}>
                {t('heardFrom')}
              </Label>
              <Select value={formData.heardFrom} onValueChange={handleSelectChange}>
                <SelectTrigger className="aic-application-input">
                  <SelectValue placeholder={t('heardFromPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="aic-application-select">
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
                  className="aic-application-input mt-2"
                />
              )}
            </div>

            {/* Error Status */}
            {status === 'error' && (
              <div
                className={`aic-application-error ${alignmentClass}`}
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
              className="aic-button aic-application-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('sending')}
                </>
              ) : (
                <>
                  {t('submit')}
                  <ArrowUpRight size={19} aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
