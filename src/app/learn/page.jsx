"use client";

import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { education } from "@/data/pageContent";

export default function LearnPage() {
  const triglyceridesCards = useMemo(
    () => education.filter((item) => item.topic === "triglycerides"),
    [],
  );
  const pcosCards = useMemo(
    () => education.filter((item) => item.topic === "pcos"),
    [],
  );

  const renderCards = (items, sectionKey) => (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={`${sectionKey}-${item.title}`}
          className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-2 transition-transform duration-500 ease-out sm:hover:-translate-y-1"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
          </div>
          <p className="text-sm text-muted">{item.desc}</p>
          <p className="text-sm font-semibold text-ink bg-sage/70 rounded-xl inline-block px-3 py-2">
            {item.action}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-10">
          <SectionHeader
            eyebrow="Learn"
            title="Get that knowledge queen"
            subtitle="Short cards, cute icons, and the science made kind."
            align="left"
          />
        </div>

        <div className="mt-10 space-y-10">
          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-muted">
                Triglycerides
              </p>
              <h2 className="text-2xl font-semibold text-ink">
                Heart-health basics and practical food direction
              </h2>
            </div>
            {renderCards(triglyceridesCards, "triglycerides")}
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-muted">
                PCOS
              </p>
              <h2 className="text-2xl font-semibold text-ink">
                Steadier energy, meal balance, and training consistency
              </h2>
            </div>
            {renderCards(pcosCards, "pcos")}
          </section>
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
