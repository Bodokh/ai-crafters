import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const localize = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/en' || path === '/en/') {
    const destination = request.nextUrl.clone();
    destination.pathname = '/';
    return NextResponse.redirect(destination, 308);
  }
  if (path === '/' || path === '/he' || path === '/he/') {
    // Serve the complete, pretranslated homepage document without the old
    // React homepage or its layout. Other pages keep their existing Next app.
    const destination = request.nextUrl.clone();
    destination.pathname = path.startsWith('/he') ? '/_home/he/index.html' : '/_home/index.html';
    return NextResponse.rewrite(destination);
  }
  return localize(request);
}

export const config = {
  // Match internationalized pages once while excluding APIs and static assets.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
