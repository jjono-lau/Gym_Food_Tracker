import { useCallback, useEffect, useState } from "react";

const DB_NAME = "gft-db";
const DB_VERSION = 2;
const STORE = "progress";
const RECORD_ID = "gft-progress";
const LEGACY_KEY = "gft-progress";
const WORKOUT_DIFFICULTIES = ["easy", "medium", "hard"];
const DIFFICULTY_TO_VALUE = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const makeId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

function getDifficultyFromValue(value) {
  if (value >= DIFFICULTY_TO_VALUE.hard) return "hard";
  if (value >= DIFFICULTY_TO_VALUE.medium) return "medium";
  return "easy";
}

function normalizeWorkoutEntry(item) {
  const difficulty = WORKOUT_DIFFICULTIES.includes(item?.difficulty)
    ? item.difficulty
    : getDifficultyFromValue(item?.value ?? 1);

  return {
    ...item,
    id: item?.id ?? makeId(),
    dayKey: item?.dayKey ?? item?.label ?? makeId(),
    difficulty,
    value: DIFFICULTY_TO_VALUE[difficulty],
  };
}

function normalizeSeries(entries = []) {
  return entries.map((item) => ({
    ...item,
    id: item?.id ?? makeId(),
    dayKey: item?.dayKey ?? item?.label ?? makeId(),
  }));
}

function normalizeProgress(value) {
  return {
    workouts: normalizeSeries(value?.workouts ?? []).map(normalizeWorkoutEntry),
    weight: normalizeSeries(value?.weight ?? []),
    habits: normalizeSeries(value?.habits ?? []),
  };
}

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
  const [value, setValue] = useState(() => normalizeProgress(defaultValue));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (typeof window === "undefined") return;

      try {
        const stored = await getProgressRecord();
        if (cancelled) return;

        if (stored !== null) {
          setValue(normalizeProgress(stored));
          return;
        }

        const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
        if (!legacyRaw) return;

        const legacyValue = JSON.parse(legacyRaw);
        if (cancelled) return;

        const normalizedLegacyValue = normalizeProgress(legacyValue);
        setValue(normalizedLegacyValue);
        await putProgressRecord(normalizedLegacyValue);
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
      const normalizedValue = normalizeProgress(resolvedValue);

      putProgressRecord(normalizedValue).catch(() => {});
      return normalizedValue;
    });
  }, []);

  return [value, setStoredValue, hydrated];
}
