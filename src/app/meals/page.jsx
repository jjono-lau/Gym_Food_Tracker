"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { meals } from "@/data/pageContent";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import { m } from "framer-motion";

const categories = ["breakfast", "lunch", "dinner", "snacks"];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function MealsPage() {
  const [plan, setPlan] = useLocalStorageState("gft-meal-plan", {});
  const [show, setShow] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchSlot, setSearchSlot] = useState("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("ingredients");
  const [mounted, setMounted] = useState(false);

  const displayPlan = mounted ? plan : {};

  const seedDay = () => {
    const next = {};
    categories.forEach((cat) => {
      next[cat] = pickRandom(meals[cat]);
    });
    setPlan(next);
  };

  const openSearchFor = (cat) => {
    setSearchSlot(cat);
    setSearchQuery("");
    setShowSearch(true);
  };

  const replaceMeal = (meal) => {
    setPlan((prev) => ({ ...prev, [searchSlot]: meal }));
    setShowSearch(false);
    setSearchQuery("");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && Object.keys(plan).length === 0) {
      seedDay();
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const pool = meals[searchSlot] ?? [];

    if (!query) return pool;

    return pool.filter((meal) =>
      [meal.title, ...(meal.ingredients ?? []), ...(meal.steps ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery, searchSlot]);

  useBodyScrollLock(!!show || showSearch);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-10">
          <SectionHeader
            eyebrow="Meal Planner"
            title="South Indian, low-sugar, high-fibre plates"
            subtitle="Balanced carbs, protein, and healthy fats that love your triglycerides."
          />
          <button
            onClick={() => openSearchFor("breakfast")}
            className="rounded-full bg-gradient-to-r from-peach to-pink px-5 py-3 text-sm font-semibold text-ink shadow-lg shadow-peach/40 hover:scale-[1.02] transition"
          >
            Search meals ✨
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {categories.map((cat) => (
            <m.div
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categories.indexOf(cat) * 0.08, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl bg-white/90 border border-white/70 card-shadow p-5 space-y-3 cursor-pointer"
              onClick={() => displayPlan[cat] && setShow(displayPlan[cat])}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] font-semibold text-muted">{cat}</p>
                  <h3 className="text-lg font-semibold text-ink">
                    {displayPlan[cat]?.title || "Tap search to choose a meal"}
                  </h3>
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openSearchFor(cat);
                  }}
                  className="rounded-full border border-ink/10 bg-sage/70 px-4 py-2 text-xs font-semibold text-ink hover:border-peach"
                >
                  Search
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-muted">
                <span className="rounded-full bg-pink/50 px-3 py-1">Low sugar</span>
                <span className="rounded-full bg-lavender/60 px-3 py-1">High fibre</span>
                <span className="rounded-full bg-sage/70 px-3 py-1">Healthy fats</span>
              </div>
              <p className="text-sm text-muted">
                Tip: pair with <span className="font-semibold text-ink">2-3L water</span> and a{" "}
                <span className="font-semibold text-ink">10 minute walk</span> after meals.
              </p>
            </m.div>
          ))}
        </div>

        {show && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8 z-40">
            <div className="relative w-full max-w-xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-xl border border-white/70 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <button
                    className={`px-3 py-2 rounded-full ${tab === "ingredients" ? "bg-ink text-cream" : "bg-cream text-ink"}`}
                    onClick={() => setTab("ingredients")}
                  >
                    ✨ Ingredients
                  </button>
                  <button
                    className={`px-3 py-2 rounded-full ${tab === "recipe" ? "bg-ink text-cream" : "bg-cream text-ink"}`}
                    onClick={() => setTab("recipe")}
                  >
                    🍳 Recipe
                  </button>
                </div>
                <button onClick={() => setShow(null)} className="text-sm font-semibold text-peach">
                  Close
                </button>
              </div>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-2">
                <h3 className="text-xl font-semibold text-ink">{show.title}</h3>
                <p className="text-sm text-muted">Low-sugar friendly • High fibre • Girly-pop approved ✨</p>
                {tab === "ingredients" ? (
                  <ul className="list-disc list-inside text-sm text-ink space-y-2 pl-1">
                    {show.ingredients?.map((ing) => (
                      <li key={ing} className="bg-cream/70 rounded-xl px-3 py-2">
                        {ing}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="list-decimal list-inside text-sm text-ink space-y-2 pl-1">
                    {show.steps?.map((step, idx) => (
                      <li key={idx} className="bg-cream/70 rounded-xl px-3 py-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}

        {showSearch && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8 z-40">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-xl border border-white/70 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] font-semibold text-muted">
                    Search meals
                  </p>
                  <h3 className="text-xl font-semibold text-ink">
                    Replace your {searchSlot}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-sm font-semibold text-peach"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSearchSlot(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      searchSlot === cat ? "bg-ink text-cream" : "bg-cream text-ink"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${searchSlot} by meal name or ingredient`}
                className="w-full rounded-2xl border border-ink/10 bg-cream/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-peach"
              />

              <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-2">
                {searchResults.length > 0 ? (
                  searchResults.map((meal) => (
                    <button
                      key={`${searchSlot}-${meal.title}`}
                      onClick={() => replaceMeal(meal)}
                      className="w-full rounded-3xl border border-white/70 bg-white/90 p-4 text-left card-shadow transition hover:border-peach"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] font-semibold text-muted">
                              {searchSlot}
                            </p>
                            <h4 className="text-lg font-semibold text-ink">{meal.title}</h4>
                          </div>
                          <span className="rounded-full bg-sage/70 px-3 py-1 text-xs font-semibold text-ink">
                            Use this
                          </span>
                        </div>
                        <p className="text-sm text-muted">
                          {(meal.ingredients ?? []).slice(0, 4).join(" • ")}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 p-6 text-sm text-muted">
                    No meals matched that search. Try a recipe name, ingredient, or a shorter phrase.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-lavender/90 to-white border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Swap smart carbs</h4>
            <p className="text-sm text-muted">Millets, brown rice, and veggies keep sugar steadier.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-sage/90 to-white border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Protein in every meal</h4>
            <p className="text-sm text-muted">Paneer, fish, eggs, dal, tofu - build the habit.</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-pink/90 to-white border border-white/70 p-5 space-y-2">
            <h4 className="text-lg font-semibold text-ink">Oil check</h4>
            <p className="text-sm text-muted">Use 1-1.5 tsp for a tadka. Choose groundnut, sesame, or coconut.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
