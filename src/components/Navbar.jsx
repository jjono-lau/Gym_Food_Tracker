"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "@/components/icons";
import assetPath from "@/lib/assetPath";

const links = [
  { href: "/", label: "Home" },
  { href: "/workouts", label: "Workouts" },
  { href: "/meals", label: "Meals" },
  { href: "/learn", label: "Learn" },
  { href: "/progress", label: "Progress" },
  { href: "/transformations", label: "Glow Up" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-5">
        <div className="glass card-shadow flex items-center justify-between rounded-full px-5 py-3 border border-white/60">
          <div className="flex items-center gap-2">
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink to-peach flex items-center justify-center soft-shadow overflow-hidden p-1">
              <img
                src={assetPath("/bench_press.svg")}
                alt="Bench press icon"
                className="h-full w-full object-contain"
              />
            </span>
            <div className="leading-tight">
              <p className="font-semibold text-ink">Girlypops Girlboss Tracker</p>
              <p className="text-xs text-muted">Move • Nourish • Glow</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors hover:text-peach"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-ink/10 shadow-inner"
                      transition={{ type: "spring", stiffness: 420, damping: 42 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden rounded-full bg-white/80 p-2 border border-white/60 shadow-inner"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="md:hidden absolute left-4 right-4 mt-3 rounded-3xl bg-white shadow-xl border border-ink/10 p-5 space-y-3"
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold ${
                    active ? "bg-ink/10 text-ink" : "text-ink hover:text-peach"
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="text-xs text-muted">●</span>}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
