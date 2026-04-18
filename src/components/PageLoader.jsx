"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";

export default function PageLoader({
  show,
  duration = 4000,
  eyebrow = "Loading",
  title = "Serving girlypops gains...",
  subtitle = "fluffing the carousel, glossing the gallery, and lining up your gym era.",
  iconSrc = "/bench_press.svg",
  iconAlt = "Loading icon",
}) {
  const petals = [
    { left: "12%", top: "16%", delay: 0 },
    { left: "78%", top: "12%", delay: 0.35 },
    { left: "18%", top: "72%", delay: 0.7 },
    { left: "82%", top: "74%", delay: 1.05 },
    { left: "50%", top: "18%", delay: 1.4 },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(250,218,221,0.95),_rgba(255,248,240,0.98)_36%,_rgba(230,214,255,0.92)_100%)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[length:72px_72px]" />
          <div className="absolute -left-10 top-10 h-52 w-52 rounded-full bg-pink/60 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-lavender/70 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-peach/50 blur-3xl" />

          {petals.map((petal, index) => (
            <motion.div
              key={index}
              className="absolute text-xl text-ink/45"
              style={{ left: petal.left, top: petal.top }}
              animate={{ y: [0, -10, 0], rotate: [0, 10, -8, 0], opacity: [0.3, 0.75, 0.3] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: petal.delay,
                ease: "easeInOut",
              }}
            >
              ✿
            </motion.div>
          ))}

          <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-[36px] border border-white/70 bg-white/60 p-8 text-center shadow-[0_30px_80px_rgba(255,183,162,0.2)] backdrop-blur-xl">
              <motion.div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink via-peach to-lavender p-3 shadow-[0_18px_40px_rgba(244,196,215,0.45)]"
                animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.img
                  src={iconSrc}
                  alt={iconAlt}
                  className="h-full w-full object-contain"
                  animate={{ scale: [0.96, 1.04, 0.96] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              <motion.div
                className="mt-6 space-y-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {eyebrow}
                </p>
                <h2 className="text-3xl font-semibold text-ink">{title}</h2>
                <p className="text-sm text-muted">{subtitle}</p>
              </motion.div>

              <div className="mt-7 rounded-full bg-white/65 p-1 shadow-inner shadow-pink/15">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-peach via-pink to-lavender"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                />
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted">
                {[0, 0.18, 0.36].map((delay, index) => (
                  <motion.span
                    key={index}
                    className="h-2.5 w-2.5 rounded-full bg-pink/70"
                    animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
