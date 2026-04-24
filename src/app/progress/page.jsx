"use client";

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import LineChart from "@/components/LineChart";
import useIndexedDBProgress from "@/hooks/useIndexedDBProgress";

const makeId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
const WORKOUT_DIFFICULTIES = ["easy", "medium", "hard"];
const DIFFICULTY_TO_VALUE = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const emptyProgress = {
  workouts: [],
  weight: [],
  habits: [],
};

function LoadingCard() {
  return (
    <div className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full bg-cream" />
        <div className="h-9 w-28 rounded-2xl bg-cream" />
        <div className="h-3 w-40 rounded-full bg-cream" />
      </div>
      <div className="h-36 rounded-3xl bg-cream/80" />
      <div className="space-y-2">
        <div className="h-10 rounded-2xl bg-cream/80" />
        <div className="h-10 rounded-2xl bg-cream/80" />
        <div className="h-10 rounded-2xl bg-cream/80" />
      </div>
    </div>
  );
}

function LogList({ entries, unit, emptyText, onEdit, onRemove, showDifficulty = false }) {
  return (
    <div className="space-y-2 max-h-40 overflow-auto pr-1">
      {entries.length === 0 ? (
        <div className="rounded-xl bg-cream px-3 py-4 text-muted">{emptyText}</div>
      ) : (
        entries
          .slice()
          .reverse()
          .map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl bg-cream px-3 py-2"
            >
              <span className="text-ink font-semibold">
                {showDifficulty
                  ? `${entry.label} - ${entry.difficulty ?? "easy"}`
                  : entry.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted">
                  {showDifficulty ? "Completed" : `${entry.value} ${unit}`}
                </span>
                <button
                  onClick={() => onEdit(entry.id)}
                  className="text-xs font-semibold text-ink/80 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="text-xs font-semibold text-peach underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
      )}
    </div>
  );
}

export default function ProgressPage() {
  const [progress, setProgress, hydrated] = useIndexedDBProgress(emptyProgress);
  const [weightInput, setWeightInput] = useState("");
  const [waterInput, setWaterInput] = useState("");
  const [workoutDifficulty, setWorkoutDifficulty] = useState("easy");

  const streak = useMemo(() => progress.workouts.length, [progress.workouts]);

  const addWorkoutDay = () => {
    const todayKey = new Date().toDateString();
    const todayLabel = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    setProgress((prev) => {
      const existing = prev.workouts.find((entry) => entry.dayKey === todayKey);
      if (existing) {
        return {
          ...prev,
          workouts: prev.workouts.map((entry) =>
            entry.dayKey === todayKey
              ? {
                  ...entry,
                  difficulty: workoutDifficulty,
                  value: DIFFICULTY_TO_VALUE[workoutDifficulty],
                }
              : entry
          ),
        };
      }

      return {
        ...prev,
        workouts: [
          ...prev.workouts,
          {
            id: makeId(),
            dayKey: todayKey,
            label: todayLabel,
            difficulty: workoutDifficulty,
            value: DIFFICULTY_TO_VALUE[workoutDifficulty],
          },
        ],
      };
    });
  };

  const addHydration = () => {
    if (!waterInput) return;

    const amount = parseFloat(waterInput);
    if (Number.isNaN(amount) || amount <= 0) return;

    const todayKey = new Date().toDateString();
    const label = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    setProgress((prev) => {
      const exists = prev.habits.find((entry) => entry.dayKey === todayKey);
      if (exists) {
        return {
          ...prev,
          habits: prev.habits.map((entry) =>
            entry.dayKey === todayKey
              ? { ...entry, value: parseFloat((entry.value + amount).toFixed(2)) }
              : entry
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

    const label = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const dayKey = new Date().toDateString();

    setProgress((prev) => ({
      ...prev,
      weight: (() => {
        const existing = prev.weight.find((entry) => entry.dayKey === dayKey);
        if (existing) {
          return prev.weight.map((entry) =>
            entry.dayKey === dayKey ? { ...entry, label, value } : entry
          );
        }

        return [...prev.weight, { id: makeId(), dayKey, label, value }];
      })(),
    }));

    setWeightInput("");
  };

  const editEntry = (key, id) => {
    const item = progress[key].find((entry) => entry.id === id);
    if (!item) return;

    if (key === "workouts") {
      const nextDifficulty = window
        .prompt("Update difficulty: easy, medium, or hard", item.difficulty ?? "easy")
        ?.trim()
        .toLowerCase();

      if (!nextDifficulty) return;
      if (!WORKOUT_DIFFICULTIES.includes(nextDifficulty)) return;

      setProgress((prev) => ({
        ...prev,
        workouts: prev.workouts.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                difficulty: nextDifficulty,
                value: DIFFICULTY_TO_VALUE[nextDifficulty],
              }
            : entry
        ),
      }));
      return;
    }

    const nextVal = window.prompt("Update value", item.value);
    if (nextVal === null) return;

    const num = parseFloat(nextVal);
    if (Number.isNaN(num)) return;

    setProgress((prev) => ({
      ...prev,
      [key]: prev[key].map((entry) =>
        entry.id === id ? { ...entry, value: num } : entry
      ),
    }));
  };

  const removeEntry = (key, id) => {
    setProgress((prev) => ({
      ...prev,
      [key]: prev[key].filter((entry) => entry.id !== id),
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
            subtitle="Stored privately on your device. Add workout days, water wins, and weight check-ins."
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {!hydrated ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">
                      Workout streak
                    </p>
                    <p className="text-3xl font-bold text-ink">{streak} days</p>
                    <p className="text-sm text-muted">
                      One completion per day with a difficulty tag.
                    </p>
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
                  <LineChart
                    data={progress.workouts}
                    label="Days moved this week"
                    color="#ffb7a2"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">
                    All-time log
                  </p>
                  <LogList
                    entries={progress.workouts}
                    emptyText="No workouts logged yet."
                    onEdit={(id) => editEntry("workouts", id)}
                    onRemove={(id) => removeEntry("workouts", id)}
                    showDifficulty
                  />
                </div>
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">
                      Water glow
                    </p>
                    <p className="text-3xl font-bold text-ink">
                      {progress.habits.at(-1)?.value ?? 0} cups
                    </p>
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
                  <LineChart
                    data={progress.habits}
                    label="Hydration trend"
                    color="#ddeedb"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">
                    All-time log
                  </p>
                  <LogList
                    entries={progress.habits}
                    unit="cups"
                    emptyText="No hydration entries yet."
                    onEdit={(id) => editEntry("habits", id)}
                    onRemove={(id) => removeEntry("habits", id)}
                  />
                </div>
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">
                      Weight check-in
                    </p>
                    <p className="text-3xl font-bold text-ink">
                      {progress.weight.at(-1)?.value ?? "-"} kg
                    </p>
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
                  <LineChart
                    data={progress.weight}
                    label="Weight trendline"
                    color="#e6d6ff"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-[0.12em] font-semibold text-muted">
                    All-time log
                  </p>
                  <LogList
                    entries={progress.weight}
                    unit="kg"
                    emptyText="No weight check-ins yet."
                    onEdit={(id) => editEntry("weight", id)}
                    onRemove={(id) => removeEntry("weight", id)}
                  />
                </div>
              </m.div>
            </>
          )}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-pink/80 via-white to-sage/70 border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Weekly planner</h4>
            <p className="text-sm text-muted">
              Aim for 3 strength + 2 easy walks. Rest when needed.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-sage/80 via-white to-lavender/70 border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Micro habits</h4>
            <p className="text-sm text-muted">
              2L water before 4pm. Swap one fried snack for nuts.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-lavender/80 via-white to-pink/70 border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Celebrate tiny wins</h4>
            <p className="text-sm text-muted">
              Mark completions on workout cards to keep the momentum.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
