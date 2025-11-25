import { NextResponse } from 'next/server';
import { Resend } from 'resend';

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  locale?: string;
};

const CONTACT_FORM_RECIPIENT = process.env.CONTACT_FORM_RECIPIENT;

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

