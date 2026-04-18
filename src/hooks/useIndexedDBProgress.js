import { useCallback, useEffect, useState } from "react";

const DB_NAME = "gft-db";
const DB_VERSION = 2;
const STORE = "progress";
const RECORD_ID = "gft-progress";
const LEGACY_KEY = "gft-progress";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getProgressRecord() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(RECORD_ID);

    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function putProgressRecord(value) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ id: RECORD_ID, value });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export default function useIndexedDBProgress(defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (typeof window === "undefined") return;

      try {
        const stored = await getProgressRecord();
        if (cancelled) return;

        if (stored !== null) {
          setValue(stored);
          return;
        }

        const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
        if (!legacyRaw) return;

        const legacyValue = JSON.parse(legacyRaw);
        if (cancelled) return;

        setValue(legacyValue);
        await putProgressRecord(legacyValue);
        window.localStorage.removeItem(LEGACY_KEY);
      } catch {
        // Keep default value on failure.
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const setStoredValue = useCallback((nextValue) => {
    setValue((prev) => {
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(prev) : nextValue;

      putProgressRecord(resolvedValue).catch(() => {});
      return resolvedValue;
    });
  }, []);

  return [value, setStoredValue, hydrated];
}
