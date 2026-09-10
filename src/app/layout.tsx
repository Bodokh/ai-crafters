import { ReactNode } from 'react';
import './globals.css';
import '../styles/site.css';
import '../styles/site-shell.css';
import '../styles/site-footer.css';
import '../styles/site-contact.css';
import '../styles/use-cases.css';
import '../styles/careers-terms.css';
import '../styles/editorial.css';

export default function LocaleLayout({
  children
}: {
  children: ReactNode;
}) {
  return children;
}
