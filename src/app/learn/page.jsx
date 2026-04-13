"use client";

import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { education } from "@/data/content";
import { motion } from "framer-motion";

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-10">
          <SectionHeader
            eyebrow="Learn"
            title="Healthy triglycerides in plain language"
            subtitle="Short cards, cute icons, and the science made kind."
            align="center"
          />
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {education.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              </div>
              <p className="text-sm text-muted">{item.desc}</p>
              <p className="text-sm font-semibold text-ink bg-sage/70 rounded-xl inline-block px-3 py-2">
                {item.action}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-pink/90 to-white border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Plate plan</h4>
            <p className="text-sm text-muted">Half veggies, quarter protein, quarter smart carbs. Add healthy fat.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-lavender/90 to-white border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Move after meals</h4>
            <p className="text-sm text-muted">8–10 minute walk lowers post-meal triglyceride spike.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-sage/90 to-white border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Sleep & stress</h4>
            <p className="text-sm text-muted">7–9 hours sleep and breathing breaks keep cravings calmer.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
