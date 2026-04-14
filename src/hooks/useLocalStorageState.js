import { useEffect, useState } from "react";

export default function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors and keep default
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
