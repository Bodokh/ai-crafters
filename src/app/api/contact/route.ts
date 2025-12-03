import { NextResponse } from 'next/server';
import { Resend } from 'resend';

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  locale?: string;
  recaptchaToken?: string;
};

type RecaptchaResponse = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

const CONTACT_FORM_RECIPIENT = process.env.CONTACT_FORM_RECIPIENT;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_SCORE_THRESHOLD = 0.5;

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

const sanitize = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const missingFieldMessage = 'This field is required.';
const invalidEmailMessage = 'Enter a valid email address.';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Partial<ContactPayload> | null;

    if (!body) {
      return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 });
    }

    const firstName = sanitize(body.firstName);
    const lastName = sanitize(body.lastName);
    const email = sanitize(body.email).toLowerCase();
    const message = sanitize(body.message);
    const locale = sanitize(body.locale);
    const recaptchaToken = sanitize(body.recaptchaToken);

    // Verify reCAPTCHA token if secret key is configured
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

    const errors: Record<string, string> = {};

    if (!firstName) errors.firstName = missingFieldMessage;
    if (!lastName) errors.lastName = missingFieldMessage;
    if (!email) {
      errors.email = missingFieldMessage;
    } else if (!emailRegex.test(email)) {
      errors.email = invalidEmailMessage;
    }
    if (!message) errors.message = missingFieldMessage;

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Missing RESEND_API_KEY environment variable.');
      return NextResponse.json({ message: 'Email service unavailable.' }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const toAddresses = (CONTACT_FORM_RECIPIENT || 'eran@devshif.biz')
      .split(',')
      .map((recipient) => recipient.trim())
      .filter(Boolean);

    if (!toAddresses.length) {
      console.error('CONTACT_FORM_RECIPIENT is not configured.');
      return NextResponse.json({ message: 'Email service unavailable.' }, { status: 503 });
    }

    await resend.emails.send({
      from: process.env.CONTACT_FORM_FROM || 'AI Crafters <notifications@updates.aicrafters.com>',
      to: toAddresses,
    //   reply_to: email,
      subject: `New contact request from ${firstName}`,
      text: [
        `Name: ${firstName}`,
        `Company: ${lastName}`,
        `Email: ${email}`,
        locale ? `Locale: ${locale}` : null,
        '',
        'Message:',
        message,
      ]
        .filter(Boolean)
        .join('\n'),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to handle contact submission.', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

