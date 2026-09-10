import { cp } from 'node:fs/promises';

// Next's standalone server needs these static files alongside its traced code.
// This includes the generated homepage, so standalone and Vercel serve one site.
await cp(new URL('../public/', import.meta.url), new URL('../.next/standalone/public/', import.meta.url), { recursive: true });
await cp(new URL('../.next/static/', import.meta.url), new URL('../.next/standalone/.next/static/', import.meta.url), { recursive: true });
