import { useEffect, useState, useCallback } from "react";

const DB_NAME = "gft-db";
const STORE = "images";
const DB_VERSION = 2;
const LEGACY_KEY = "gft-transformations";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllImages() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function putImage(img) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(img);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteImage(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function clearAllImages() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function sortByCreatedAt(images) {
  return [...images].sort((a, b) => {
    const ta = parseInt(a.id?.split("-")[0] || "0", 10);
    const tb = parseInt(b.id?.split("-")[0] || "0", 10);
    return ta - tb;
  });
}

export function useIndexedDBImages() {
  const [images, setImagesState] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let storedImages = await getAllImages();

        if (storedImages.length === 0 && typeof window !== "undefined") {
          const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
          if (legacyRaw) {
            const legacyImages = JSON.parse(legacyRaw);
            await Promise.all(legacyImages.map((img) => putImage(img)));
            window.localStorage.removeItem(LEGACY_KEY);
            storedImages = legacyImages;
          }
        }

        if (!cancelled) {
          setImagesState(sortByCreatedAt(storedImages));
          setHydrated(true);
        }
      } catch {
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

  const addImages = useCallback(async (newImgs) => {
    setImagesState((prev) => {
      const existingNames = new Set(prev.map((img) => img.name));
      const toAdd = newImgs.filter((img) => !existingNames.has(img.name));

      toAdd.forEach((img) => {
        putImage(img).catch(console.error);
      });

      return sortByCreatedAt([...prev, ...toAdd]);
    });
  }, []);

  const updateImage = useCallback((id, patch) => {
    setImagesState((prev) =>
      prev.map((img) => {
        if (img.id !== id) return img;

        const updated = { ...img, ...patch };
        putImage(updated).catch(console.error);
        return updated;
      })
    );
  }, []);

  const removeImage = useCallback((id) => {
    deleteImage(id).catch(console.error);
    setImagesState((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const clearImages = useCallback(() => {
    clearAllImages().catch(console.error);
    setImagesState([]);
  }, []);

  return { images, hydrated, addImages, updateImage, removeImage, clearImages };
}
