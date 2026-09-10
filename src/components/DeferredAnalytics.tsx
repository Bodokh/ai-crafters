'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

type DeferredAnalyticsProps = {
  measurementId: string;
};

const interactionEvents = ['pointerdown', 'touchstart', 'keydown', 'scroll'] as const;

export function DeferredAnalytics({ measurementId }: DeferredAnalyticsProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) {
      return;
    }

    const enableAnalytics = () => setEnabled(true);
    const options: AddEventListenerOptions = { once: true, passive: true };

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, enableAnalytics, options);
    });

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, enableAnalytics);
      });
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        id="google-ads-library"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
