import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create middleware with routing config that has localeDetection disabled
// This ensures Hebrew is always the default and never switches automatically
export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(he|en)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)']
};
