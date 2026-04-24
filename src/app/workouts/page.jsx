"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import TogglePills from "@/components/TogglePills";
import { workoutCatalog } from "@/data/pageContent";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import { m, AnimatePresence } from "framer-motion";
import { Dumbbell, HeartPulse, Gauge } from "@/components/icons";

const categories = [
  { value: "lower", label: "Lower body" },
  { value: "upper", label: "Upper body" },
  { value: "cardio", label: "Cardio" },
  { value: "core", label: "Core" },
  { value: "arms", label: "Arms" },
  { value: "fullbody", label: "Full body" },
];

function formatCategoryLabel(value) {
  return value === "fullbody" ? "full body" : value;
}

export default function WorkoutsPage() {
  const [category, setCategory] = useState("lower");
  const [progress, setProgress] = useLocalStorageState("gft-workout-progress", {});
  const [openExercise, setOpenExercise] = useState(null);

  const plan = useMemo(() => workoutCatalog[category] ?? [], [category]);

  const toggleExercise = (name) => {
    setProgress((prev) => {
      const key = `${category}-${name}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  useBodyScrollLock(!!openExercise);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col gap-4 pt-10">
          <SectionHeader
            eyebrow="Workout Library"
            title="Browse every workout option in the vault"
            subtitle="Open a tab to see the full list for that training area, then tap a card for the machine details."
            align="left"
          />
          <div className="w-full sm:flex sm:flex-wrap sm:gap-3">
            <TogglePills options={categories} value={category} onChange={setCategory} />
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-gradient-to-r from-sage/70 via-white to-pink/50 border border-white/70 p-6 space-y-3">
          <h4 className="text-lg font-semibold text-ink flex items-center gap-2">
            <Gauge size={18} /> Pre-workout primer
          </h4>
          <p className="text-sm text-muted">
            Warm the joints, raise heart rate gently, and groove the first movement so work sets feel smooth.
          </p>
          <ul className="list-disc list-inside text-sm text-ink space-y-1">
            <li>Treadmill: 5 min at incline 1.0-2.0, speed 4.5-6.0 with tall posture and loose arms.</li>
            <li>Mobility: 10 leg swings each side plus 10 slow arm circles each way.</li>
            <li>Activation: 1 to 2 light setup sets on the first machine before heavier work.</li>
          </ul>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <AnimatePresence>
            {plan.map((item) => {
              const key = `${category}-${item.name}`;
              const done = !!progress[key];

              return (
                <m.div
                  key={key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-3 relative overflow-hidden cursor-pointer"
                  onClick={() => setOpenExercise(item)}
                >
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-pink/10 via-transparent to-sage/10" />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-muted uppercase tracking-[0.12em]">
                        {formatCategoryLabel(category)}
                      </p>
                      <h3 className="text-xl font-semibold text-ink">{item.name}</h3>
                      <p className="flex min-w-0 items-center gap-2 text-sm text-muted">
                        <Dumbbell size={16} className="shrink-0" /> <span className="min-w-0 break-words">{item.machine}</span>
                        {item.sets ? ` • ${item.sets}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExercise(item.name);
                      }}
                      className={`h-11 w-11 rounded-2xl border-2 transition flex items-center justify-center text-lg ${
                        done
                          ? "border-peach bg-peach/70 text-ink shadow-inner shadow-peach/40"
                          : "border-ink/10 bg-white hover:border-peach"
                      }`}
                      aria-label="Toggle complete"
                    >
                      {done ? "✅" : "❌"}
                    </button>
                  </div>

                  <div className="relative max-h-40 space-y-2 overflow-y-auto pr-1">
                    {item.summary ? <p className="text-sm text-muted">{item.summary}</p> : null}
                    <p className="text-sm font-semibold text-ink bg-sage/60 rounded-xl px-3 py-2 inline-block">
                      How to use: {item.tips}
                    </p>
                    {item.source ? (
                      <p className="text-xs text-muted">Source: {item.source}</p>
                    ) : null}
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-r from-lavender/80 via-white to-sage/60 border border-white/70 p-6 space-y-3">
          <h4 className="text-lg font-semibold text-ink flex items-center gap-2">
            <HeartPulse size={18} /> Cooldown reset
          </h4>
          <p className="text-sm text-muted">
            Steady the heart rate, downshift your breathing, and make the next session easier to recover from.
          </p>
          <ul className="list-disc list-inside text-sm text-ink space-y-1">
            <li>Treadmill or bike: 5 to 10 easy minutes with nose breathing if you can.</li>
            <li>Mobility reset: ankle circles, cat-cow, and thoracic openers.</li>
            <li>Finish with 2 minutes of slow breathing before walking away.</li>
          </ul>
        </div>
      </main>

      {openExercise && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white border border-white/70 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted font-semibold">
                  {formatCategoryLabel(category)}
                </p>
                <h3 className="text-2xl font-semibold text-ink flex items-center gap-2">
                  <Dumbbell size={18} /> {openExercise.name}
                </h3>
                <p className="text-sm text-muted">
                  {openExercise.machine}
                  {openExercise.sets ? ` • ${openExercise.sets}` : ""}
                </p>
              </div>
              <button className="text-sm font-semibold text-peach" onClick={() => setOpenExercise(null)}>
                Close
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
              {openExercise.summary ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink">Summary</p>
                  <p className="text-sm text-muted">{openExercise.summary}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink">How to use</p>
                <p className="text-sm text-muted">{openExercise.tips}</p>
                {openExercise.how?.length ? (
                  <ul className="list-disc list-inside text-sm text-ink space-y-1">
                    {openExercise.how.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {openExercise.watch?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink">Watch out for</p>
                  <ul className="list-disc list-inside text-sm text-ink space-y-1">
                    {openExercise.watch.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 text-sm">
                {openExercise.sets ? (
                  <span className="rounded-full bg-pink/50 px-3 py-2 font-semibold text-ink">
                    Reps/sets: {openExercise.sets}
                  </span>
                ) : null}
                {openExercise.rest ? (
                  <span className="rounded-full bg-lavender/60 px-3 py-2 font-semibold text-ink">
                    Rest: {openExercise.rest}
                  </span>
                ) : null}
              </div>

              {openExercise.source ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink">Source</p>
                  <p className="text-sm text-muted">{openExercise.source}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
