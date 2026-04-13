"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import TogglePills from "@/components/TogglePills";
import { workoutPlans } from "@/data/content";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, HeartPulse, Flame, Gauge } from "@/components/icons";

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const focuses = [
  { value: "lower", label: "Lower body" },
  { value: "upper", label: "Upper body" },
  { value: "fitness", label: "Fitness" },
  { value: "weightloss", label: "Weight loss" },
];

export default function WorkoutsPage() {
  const [difficulty, setDifficulty] = useState("easy");
  const [focus, setFocus] = useState("lower");
  const [progress, setProgress] = useLocalStorageState("gft-workout-progress", {});
  const [openExercise, setOpenExercise] = useState(null);

  const plan = useMemo(() => workoutPlans[difficulty]?.[focus] ?? [], [difficulty, focus]);

  const toggleExercise = (name) => {
    setProgress((prev) => {
      const key = `${difficulty}-${focus}-${name}`;
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col gap-4 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SectionHeader
              eyebrow="City Fitness floor guide"
              title="Pick your difficulty, then pick the focus area"
              subtitle="Built for the machines you’ll actually find at City Fitness. Tick off sets as you finish."
            />
            <TogglePills options={difficulties} value={difficulty} onChange={setDifficulty} />
          </div>
          <div className="flex flex-wrap gap-3">
            <TogglePills options={focuses} value={focus} onChange={setFocus} />
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-gradient-to-r from-sage/70 via-white to-pink/50 border border-white/70 p-6 space-y-3">
          <h4 className="text-lg font-semibold text-ink flex items-center gap-2">
            <Gauge size={18} /> Pre-workout primer
          </h4>
          <p className="text-sm text-muted">
            Prime joints and core before you hop on the machines so every rep feels smooth.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/80 px-3 py-2">5 min brisk walk</span>
            <span className="rounded-full bg-white/80 px-3 py-2">Leg swings + arm circles (10/side)</span>
            <span className="rounded-full bg-white/80 px-3 py-2">2 light sets on first machine</span>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <AnimatePresence>
            {plan.map((item) => {
              const key = `${difficulty}-${focus}-${item.name}`;
              const done = !!progress[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-3 relative overflow-hidden"
                  onClick={() => setOpenExercise(item)}
                >
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-pink/10 via-transparent to-sage/10" />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-muted uppercase tracking-[0.12em]">
                        {difficulty} • {focus.replace("weightloss", "weight loss")}
                      </p>
                      <h3 className="text-xl font-semibold text-ink">{item.name}</h3>
                      <p className="text-sm text-muted flex items-center gap-2">
                        <Dumbbell size={16} /> {item.machine} • {item.sets}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                  <p className="relative text-sm font-semibold text-ink bg-sage/60 rounded-xl px-3 py-2 inline-block">
                    How to use: {item.tips}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-r from-lavender/80 via-white to-sage/60 border border-white/70 p-6 space-y-3">
          <h4 className="text-lg font-semibold text-ink flex items-center gap-2">
            <HeartPulse size={18} /> Post-lift finisher
          </h4>
          <p className="text-sm text-muted">
            Stack 8–12 minutes of brisk walking after strength work. It helps clear triglycerides faster and keeps the
            heart happy.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/80 px-3 py-2 flex items-center gap-2">
              <Gauge size={16} /> Warm-up: ankle circles + cat-cow x 5
            </span>
            <span className="rounded-full bg-white/80 px-3 py-2 flex items-center gap-2">
              <Flame size={16} /> Cool-down: 2 min nasal breathing
            </span>
          </div>
        </div>


      </main>

      {openExercise && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-white/70 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted font-semibold">
                  {difficulty} • {focus.replace("weightloss", "weight loss")}
                </p>
                <h3 className="text-2xl font-semibold text-ink flex items-center gap-2">
                  <Dumbbell size={18} /> {openExercise.name}
                </h3>
                <p className="text-sm text-muted">{openExercise.machine} • {openExercise.sets}</p>
              </div>
              <button className="text-sm font-semibold text-peach" onClick={() => setOpenExercise(null)}>
                Close
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">How to use</p>
              <p className="text-sm text-muted">{openExercise.tips}</p>
              {openExercise.how && (
                <ul className="list-disc list-inside text-sm text-ink space-y-1">
                  {openExercise.how.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
            {openExercise.watch && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink">Watch out for</p>
                <ul className="list-disc list-inside text-sm text-ink space-y-1">
                  {openExercise.watch.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-pink/50 px-3 py-2 font-semibold text-ink">Reps/sets: {openExercise.sets}</span>
              {openExercise.rest && (
                <span className="rounded-full bg-lavender/60 px-3 py-2 font-semibold text-ink">Rest: {openExercise.rest}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
