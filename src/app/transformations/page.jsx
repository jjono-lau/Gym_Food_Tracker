"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import { Flame, Sparkles } from "@/components/icons";

export default function TransformationsPage() {
  const [images, setImages, storageHydrated] = useLocalStorageState("gft-transformations", []);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const lastInteractionRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    lastInteractionRef.current = Date.now();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !storageHydrated) return undefined;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastInteractionRef.current < 10000) return; // wait 10s after user action
      setIndex((i) => (images.length ? (i + 1) % images.length : 0));
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [images.length, mounted, storageHydrated]);

  const displayImages = mounted && storageHydrated ? images : [];
  const currentImage = displayImages[index] ?? displayImages[0];

  const onUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const readers = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                src: reader.result,
                name: file.name,
                id: `${Date.now()}-${file.name}`,
                date: new Date(file.lastModified || Date.now()).toLocaleDateString(),
              });
            reader.readAsDataURL(file);
          })
      )
    );
    setImages((prev) => [...prev, ...readers]);
    lastInteractionRef.current = Date.now();
  };

  const next = () => {
    lastInteractionRef.current = Date.now();
    setIndex((i) => (images.length ? (i + 1) % images.length : 0));
  };
  const prev = () => {
    lastInteractionRef.current = Date.now();
    setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  };
  const editDate = (id) => {
    const img = images.find((i) => i.id === id);
    if (!img) return;
    const input = window.prompt("Enter date (e.g., 15/04/2026)", img.date || "");
    if (!input) return;
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, date: input } : i)));
    lastInteractionRef.current = Date.now();
  };

  const removeImage = (id) => {
    const img = images.find((i) => i.id === id);
    if (!img) return;
    const ok = window.confirm(`Remove "${img.name || "this photo"}" from your carousel?`);
    if (!ok) return;
    setImages((prev) => {
      const next = prev.filter((i) => i.id !== id);
      // keep index in range
      if (next.length === 0) {
        setIndex(0);
      } else {
        setIndex((idx) => Math.min(idx, next.length - 1));
      }
      return next;
    });
    lastInteractionRef.current = Date.now();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-10">
          <SectionHeader
            eyebrow="Glow Up"
            title="Progress carousel + gallery"
            subtitle="Log each gym session with a snapshot. Swipe through wins and keep receipts of your effort."
          />
        </div>

        <div className="mt-8 rounded-[32px] glass card-shadow border border-white/70 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-ink flex items-center gap-2">
                <Sparkles size={18} /> Carousel
              </p>
              <p className="text-sm text-muted">
                Works offline; stored locally on your device. Use landscape or portrait photos—both scale.
              </p>
            </div>
            <label className="cursor-pointer rounded-full bg-ink text-cream px-4 py-2 text-sm font-semibold shadow-lg shadow-peach/30">
              Upload photos
              <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" />
            </label>
          </div>

          <div className="mt-6 relative aspect-[3/4] w-full max-w-2xl max-h-[50vh] rounded-3xl overflow-hidden bg-cream border border-white/70 mx-auto">
            <AnimatePresence mode="wait">
              {displayImages.length > 0 && currentImage ? (
                <motion.img
                  key={currentImage.id}
                  src={currentImage.src}
                  alt={currentImage.name || "progress photo"}
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0.4, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  className="h-full w-full flex items-center justify-center text-muted text-sm"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                >
                  Add your first session photo to start the carousel.
                </motion.div>
              )}
            </AnimatePresence>
            {displayImages.length > 0 && currentImage && (
              <>
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                  <button
                    onClick={prev}
                    className="rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-ink shadow-inner"
                  >
                    Prev
                  </button>
                  <button
                    onClick={next}
                    className="rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-ink shadow-inner"
                  >
                    Next
                  </button>
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-black/60 text-white text-s px-2 py-1 flex items-center gap-2">
                  <button
                    onClick={() => editDate(currentImage.id)}
                    className="underline decoration-dotted underline-offset-2"
                    title="Edit date"
                  >
                    {currentImage.date || "Date not set"} ✏️
                  </button>
                </div>
                <button
                  onClick={() => removeImage(currentImage.id)}
                  className="absolute right-3 top-3 rounded-full bg-black/60 text-white text-s px-2 py-1 hover:bg-black/70"
                  title="Delete photo"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-ink flex items-center gap-2">
              <Flame size={18} /> Gallery
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Tap to set as current</p>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {displayImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => {
                  setIndex(idx);
                  lastInteractionRef.current = Date.now();
                }}
                className="group relative rounded-2xl overflow-hidden border border-white/70"
              >
                <img src={img.src} alt={img.name} className="h-40 w-full object-cover transition group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/50 text-white text-[11px] px-2 py-1">
                  {img.date || "Session"}
                </span>
              </button>
            ))}
            {images.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-ink/15 bg-white/70 p-6 text-sm text-muted">
                No photos yet. Upload from your camera roll to see your glow up.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
