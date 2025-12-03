import { NextResponse } from 'next/server';
import { Resend } from 'resend';

type RecaptchaResponse = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

const CAREERS_EMAIL_RECIPIENT = process.env.CAREERS_EMAIL_RECIPIENT || 'careers@aicrafters.com';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_SCORE_THRESHOLD = 0.5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'];

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('RECAPTCHA_SECRET_KEY is not configured, skipping verification');
    return { success: true, score: 1 };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data: RecaptchaResponse = await response.json();

    return {
      success: data.success && (data.score ?? 0) >= RECAPTCHA_SCORE_THRESHOLD,
      score: data.score ?? 0,
    };
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return { success: false, score: 0 };
  }
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
}

function isValidFileType(file: File): boolean {
  const extension = getFileExtension(file.name);
  return ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_FILE_EXTENSIONS.includes(extension);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Extract fields
    const fullName = (formData.get('fullName') as string)?.trim() || '';
    const phone = (formData.get('phone') as string)?.trim() || '';
    const email = (formData.get('email') as string)?.trim().toLowerCase() || '';
    const linkedinUrl = (formData.get('linkedinUrl') as string)?.trim() || '';
    const heardFrom = (formData.get('heardFrom') as string)?.trim() || '';
    const heardFromOther = (formData.get('heardFromOther') as string)?.trim() || '';
    const jobTitle = (formData.get('jobTitle') as string)?.trim() || '';
    const locale = (formData.get('locale') as string)?.trim() || '';
    const recaptchaToken = (formData.get('recaptchaToken') as string)?.trim() || '';
    const cvFile = formData.get('cv') as File | null;

    // Verify reCAPTCHA
    if (RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { message: 'reCAPTCHA verification required.' },
          { status: 400 }
        );
      }

      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        console.warn(`reCAPTCHA verification failed. Score: ${recaptchaResult.score}`);
        return NextResponse.json(
          { message: 'reCAPTCHA verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Validation
    const errors: Record<string, string> = {};
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!fullName) errors.fullName = 'Full name is required.';
    if (!phone) errors.phone = 'Phone number is required.';
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format.';
    }

    if (!cvFile || cvFile.size === 0) {
      errors.cv = 'CV file is required.';
    } else {
      if (cvFile.size > MAX_FILE_SIZE) {
        errors.cv = 'CV file must be smaller than 5MB.';
      }
      if (!isValidFileType(cvFile)) {
        errors.cv = 'CV must be a PDF or Word document.';
      }
    }

    if (linkedinUrl && !linkedinUrl.includes('linkedin.com')) {
      errors.linkedinUrl = 'Please enter a valid LinkedIn URL.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Read CV file as buffer
    const cvBuffer = Buffer.from(await cvFile!.arrayBuffer());
    const cvFilename = cvFile!.name;

    // Prepare email content
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Missing RESEND_API_KEY environment variable.');
      return NextResponse.json({ message: 'Email service unavailable.' }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const toAddresses = CAREERS_EMAIL_RECIPIENT
      .split(',')
      .map((recipient) => recipient.trim())
      .filter(Boolean);

    if (!toAddresses.length) {
      console.error('CAREERS_EMAIL_RECIPIENT is not configured.');
      return NextResponse.json({ message: 'Email service unavailable.' }, { status: 503 });
    }

    const heardFromText = heardFrom === 'other' && heardFromOther
      ? `Other: ${heardFromOther}`
      : heardFrom;

    await resend.emails.send({
      from: process.env.CONTACT_FORM_FROM || 'AI Crafters <notifications@updates.aicrafters.com>',
      to: toAddresses,
      subject: `New Job Application: ${jobTitle || 'General'} - ${fullName}`,
      text: [
        `=== Job Application ===`,
        '',
        `Position: ${jobTitle || 'Not specified'}`,
        '',
        `--- Applicant Details ---`,
        `Full Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        linkedinUrl ? `LinkedIn: ${linkedinUrl}` : null,
        heardFromText ? `How they heard about us: ${heardFromText}` : null,
        locale ? `Locale: ${locale}` : null,
        '',
        `--- CV Attached ---`,
        `Filename: ${cvFilename}`,
      ]
        .filter((line) => line !== null)
        .join('\n'),
      attachments: [
        {
          filename: cvFilename,
          content: cvBuffer,
        },
      ],
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to handle job application submission.', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

