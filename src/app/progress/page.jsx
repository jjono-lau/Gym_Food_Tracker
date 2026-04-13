"use client";

import { useMemo, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import LineChart from "@/components/LineChart";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import { motion } from "framer-motion";

const makeId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const withIds = (arr, addDayKey = false) =>
  arr.map((item) => ({
    id: item.id ?? makeId(),
    ...(addDayKey ? { dayKey: item.dayKey ?? item.label ?? makeId() } : {}),
    ...item,
  }));

const defaultProgress = {
  workouts: withIds(
    [
      { label: "Apr 6", value: 2 },
      { label: "Apr 7", value: 3 },
      { label: "Apr 8", value: 3 },
      { label: "Apr 9", value: 4 },
      { label: "Apr 10", value: 3 },
      { label: "Apr 11", value: 4 },
      { label: "Apr 12", value: 5 },
    ],
    true
  ),
  weight: withIds(
    [
   { label: "Apr 6", value: 62 },
      { label: "Apr 7", value: 63 },
      { label: "Apr 8", value: 63 },
      { label: "Apr 9", value: 64 },
      { label: "Apr 10", value: 63 },
      { label: "Apr 11", value: 64 },
      { label: "Apr 12", value: 65 },
    ],
    true
  ),
  habits: withIds(
    [
   { label: "Apr 6", value: 2 },
      { label: "Apr 7", value: 3 },
      { label: "Apr 8", value: 3 },
      { label: "Apr 9", value: 4 },
      { label: "Apr 10", value: 3 },
      { label: "Apr 11", value: 4 },
      { label: "Apr 12", value: 5 },
    ],
    true
  ),
};

export default function ProgressPage() {
  const [progress, setProgress] = useLocalStorageState("gft-progress", defaultProgress);
  const [weightInput, setWeightInput] = useState("");
  const [waterInput, setWaterInput] = useState("");
  const [workoutDifficulty, setWorkoutDifficulty] = useState("easy");

  useEffect(() => {
    // migrate any items missing ids
    setProgress((prev) => ({
      workouts: withIds(prev.workouts ?? [], true),
      weight: withIds(prev.weight ?? [], true),
      habits: withIds(prev.habits ?? [], true),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const streak = useMemo(() => progress.workouts.length, [progress.workouts]);

  const addWorkoutDay = () => {
    const todayKey = new Date().toDateString();
    const todayLabel = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
    setProgress((prev) => {
      const existing = prev.workouts.find((d) => d.dayKey === todayKey);
      if (existing) {
        // overwrite difficulty if user changes it
        return {
          ...prev,
          workouts: prev.workouts.map((d) =>
            d.dayKey === todayKey ? { ...d, value: 1, difficulty: workoutDifficulty } : d
          ),
        };
      }
      return {
        ...prev,
        workouts: [...prev.workouts, { id: makeId(), dayKey: todayKey, label: todayLabel, value: 1, difficulty: workoutDifficulty }],
      };
    });
  };

  const addHydration = () => {
    if (!waterInput) return;
    const amount = parseFloat(waterInput);
    if (Number.isNaN(amount) || amount <= 0) return;
    const todayKey = new Date().toDateString();
    const label = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
    setProgress((prev) => {
      const exists = prev.habits.find((h) => h.dayKey === todayKey);
      if (exists) {
        return {
          ...prev,
          habits: prev.habits.map((h) =>
            h.dayKey === todayKey ? { ...h, value: parseFloat((h.value + amount).toFixed(2)) } : h
          ),
        };
      }
      return {
        ...prev,
        habits: [...prev.habits, { id: makeId(), dayKey: todayKey, label, value: amount }],
      };
    });
    setWaterInput("");
  };

  const addWeight = () => {
    if (!weightInput) return;
    const value = parseFloat(weightInput);
    if (Number.isNaN(value)) return;
    const label = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const dayKey = new Date().toDateString();
    setProgress((prev) => ({
      ...prev,
      weight: (() => {
        const existing = prev.weight.find((w) => w.dayKey === dayKey);
        if (existing) {
          return prev.weight.map((w) => (w.dayKey === dayKey ? { ...w, label, value } : w));
        }
        return [...prev.weight, { id: makeId(), dayKey, label, value }];
      })(),
    }));
    setWeightInput("");
  };

  const editEntry = (key, id) => {
    const item = progress[key].find((d) => d.id === id);
    if (!item) return;
    const nextVal = window.prompt("Update value", item.value);
    if (nextVal === null) return;
    const num = parseFloat(nextVal);
    if (Number.isNaN(num)) return;
    setProgress((prev) => ({
      ...prev,
      [key]: prev[key].map((d) => (d.id === id ? { ...d, value: num } : d)),
    }));
  };

  const removeEntry = (key, id) => {
    setProgress((prev) => ({
      ...prev,
      [key]: prev[key].filter((d) => d.id !== id),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-10">
          <SectionHeader
            eyebrow="Progress"
            title="Track streaks, trends, and habits"
            subtitle="Local storage keeps it private. Add workout days, water wins, and weight check-ins."
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">Workout streak</p>
                <p className="text-3xl font-bold text-ink">{streak} days</p>
                <p className="text-sm text-muted">One completion per day with a difficulty tag.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={workoutDifficulty}
                  onChange={(e) => setWorkoutDifficulty(e.target.value)}
                  className="rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:border-peach focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button
                  onClick={addWorkoutDay}
                  className="rounded-full bg-peach px-4 py-2 text-sm font-semibold text-ink shadow soft-shadow"
                >
                  Log today
                </button>
              </div>
            </div>
            <div className="pt-2">
              <LineChart data={progress.workouts} label="Days moved this week" color="#ffb7a2" />
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">All-time log</p>
              <div className="space-y-2 max-h-40 overflow-auto pr-1">
                {progress.workouts.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2">
                    <span className="text-ink font-semibold">
                      {entry.label} • {entry.difficulty ?? "easy"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted">{entry.value ? "Completed" : "Skip"}</span>
                      <button
                        onClick={() => editEntry("workouts", entry.id)}
                        className="text-xs font-semibold text-ink/80 underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeEntry("workouts", entry.id)}
                        className="text-xs font-semibold text-peach underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">Water glow</p>
                <p className="text-3xl font-bold text-ink">{progress.habits.at(-1)?.value ?? 0} cups</p>
                <p className="text-sm text-muted">Adds to the same day total.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="cups"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  className="w-24 rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:border-peach focus:outline-none"
                />
                <button
                  onClick={addHydration}
                  className="rounded-full bg-sage px-4 py-2 text-sm font-semibold text-ink border border-white/60"
                >
                  Add water
                </button>
              </div>
            </div>
            <div className="pt-2">
              <LineChart data={progress.habits} label="Hydration trend" color="#ddeedb" />
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">All-time log</p>
              <div className="space-y-2 max-h-40 overflow-auto pr-1">
                {progress.habits.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2">
                    <span className="text-ink font-semibold">{entry.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted">{entry.value} cups</span>
                      <button
                        onClick={() => editEntry("habits", entry.id)}
                        className="text-xs font-semibold text-ink/80 underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeEntry("habits", entry.id)}
                        className="text-xs font-semibold text-peach underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">Weight check-in</p>
                <p className="text-3xl font-bold text-ink">{progress.weight.at(-1)?.value ?? "-"} kg</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="kg"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-20 rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm focus:border-peach focus:outline-none"
                />
                <button
                  onClick={addWeight}
                  className="rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-ink border border-white/60"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="pt-2">
              <LineChart data={progress.weight} label="Weight trendline" color="#e6d6ff" />
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">All-time log</p>
              <div className="space-y-2 max-h-40 overflow-auto pr-1">
                {progress.weight.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2">
                    <span className="text-ink font-semibold">{entry.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted">{entry.value} kg</span>
                      <button
                        onClick={() => editEntry("weight", entry.id)}
                        className="text-xs font-semibold text-ink/80 underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeEntry("weight", entry.id)}
                        className="text-xs font-semibold text-peach underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-pink/80 via-white to-sage/70 border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Weekly planner</h4>
            <p className="text-sm text-muted">Aim for 3 strength + 2 easy walks. Rest when needed.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-sage/80 via-white to-lavender/70 border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Micro habits</h4>
            <p className="text-sm text-muted">2L water before 4pm. Swap one fried snack for nuts.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-lavender/80 via-white to-pink/70 border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Celebrate tiny wins</h4>
            <p className="text-sm text-muted">Mark completions on workout cards to keep the momentum.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
