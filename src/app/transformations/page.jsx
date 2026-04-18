"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageLoader from "@/components/PageLoader";
import SectionHeader from "@/components/SectionHeader";
import { useIndexedDBImages } from "@/hooks/useIndexedDBImages";
import { Flame, Sparkles } from "@/components/icons";

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif|gif|avif)$/i;
const INTERVAL = 4000;
const INTRO_DURATION = 4000;

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        src: reader.result,
        name: file.name,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`,
        date: new Date(file.lastModified || Date.now()).toLocaleDateString(),
      });
    reader.readAsDataURL(file);
  });
}

async function pickFolder() {
  if (typeof window === "undefined" || !window.showDirectoryPicker) return null;

  try {
    const dirHandle = await window.showDirectoryPicker({ mode: "read" });
    const files = [];

    for await (const entry of dirHandle.values()) {
      if (entry.kind === "file" && IMAGE_EXT.test(entry.name)) {
        files.push(await entry.getFile());
      }
    }

    return files;
  } catch (err) {
    if (err.name === "AbortError") return null;
    console.warn("showDirectoryPicker failed:", err);
    return null;
  }
}

const supportsDirectoryPicker =
  typeof window !== "undefined" &&
  typeof window.showDirectoryPicker === "function";

export default function TransformationsPage() {
  const { images, hydrated, addImages, updateImage, removeImage } = useIndexedDBImages();
  const [index, setIndex] = useState(0);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const timerRef = useRef(null);
  const progressRafRef = useRef(null);
  const progressStartRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, INTRO_DURATION);

    return () => {
      clearTimeout(introTimer);
    };
  }, []);

  const startProgress = useCallback(() => {
    setProgress((current) => (current === 0 ? current : 0));
    progressStartRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - progressStartRef.current;
      setProgress(Math.min(elapsed / INTERVAL, 1));
      progressRafRef.current = requestAnimationFrame(tick);
    };

    progressRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setProgress((current) => (current === 0 ? current : 0));
  }, []);

  useEffect(() => {
    if (!hydrated) return undefined;
    if (images.length <= 1) {
      stopProgress();
      return undefined;
    }

    startProgress();
    timerRef.current = setTimeout(() => {
      setIndex((current) => (images.length ? (current + 1) % images.length : 0));
    }, INTERVAL);

    return () => {
      clearTimeout(timerRef.current);
      stopProgress();
    };
  }, [hydrated, images.length, index, startProgress, stopProgress]);

  useEffect(() => {
    setIndex((current) => {
      const nextIndex = !images.length ? 0 : Math.min(current, images.length - 1);
      return nextIndex === current ? current : nextIndex;
    });
  }, [images.length]);

  const displayImages = hydrated ? images : [];
  const currentImage = displayImages[index] ?? displayImages[0];

  const resetAutoAdvance = useCallback(() => {
    stopProgress();
  }, [stopProgress]);

  const goNext = useCallback(() => {
    resetAutoAdvance();
    setIndex((current) => (images.length ? (current + 1) % images.length : 0));
  }, [images.length, resetAutoAdvance]);

  const goPrev = useCallback(() => {
    resetAutoAdvance();
    setIndex((current) =>
      images.length ? (current - 1 + images.length) % images.length : 0
    );
  }, [images.length, resetAutoAdvance]);

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return;

    const dx = event.changedTouches[0].clientX - touchStartX.current;
    const dy = event.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const onUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const uploadedImages = await Promise.all(files.map(readFile));
    addImages(uploadedImages);
    event.target.value = "";
  };

  const onSelectFolder = async () => {
    setImporting(true);

    try {
      const files = await pickFolder();
      if (!files?.length) return;

      const uploadedImages = await Promise.all(files.map(readFile));
      uploadedImages.sort((a, b) => {
        const ta = parseInt(a.id.split("-")[0], 10);
        const tb = parseInt(b.id.split("-")[0], 10);
        return ta - tb;
      });

      addImages(uploadedImages);
    } finally {
      setImporting(false);
    }
  };

  const editDate = (id) => {
    const image = images.find((item) => item.id === id);
    if (!image) return;

    const input = window.prompt(
      "Enter date (e.g. 15/04/2026)",
      image.date || ""
    );
    if (!input) return;

    updateImage(id, { date: input });
  };

  const handleRemove = (id) => {
    const image = images.find((item) => item.id === id);
    if (!image) return;

    const confirmed = window.confirm(
      `Remove "${image.name || "this photo"}" from your carousel?`
    );
    if (!confirmed) return;

    removeImage(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageLoader
        show={showIntro}
        duration={INTRO_DURATION}
        eyebrow="Glow Up Loading"
        title="Serving girlypops gains..."
        subtitle="fluffing the carousel, glossing the gallery, and lining up your gym era."
        iconSrc="/bench_press.svg"
        iconAlt="Bench press"
      />
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
                {supportsDirectoryPicker
                  ? "Select a folder to import all photos at once, or pick individual files."
                  : "Works offline and stays on your device. Use landscape or portrait photos."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {supportsDirectoryPicker && (
                <button
                  onClick={onSelectFolder}
                  disabled={importing}
                  className="cursor-pointer rounded-full bg-peach text-ink px-4 py-2 text-sm font-semibold shadow-lg disabled:opacity-60"
                >
                  {importing ? "Importing..." : "Select folder"}
                </button>
              )}
              <label className="cursor-pointer rounded-full bg-ink text-cream px-4 py-2 text-sm font-semibold shadow-lg shadow-peach/30">
                {supportsDirectoryPicker ? "Pick files" : "Upload photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 w-full max-w-2xl mx-auto">
            <div
              className="relative aspect-[3/4] w-full max-h-[50vh] rounded-3xl overflow-hidden bg-cream border border-white/70 select-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {!hydrated ? (
                <div className="h-full w-full animate-pulse bg-gradient-to-br from-cream via-white to-cream/80" />
              ) : (
                <AnimatePresence initial={false} mode="wait">
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
                    <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted text-sm px-8 text-center">
                      {supportsDirectoryPicker ? (
                        <>
                          <span className="text-lg font-semibold text-ink">Folder import</span>
                          <span>
                            Tap <strong>Select folder</strong> to import your gym photo folder
                            all at once.
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-semibold text-ink">Add your first photo</span>
                          <span>Upload a session photo to start the carousel.</span>
                        </>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              )}

              {displayImages.length > 0 && currentImage && (
                <>
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between z-10">
                    <button
                      onClick={goPrev}
                      className="rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-ink shadow-inner"
                    >
                      Prev
                    </button>
                    <button
                      onClick={goNext}
                      className="rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-ink shadow-inner"
                    >
                      Next
                    </button>
                  </div>

                  {displayImages.length > 1 && (
                    <div className="absolute bottom-14 inset-x-0 flex justify-center gap-1.5 z-10">
                      {displayImages.map((image, imageIndex) => (
                        <button
                          key={image.id}
                          onClick={() => {
                            resetAutoAdvance();
                            setIndex(imageIndex);
                          }}
                          className={`rounded-full transition-all duration-200 ${
                            imageIndex === index
                              ? "w-4 h-2 bg-white"
                              : "w-2 h-2 bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 text-white text-xs px-2 py-1 flex items-center gap-1">
                    <button
                      onClick={() => editDate(currentImage.id)}
                      className="underline decoration-dotted underline-offset-2"
                      title="Edit date"
                    >
                      {currentImage.date || "Date not set"} Edit
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(currentImage.id)}
                    className="absolute right-3 top-3 z-10 rounded-full bg-black/60 text-white text-xs px-2 py-1 hover:bg-black/70"
                    title="Delete photo"
                  >
                    Delete
                  </button>

                  <div className="absolute right-3 bottom-14 z-10 rounded-full bg-black/50 text-white text-[11px] px-2 py-1">
                    {index + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/50 shadow-[0_0_0_1px_rgba(255,255,255,0.45)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-peach via-pink to-lavender shadow-[0_0_18px_rgba(255,183,162,0.65)] transition-none"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-ink flex items-center gap-2">
              <Flame size={18} /> Gallery
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">
              Tap to set as current
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {displayImages.map((image, imageIndex) => (
              <button
                key={image.id}
                onClick={() => {
                  resetAutoAdvance();
                  setIndex(imageIndex);
                }}
                className={`group relative rounded-2xl overflow-hidden border-2 transition ${
                  imageIndex === index ? "border-ink shadow-lg" : "border-white/70"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.name}
                  className="h-40 w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/50 text-white text-[11px] px-2 py-1">
                  {image.date || "Session"}
                </span>
                {imageIndex === index && (
                  <span className="absolute top-2 right-2 rounded-full bg-ink text-cream text-[10px] px-1.5 py-0.5 font-bold">
                    NOW
                  </span>
                )}
              </button>
            ))}
            {hydrated && images.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-ink/15 bg-white/70 p-6 text-sm text-muted">
                No photos yet.{" "}
                {supportsDirectoryPicker
                  ? 'Use "Select folder" to import your gym photos folder.'
                  : "Upload from your camera roll to see your glow up."}
              </div>
            )}
            {!hydrated && (
              <>
                <div className="h-40 rounded-2xl animate-pulse bg-white/70" />
                <div className="h-40 rounded-2xl animate-pulse bg-white/70" />
                <div className="h-40 rounded-2xl animate-pulse bg-white/70" />
                <div className="h-40 rounded-2xl animate-pulse bg-white/70" />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
