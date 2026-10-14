"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Form state that auto-saves to localStorage (debounced) so users never lose input.
 */
export function usePersistentForm<T extends Record<string, unknown>>(key: string, initial: T) {
  const storageKey = `aml:form:${key}`;
  const [values, setValues] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setValues({ ...initialRef.current, ...(JSON.parse(raw) as Partial<T>) });
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(values));
      } catch {
        /* storage may be unavailable (private mode) */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [values, hydrated, storageKey]);

  const set = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialRef.current);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const replace = useCallback((next: Partial<T>) => setValues({ ...initialRef.current, ...next }), []);

  return { values, set, reset, replace, hydrated };
}
