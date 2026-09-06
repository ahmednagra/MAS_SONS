'use client';
import { useCallback, useSyncExternalStore } from 'react';

// The buyer's chosen destination port, remembered per browser. Pure convenience —
// it only changes which "C&F to …" link a card shows and what the request form
// pre-selects. Never trusted server-side; the form re-validates the code.
const STORAGE_KEY = 'mas:destination';
const EVENT = 'mas:destination-change';

const read = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

export function useDestinationPreference() {
  // Server snapshot is always null so the first client paint matches SSR; the real
  // value applies right after hydration without a mismatch warning.
  const code = useSyncExternalStore(subscribe, read, () => null);

  const setCode = useCallback((next: string | null) => {
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked — the selection still applies for this page via the event.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [code, setCode] as const;
}
