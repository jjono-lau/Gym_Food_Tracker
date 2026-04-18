"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { Dumbbell, Salad, BookOpen, Sparkles } from "@/components/icons";
import useIndexedDBProgress from "@/hooks/useIndexedDBProgress";

const featureCards = [
  {
    title: "Workout Planner",
    desc: "Easy / Medium / Hard circuits with toggles and completion checkboxes.",
    badge: "Move",
    icon: Dumbbell,
    link: "/workouts",
  },
  {
    title: "Triglyceride-Friendly Meals",
    desc: "South Indian plates with low sugar, balanced fats, and fibre.",
    badge: "Nourish",
    icon: Salad,
    link: "/meals",
  },
  {
    title: "Learn the Why",
    desc: "Cards that keep the science simple and encouraging.",
    badge: "Learn",
    icon: BookOpen,
    link: "/learn",
  },
  {
    title: "Progress vibes",
    desc: "Log streaks, habits, and see pastel line charts glow up.",
    badge: "Slay",
    icon: Sparkles,
    link: "/progress",
  },
];

const emptyProgress = { workouts: [], weight: [], habits: [] };

function DashboardSkeleton() {
  return (
    <div className="mt-6 space-y-4 text-sm animate-pulse">
      <div className="rounded-2xl bg-gradient-to-br from-pink/60 to-lavender/60 p-4 soft-shadow">
        <div className="h-3 w-20 rounded-full bg-white/60" />
        <div className="mt-3 h-8 w-40 rounded-2xl bg-white/60" />
        <div className="mt-2 h-3 w-28 rounded-full bg-white/60" />
      </div>
      <div className="rounded-2xl bg-white p-4 border border-white/70 shadow-inner shadow-peach/20">
        <div className="h-3 w-16 rounded-full bg-cream" />
        <div className="mt-3 h-7 w-48 rounded-2xl bg-cream" />
        <div className="mt-2 h-3 w-24 rounded-full bg-cream" />
      </div>
      <div className="rounded-2xl bg-sage/60 p-4 border border-white/70">
        <div className="h-3 w-16 rounded-full bg-white/60" />
        <div className="mt-3 h-7 w-24 rounded-2xl bg-white/60" />
        <div className="mt-2 h-3 w-24 rounded-full bg-white/60" />
      </div>
    </div>
  );
}

export default function Home() {
  const [progress, , hydrated] = useIndexedDBProgress(emptyProgress);
  const [mealSuggestion, setMealSuggestion] = useState("Plan a meal");
  const [mealReady, setMealReady] = useState(false);

  const pickMeal = (date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour <= 10) return "Breakfast: protein oats + berries";
    if (hour > 10 && hour < 16) return "Lunch: millet lemon rice + paneer";
    return "Dinner: ragi roti + dal + salad";
  };

  const formatOffset = () => {
    const minutes = -new Date().getTimezoneOffset();
    const sign = minutes >= 0 ? "+" : "-";
    const abs = Math.abs(minutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `${sign}${hh}${mm}`;
  };

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    let cancelled = false;
    setMealReady(false);

    const loadTime = async () => {
      let nextMealLabel = "Plan a meal";

      try {
        const offset = formatOffset();
        const res = await fetch(`https://aisenseapi.com/services/v1/datetime/${offset}`);
        const data = await res.json();
        const iso = data?.datetime;
        nextMealLabel = iso ? pickMeal(new Date(iso)) : pickMeal(new Date());
      } catch {
        nextMealLabel = pickMeal(new Date());
      } finally {
        if (!cancelled) {
          setMealSuggestion(nextMealLabel);
          setMealReady(true);
        }
      }
    };

    loadTime();

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  const streak = progress.workouts.length;
  const lastWorkout = useMemo(() => progress.workouts.at(-1) ?? null, [progress.workouts]);
  const dashWorkout = lastWorkout
    ? `${lastWorkout.difficulty ?? "easy"} day`
    : "No workout logged yet";
  const dashWorkoutSub = lastWorkout
    ? `Last done: ${lastWorkout.label}`
    : "Log a workout to start your streak";

  return (
    <div className="min-h-screen flex flex-col bg-grid overflow-x-hidden">
      <Navbar />
      <main className="relative mx-auto flex-1 w-full max-w-6xl overflow-x-hidden px-4 sm:px-6 lg:px-8 pb-16">
        <div className="blob blob-peach top-12 left-[-80px]" aria-hidden />
        <div className="blob blob-lavender top-64 right-[-60px]" aria-hidden />

        <section className="grid lg:grid-cols-2 gap-12 items-center pt-14">
          <div className="space-y-7">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink shadow-inner shadow-pink/30 border border-white/70"
            >
              Daily calm + energy
              <span className="text-xs text-muted">built for triglyceride care</span>
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-semibold leading-tight text-ink"
            >
              Get moving, eat healthy meals and make steady progress.
            </motion.h1>
            <p className="text-lg text-muted max-w-2xl">
              GlowUp keeps you organised while you plan workouts, plate up yummy
              South Indian meals, and celebrate the small wins.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/workouts"
                className="rounded-full bg-ink/30 text-cream px-6 py-3 text-sm font-semibold shadow-lg shadow-pink/30 hover:scale-[1.02] transition"
              >
                Start a workout
              </Link>
              <Link
                href="/meals"
                className="rounded-full border border-ink/10 bg-white/90 px-6 py-3 text-sm font-semibold text-ink hover:border-peach hover:text-peach transition"
              >
                Plan meals
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative glass card-shadow rounded-[32px] p-7 sm:p-9 overflow-hidden"
          >
            <div
              className="absolute -right-14 -top-14 w-60 h-60 rounded-full bg-lavender/70 halo"
              aria-hidden
            />
            <div
              className="absolute -left-10 -bottom-12 w-52 h-52 rounded-full bg-pink/70 blur-3xl"
              aria-hidden
            />
            <div className="relative z-10">
              <SectionHeader
                eyebrow="Daily dashboard"
                title="Your glow-up snapshot"
                subtitle="Quick hits to stay on track"
              />
            </div>
            {!hydrated ? (
              <DashboardSkeleton />
            ) : (
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-2xl bg-gradient-to-br from-pink/80 to-lavender/80 p-4 text-ink soft-shadow">
                  <p className="text-xs uppercase tracking-[0.12em] font-semibold">
                    Workout
                  </p>
                  <p className="mt-2 text-2xl font-bold">{dashWorkout}</p>
                  <p className="text-xs mt-1">{dashWorkoutSub}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-ink border border-white/70 shadow-inner shadow-peach/20">
                  <p className="text-xs uppercase tracking-[0.12em] font-semibold">
                    Meal
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    {mealReady ? mealSuggestion : "Loading meal cue..."}
                  </p>
                  <p className="text-xs text-muted mt-1">Low sugar & high fibre</p>
                </div>
                <div className="relative rounded-2xl bg-sage/80 p-4 border border-white/70">
                  <p className="relative z-10 text-xs uppercase tracking-[0.12em] font-semibold">
                    Streak
                  </p>
                  <p className="relative z-10 mt-2 text-xl font-bold flex items-center gap-2">
                    {streak} days
                  </p>
                  <p className="relative z-10 text-xs text-muted">Keep the glow going</p>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        <section className="mt-16 space-y-10">
          <SectionHeader
            eyebrow="Slay the day away"
            title="Move, nourish, learn - all in one place"
            subtitle="Select a card to discover more"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <Link key={card.title} href={card.link} className="block group ">
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="rounded-[28px] bg-white/90 border border-white/70 h-full card-shadow p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-ink text-cream px-3 py-1 text-xs font-semibold">
                      {card.badge}
                    </span>
                    <span className="rounded-full bg-pink/50 px-3 py-1 text-[11px] font-semibold text-ink">
                      Click Me
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <card.icon size={25} className="text-ink" />
                    <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{card.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="rounded-[32px] bg-white/90 border border-white/70 card-shadow p-7 sm:p-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-muted">
                Daily rhythm
              </p>
              <h3 className="text-2xl font-semibold text-ink">
                Warm body, balanced plate, gentle close
              </h3>
              <p className="text-sm text-muted max-w-xl">
                Open with breath, move with intention, refuel with steady carbs
                and protein, close with a quick walk.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-pink/60 px-4 py-2 font-semibold text-ink">
                Mobility + strength
              </span>
              <span className="rounded-full bg-lavender/70 px-4 py-2 font-semibold text-ink">
                Low-sugar South Indian meals
              </span>
              <span className="rounded-full bg-sage/80 px-4 py-2 font-semibold text-ink">
                10-12 min walk
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
