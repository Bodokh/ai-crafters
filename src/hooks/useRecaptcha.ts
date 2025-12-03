'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v3-script';
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type RecaptchaState = {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Hook to dynamically load reCAPTCHA v3 when an element becomes visible.
 * Returns a ref to attach to the observed element and an execute function.
 */
export function useRecaptcha() {
  const [state, setState] = useState<RecaptchaState>({
    isLoaded: false,
    isLoading: false,
    error: null,
  });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasLoadedRef = useRef(false);

  const loadScript = useCallback(() => {
    // Prevent duplicate loads
    if (hasLoadedRef.current || document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      // Script already exists, check if grecaptcha is ready
      if (window.grecaptcha) {
        setState({ isLoaded: true, isLoading: false, error: null });
      }
      return;
    }

    if (!SITE_KEY) {
      console.warn('reCAPTCHA site key is not configured');
      setState({
        isLoaded: false,
        isLoading: false,
        error: new Error('reCAPTCHA site key not configured'),
      });
      return;
    }

    hasLoadedRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true }));

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setState({ isLoaded: true, isLoading: false, error: null });
      });
    };

    script.onerror = () => {
      hasLoadedRef.current = false;
      setState({
        isLoaded: false,
        isLoading: false,
        error: new Error('Failed to load reCAPTCHA script'),
      });
    };

    document.head.appendChild(script);
  }, []);

  const observeElement = useCallback(
    (element: HTMLElement | null) => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!element) return;

      // If already loaded, no need to observe
      if (state.isLoaded || hasLoadedRef.current) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            loadScript();
            observerRef.current?.disconnect();
          }
        },
        {
          rootMargin: '100px', // Load slightly before element is visible
          threshold: 0,
        }
      );

      observerRef.current.observe(element);
    },
    [loadScript, state.isLoaded]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!SITE_KEY) {
        console.warn('reCAPTCHA site key is not configured');
        return null;
      }

      // If not loaded yet, try to load now
      if (!state.isLoaded && !hasLoadedRef.current) {
        loadScript();
        // Wait for script to load (with timeout)
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('reCAPTCHA load timeout'));
          }, 5000);

          const checkReady = () => {
            if (window.grecaptcha) {
              clearTimeout(timeout);
              window.grecaptcha.ready(resolve);
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      try {
        const token = await window.grecaptcha.execute(SITE_KEY, { action });
        return token;
      } catch (error) {
        console.error('reCAPTCHA execution failed:', error);
        return null;
      }
    },
    [state.isLoaded, loadScript]
  );

  return {
    ref: observeElement,
    executeRecaptcha,
    isLoaded: state.isLoaded,
    isLoading: state.isLoading,
    error: state.error,
  };
}

