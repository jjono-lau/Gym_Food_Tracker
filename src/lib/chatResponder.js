import { education, meals, workoutPlans } from "@/data/pageContent";
import {
  getChatbotNotes,
  getChatbotNoteById,
  getAllRecipes,
  getIngredientBySlug,
  getRecipeDetailsById,
  getRecipesByCategory,
  getSafetyRuleById,
  searchFaqRules,
  searchChatbotNotes,
  searchIngredients,
  searchMachineRules,
  searchMealRules,
  searchPlanRules,
  searchRecipes,
  searchSafetyRules,
  searchSnackRules,
  searchSwapRules,
  searchWorkoutRules,
} from "@/lib/chatKnowledge";

const fallbackPrompts = [
  "Ask for a breakfast idea, a lower-body workout, or an ingredient swap.",
  "Try something like: 'Give me a dinner with high protein' or 'What helps high triglycerides?'",
];

function createResponse(text, options = {}) {
  return {
    text,
    intent: options.intent ?? "unknown",
    answerType: options.answerType ?? options.intent ?? "unknown",
    facts: options.facts ?? {},
    sources: options.sources ?? [],
    debug: options.debug ?? null,
  };
}

function uniqueList(items) {
  return [...new Set(items)];
}

function shuffleItems(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function clampItems(items, limit = 2) {
  return items.slice(0, limit);
}

function randomIdeaCount(min = 3, max = 5) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isMoreIdeasQuery(query) {
  return /^(more|more please|show more|give me more|more ideas|more options|more meals|more food|another|another one)\b/i.test(
    query.trim(),
  );
}

function firstSentence(value) {
  if (!value) return "";

  const normalized = value.replace(/\s+/g, " ").trim();
  const match = normalized.match(/.+?[.!?](?:\s|$)/);
  return (match ? match[0] : normalized).trim();
}

function flattenWorkouts() {
  return Object.entries(workoutPlans).flatMap(([difficulty, groups]) =>
    Object.entries(groups).flatMap(([focus, plans]) =>
      plans.map((plan) => ({ ...plan, difficulty, focus })),
    ),
  );
}

const allWorkoutMoves = flattenWorkouts();
const allRecipes = getAllRecipes();
const allCuratedMeals = Object.entries(meals).flatMap(([category, entries]) =>
  entries.map((meal, index) => ({
    id: `app-meal-${category}-${index}`,
    name: meal.title,
    category,
    source_note: "src/data/pageContent.js",
    description: firstSentence((meal.steps ?? []).join(" ")),
    ingredient_slugs: [],
    ingredient_list: meal.ingredients ?? [],
    ingredient_text: (meal.ingredients ?? []).join(" ").toLowerCase(),
    nutrition_per_serving: null,
  })),
);
const workoutTargetGroups = {
  abs: ["ab", "abs", "abdominal", "core", "crunch"],
  chest: ["chest", "press", "pec"],
  back: ["back", "row", "lat"],
  biceps: ["bicep", "biceps", "curl"],
  triceps: ["tricep", "triceps", "extension"],
  shoulders: ["shoulder", "shoulders", "delts"],
  glutes: ["glute", "glutes", "hip"],
  hamstrings: ["hamstring", "hamstrings", "leg curl"],
  quads: ["quad", "quads", "leg extension", "leg press"],
  calves: ["calf", "calves"],
};

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeLookupText(value) {
  return tokenize(
    value
      .toLowerCase()
      .replace(/\b(recipe|recipes|show me|give me|for|please)\b/g, " "),
  ).join(" ");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasAliasMatch(text, alias) {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias.toLowerCase())}([^a-z0-9]|$)`, "i");
  return pattern.test(text);
}

function scoreText(query, text) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;

  const haystack = text.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
    if (haystack.startsWith(token)) score += 0.5;
  }

  if (haystack.includes(query.toLowerCase())) score += 2;

  return score;
}

function findMachineMatches(query) {
  return allWorkoutMoves
    .map((move) => {
      const score =
        scoreText(query, `${move.machine} ${move.name}`) * 3 +
        scoreText(query, [move.tips, ...(move.how ?? []), ...(move.watch ?? [])].join(" "));

      return { move, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.move);
}

function findWorkoutMatches(query) {
  return allWorkoutMoves
    .map((move) => {
      const score =
        scoreText(query, `${move.name} ${move.machine}`) * 3 +
        scoreText(
          query,
          [
            move.difficulty,
            move.focus,
            move.tips,
            ...(move.how ?? []),
            ...(move.watch ?? []),
          ].join(" "),
        );

      return { move, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.move);
}

function findFocusFromQuery(query) {
  const needle = query.toLowerCase();

  if (needle.includes("breakfast")) return "breakfast";
  if (needle.includes("lunch")) return "lunch";
  if (needle.includes("dinner")) return "dinner";
  if (needle.includes("snack")) return "snack";
  if (needle.includes("upper")) return "upper";
  if (needle.includes("lower") || needle.includes("leg")) return "lower";
  if (needle.includes("cardio") || needle.includes("fitness")) return "fitness";
  if (needle.includes("weight loss") || needle.includes("fat loss")) return "weightloss";

  return null;
}

function findRecentFoodCategory(history = []) {
  const recentAssistantMessage = [...history]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        ["breakfast", "lunch", "dinner"].includes(message.facts?.category),
    );

  return recentAssistantMessage?.facts?.category ?? null;
}

function getSeenRecipeIds(history = [], category = null) {
  return new Set(
    history.flatMap((message) => {
      if (message.role !== "assistant") return [];
      if (!Array.isArray(message.facts?.recipeIds)) return [];
      if (category && message.facts?.category !== category) return [];
      return message.facts.recipeIds;
    }),
  );
}

function getRecipeResultsForCategory(category, history = [], limit = randomIdeaCount()) {
  if (!category || !["breakfast", "lunch", "dinner"].includes(category)) return [];

  const pool = getRecipesByCategory(category).slice(0, 24);
  const seenRecipeIds = getSeenRecipeIds(history, category);
  const unseen = pool.filter((recipe) => !seenRecipeIds.has(recipe.id));
  const rankedPool = unseen.length >= limit ? unseen : unseen.concat(pool.filter((recipe) => seenRecipeIds.has(recipe.id)));

  return shuffleItems(rankedPool).slice(0, limit);
}

function findWorkoutTargetGroup(query) {
  const needle = query.toLowerCase();

  return Object.entries(workoutTargetGroups).find(([, aliases]) =>
    aliases.some((alias) => hasAliasMatch(needle, alias)),
  )?.[0] ?? null;
}

function moveMatchesTargetGroup(move, targetGroup) {
  if (!targetGroup) return false;

  const aliases = workoutTargetGroups[targetGroup] ?? [];
  const haystack = `${move.name} ${move.machine} ${move.tips} ${(move.how ?? []).join(" ")} ${(move.watch ?? []).join(" ")}`.toLowerCase();

  return aliases.some((alias) => hasAliasMatch(haystack, alias));
}

function isTargetedWorkoutQuery(query) {
  return Boolean(findWorkoutTargetGroup(query)) && /(workout|workouts|exercise|exercises|train|training|gym|machine|moves)/i.test(query);
}

function isSpecificMachineUseQuery(query) {
  return /(how do i use|how to use|use|set up|setup|adjust)/i.test(query) && findMachineMatches(query).length > 0;
}

function isSpecificMachineTroubleshootingQuery(query) {
  return /(feel wrong|feels wrong|hurts|awkward|wrong muscle|in shoulders|in knees|in neck)/i.test(query) && findMachineMatches(query).length > 0;
}

function scoreRecipeForMealRule(recipe, rule) {
  const filters = rule.filters ?? {};
  const nutrition = recipe.nutrition_per_serving ?? {};
  const title = recipe.name.toLowerCase();
  let score = 0;

  if (filters.categories?.length) {
    if (!filters.categories.includes(recipe.category)) return -1;
    score += 6;
  }

  if (typeof filters.min_protein_g === "number") {
    const protein = nutrition.protein_g ?? 0;
    if (protein < filters.min_protein_g) return -1;
    score += protein;
  }

  if (typeof filters.max_calories === "number") {
    const calories = nutrition.calories ?? Number.MAX_SAFE_INTEGER;
    if (calories > filters.max_calories) return -1;
    score += Math.max(0, filters.max_calories - calories) / 20;
  }

  const ingredientSlugs = recipe.ingredient_slugs ?? [];

  if (filters.exclude_ingredient_slugs?.length) {
    const hasExcluded = filters.exclude_ingredient_slugs.some((slug) =>
      ingredientSlugs.includes(slug),
    );
    if (hasExcluded && filters.exclude_ingredient_slugs.length === ingredientSlugs.length) {
      return -1;
    }
  }

  if (filters.prefer_ingredient_slugs?.length) {
    score += filters.prefer_ingredient_slugs.filter((slug) =>
      ingredientSlugs.includes(slug),
    ).length * 2;
  }

  if (filters.prefer_title_keywords?.length) {
    score += filters.prefer_title_keywords.filter((keyword) =>
      title.includes(keyword.toLowerCase()),
    ).length * 2;
  }

  return score;
}

function findRecipesForMealRule(rule, options = {}) {
  const history = options.history ?? [];
  const rankedRecipes = allRecipes
    .map((recipe) => ({ recipe, score: scoreRecipeForMealRule(recipe, rule) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);

  const topRecipes = rankedRecipes.slice(0, 8).map((entry) => entry.recipe);
  const category = rule.filters?.categories?.[0] ?? null;
  const seenRecipeIds = category ? getSeenRecipeIds(history, category) : new Set();
  const unseen = category
    ? topRecipes.filter((recipe) => !seenRecipeIds.has(recipe.id))
    : topRecipes;
  const rankedPool = unseen.length > 0 ? unseen : topRecipes;

  return shuffleItems(rankedPool).slice(0, randomIdeaCount());
}

function isIngredientDrivenRecipeQuery(query) {
  return (
    /(recipe|recipes|meal|meals|breakfast|lunch|dinner|using|with|plus|and)/i.test(query) &&
    searchIngredients(query).length > 0
  );
}

function findDirectRecipeMatches(query) {
  const normalizedQuery = normalizeLookupText(query);
  if (!normalizedQuery) return [];

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  if (queryTokens.length === 0) return [];

  const candidates = [...allRecipes, ...allCuratedMeals];

  return candidates
    .map((recipe) => {
      const normalizedName = normalizeLookupText(recipe.name);
      const matchedTokenCount = queryTokens.filter((token) =>
        normalizedName.includes(token),
      ).length;
      const score =
        (normalizedName === normalizedQuery ? 100 : 0) +
        (normalizedName.includes(normalizedQuery) ? 30 : 0) +
        matchedTokenCount * 10;

      return { recipe, score, matchedTokenCount };
    })
    .filter((entry) => entry.matchedTokenCount >= Math.min(queryTokens.length, 2))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.recipe)
    .slice(0, 2);
}

function shouldUseDirectRecipeReply(query) {
  return findDirectRecipeMatches(query).length > 0;
}

function scoreRecipeIngredientMatch(recipe, query, ingredientMatches, focus) {
  let score =
    scoreText(query, recipe.name) * 2 +
    scoreText(query, recipe.description ?? "") +
    scoreText(query, recipe.source_note ?? "");

  if (focus && recipe.category === focus) score += 4;

  const ingredientSlugs = recipe.ingredient_slugs ?? [];
  const ingredientText = recipe.ingredient_text ?? ingredientSlugs.join(" ");
  let matchedIngredients = 0;
  let exactIngredientMatches = 0;

  for (const ingredient of ingredientMatches) {
    const ingredientName = ingredient.name.toLowerCase();
    const ingredientSlug = ingredient.slug;
    const ingredientTokens = tokenize(ingredientName);
    let matched = false;

    if (ingredientSlugs.includes(ingredientSlug)) {
      score += 10;
      matched = true;
      exactIngredientMatches += 1;
    }

    if (ingredientText.includes(ingredientName)) {
      score += 8;
      matched = true;
    }

    const tokenMatches = ingredientTokens.filter((token) => ingredientText.includes(token)).length;
    if (tokenMatches > 0) {
      score += tokenMatches * 2;
      matched = true;
    }

    if (matched) matchedIngredients += 1;
  }

  if (matchedIngredients > 1) score += matchedIngredients * 5;
  if (ingredientMatches.length > 0 && matchedIngredients === ingredientMatches.length) score += 8;

  return {
    score,
    matchedIngredients,
    exactIngredientMatches,
    totalRequestedIngredients: ingredientMatches.length,
  };
}

function findRecipeMatchesByIngredients(query) {
  const focus = findFocusFromQuery(query);
  const ingredientMatches = searchIngredients(query).slice(0, 5);
  if (ingredientMatches.length === 0) return [];

  const candidates = [...allRecipes, ...allCuratedMeals];

  return candidates
    .map((recipe) => {
      const ranking = scoreRecipeIngredientMatch(recipe, query, ingredientMatches, focus);

      return {
        recipe,
        ...ranking,
      };
    })
    .filter((entry) => entry.score > 0 && entry.matchedIngredients > 0)
    .sort((a, b) => {
      if (b.matchedIngredients !== a.matchedIngredients) {
        return b.matchedIngredients - a.matchedIngredients;
      }

      if (b.exactIngredientMatches !== a.exactIngredientMatches) {
        return b.exactIngredientMatches - a.exactIngredientMatches;
      }

      if (b.totalRequestedIngredients !== a.totalRequestedIngredients) {
        return b.totalRequestedIngredients - a.totalRequestedIngredients;
      }

      return b.score - a.score;
    })
    .map((entry) => entry.recipe)
    .slice(0, 2);
}

function getRecipeIngredientList(recipe) {
  const detailedRecipe = getRecipeDetailsById(recipe.id);
  if (detailedRecipe?.ingredients?.length) {
    return detailedRecipe.ingredients
      .slice(0, 6)
      .map((ingredient) => ingredient.name);
  }

  if (recipe.ingredient_list?.length) {
    return recipe.ingredient_list.slice(0, 6);
  }

  if (!recipe.ingredient_slugs?.length) return [];

  return recipe.ingredient_slugs
    .slice(0, 6)
    .map((slug) => getIngredientBySlug(slug)?.name ?? slug.replace(/-/g, " "));
}

function getRecipeMethodSteps(recipe) {
  const detailedRecipe = getRecipeDetailsById(recipe.id);
  if (detailedRecipe?.cooking_steps?.length) {
    return detailedRecipe.cooking_steps.slice(0, 3);
  }

  if (recipe.steps?.length) {
    return recipe.steps.slice(0, 3);
  }

  return [];
}

function buildDebugTrace(query, response, extra = {}) {
  return {
    query,
    intent: response?.intent ?? null,
    answerType: response?.answerType ?? null,
    sourceIds: (response?.sources ?? []).map((source) => source.id),
    ...extra,
  };
}

function scoreMoveForWorkoutRule(move, rule) {
  const filters = rule.filters ?? {};
  let score = 0;

  if (filters.difficulties?.length) {
    if (!filters.difficulties.includes(move.difficulty)) return -1;
    score += 4;
  }

  if (filters.focuses?.length) {
    if (!filters.focuses.includes(move.focus)) return -1;
    score += 5;
  }

  return score + scoreText(rule.topic, `${move.name} ${move.machine} ${move.focus} ${move.difficulty}`);
}

function findMovesForWorkoutRule(rule) {
  return allWorkoutMoves
    .map((move) => ({ move, score: scoreMoveForWorkoutRule(move, rule) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.move)
    .slice(0, 2);
}

function formatRecipeReply(query, options = {}) {
  const history = options.history ?? [];
  const focus = findFocusFromQuery(query) ?? (isMoreIdeasQuery(query) ? findRecentFoodCategory(history) : null);
  const directRecipeMatches = findDirectRecipeMatches(query);
  const ingredientDrivenResults = isIngredientDrivenRecipeQuery(query)
    ? findRecipeMatchesByIngredients(query)
    : [];
  const categoryFallbackResults =
    focus && ["breakfast", "lunch", "dinner"].includes(focus)
      ? getRecipeResultsForCategory(focus, history)
      : [];
  const results =
    directRecipeMatches.length > 0
      ? directRecipeMatches
      : ingredientDrivenResults.length > 0
      ? ingredientDrivenResults
      : categoryFallbackResults.length > 0
        ? categoryFallbackResults
        : searchRecipes(query).slice(0, 2);

  if (results.length === 0) return null;

  const isGenericCategoryReply =
    directRecipeMatches.length === 0 &&
    ingredientDrivenResults.length === 0 &&
    categoryFallbackResults.length > 0;
  const intro = directRecipeMatches.length > 0
    ? "Here is the recipe match from your vault:"
    : ingredientDrivenResults.length > 0
    ? "Here are the closest recipe matches for those ingredients:"
    : focus
      ? isMoreIdeasQuery(query)
        ? `Here are a few more ${focus} ideas from your vault:`
        : `Here are a few ${focus} ideas from your vault:`
      : "Here are a few matches from your vault:";

  const lines = results.map((recipe) => {
    if (isGenericCategoryReply) {
      return `- ${recipe.name}`;
    }

    const ingredients = getRecipeIngredientList(recipe);
    const methodSteps = directRecipeMatches.some((match) => match.id === recipe.id)
      ? getRecipeMethodSteps(recipe)
      : [];

    if (methodSteps.length > 0) {
      return `- ${recipe.name}\n  Ingredients: ${ingredients.join(", ")}\n  How to make it:\n${methodSteps.map((step, index) => `  ${index + 1}. ${step}`).join("\n")}`;
    }

    return `- ${recipe.name}: ${ingredients.join(", ")}`;
  });

  return createResponse(`${intro}\n${lines.join("\n")}`, {
    intent: "meal",
    answerType: "recipe_recommendation",
    facts: {
      category: focus ?? null,
      recipeIds: results.map((recipe) => recipe.id),
    },
    sources: results.map((recipe) => ({
      type: "recipe",
      id: recipe.id,
      title: recipe.name,
      path: recipe.source_note,
    })),
    debug: buildDebugTrace(query, {
      intent: "meal",
      answerType: "recipe_recommendation",
      sources: results.map((recipe) => ({ id: recipe.id })),
    }, {
      focus,
      directRecipeLookup: directRecipeMatches.length > 0,
      ingredientDriven: ingredientDrivenResults.length > 0,
      categoryFallback: isGenericCategoryReply,
      matchedRecipeIds: results.map((recipe) => recipe.id),
      matchedIngredients: ingredientDrivenResults.length > 0
        ? searchIngredients(query).slice(0, 5).map((ingredient) => ingredient.slug)
        : [],
    }),
  });
}

function formatMealRuleReply(query, options = {}) {
  const history = options.history ?? [];
  if (shouldUseDirectRecipeReply(query)) return null;
  if (isIngredientDrivenRecipeQuery(query)) return null;

  const rule = searchMealRules(query)[0];
  if (!rule) return null;

  const recipes = findRecipesForMealRule(rule, { history });
  if (recipes.length === 0) return null;

  const noteSources = (rule.source_note_ids ?? [])
    .map((id) => getChatbotNoteById(id))
    .filter(Boolean);

  const isGenericIdeaRule = ["breakfast-ideas", "dinner-ideas"].includes(rule.id);
  const lines = isGenericIdeaRule
    ? clampItems(recipes, randomIdeaCount()).map((recipe) => `- ${recipe.name}`)
    : [
        rule.intro,
        ...clampItems(recipes).map(
          (recipe) => `- ${recipe.name}: ${getRecipeIngredientList(recipe).join(", ")}`,
        ),
        ...(rule.why_it_fits?.[0] ? [`Why: ${rule.why_it_fits[0]}`] : []),
        ...(rule.caution ? [`Caution: ${rule.caution}`] : []),
      ];

  return createResponse(lines.join("\n"), {
    intent: "meal",
    answerType: "meal_recommendation_rule",
    facts: {
      mealRuleId: rule.id,
      topic: rule.topic,
      recipeIds: recipes.map((recipe) => recipe.id),
      filters: rule.filters ?? {},
    },
    sources: [
      { type: "meal-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/mealRules.json" },
      ...recipes.map((recipe) => ({
        type: "recipe",
        id: recipe.id,
        title: recipe.name,
        path: recipe.source_note,
      })),
      ...noteSources.map((note) => ({
        type: "note",
        id: note.id,
        title: note.title,
        path: note.path,
      })),
    ],
    debug: buildDebugTrace(query, {
      intent: "meal",
      answerType: "meal_recommendation_rule",
      sources: [{ id: rule.id }, ...recipes.map((recipe) => ({ id: recipe.id }))],
    }, {
      mealRuleId: rule.id,
      matchedRecipeIds: recipes.map((recipe) => recipe.id),
    }),
  });
}

function formatIngredientReply(query) {
  const matches = searchIngredients(query).slice(0, 2);
  if (matches.length === 0) return null;

  const lines = matches.map(
    (ingredient) =>
      `- ${ingredient.name}: appears in ${ingredient.count} recipe${ingredient.count === 1 ? "" : "s"} in your vault.`,
  );

  return createResponse(`I found these ingredient matches:\n${lines.join("\n")}`, {
    intent: "ingredient",
    answerType: "ingredient_lookup",
    facts: {
      ingredientSlugs: matches.map((ingredient) => ingredient.slug),
    },
    sources: matches.map((ingredient) => ({
      type: "ingredient",
      id: ingredient.slug,
      title: ingredient.name,
      path: ingredient.path,
    })),
    debug: buildDebugTrace(query, {
      intent: "ingredient",
      answerType: "ingredient_lookup",
      sources: matches.map((ingredient) => ({ id: ingredient.slug })),
    }, {
      matchedIngredients: matches.map((ingredient) => ingredient.slug),
    }),
  });
}

function findIngredientTarget(query) {
  const stripped = query
    .replace(
      /\b(can i|could i|should i|swap out for|swap out|swap|replace|substitute|alternative|alternatives|use instead of|instead of|use|for|with|without|out|good|best|what's|whats|what|can|i|an|a)\b/gi,
      " ",
    )
    .replace(/[^a-z0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const exact = searchIngredients(stripped)[0];
  if (exact) return exact;

  return searchIngredients(query)[0] ?? null;
}

function findSwapRuleTarget(query, ingredient) {
  const stripped = query
    .replace(
      /\b(can i|could i|should i|swap out for|swap out|swap|replace|substitute|alternative|alternatives|use instead of|instead of|use|for|with|without|out|good|best|what's|whats|what|can|i|an|a)\b/gi,
      " ",
    )
    .replace(/[^a-z0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    searchSwapRules(ingredient?.name ?? "")[0] ??
    searchSwapRules(stripped)[0] ??
    searchSwapRules(query)[0] ??
    null
  );
}

function isExplicitSwapQuery(query) {
  return /(swap out for|swap out|swap|replace|substitut|alternative|use instead of|instead of|change)/i.test(query);
}

function shouldUseSwapReply(query) {
  if (!isExplicitSwapQuery(query)) return false;

  const ingredient = findIngredientTarget(query);
  const rule = findSwapRuleTarget(query, ingredient);

  return Boolean(ingredient || rule);
}

function formatSwapReply(query) {
  const ingredient = findIngredientTarget(query);
  const rule = findSwapRuleTarget(query, ingredient);
  const noteIds = rule?.source_note_ids ?? [];
  const ruleNotes = noteIds.map((id) => getChatbotNoteById(id)).filter(Boolean);
  const relevantNote =
    ruleNotes[0] ??
    searchChatbotNotes(query).find((note) =>
      (note.targets ?? []).some((target) =>
        ingredient?.name?.toLowerCase().includes(target) ||
        query.toLowerCase().includes(target),
      ),
    ) ??
    searchChatbotNotes(query)[0];

  if (!ingredient && !relevantNote && !rule) return null;

  const guardrailNote = searchChatbotNotes("when not to swap ingredients")[0];
  const conditionNotes = [];

  if (/triglycer/i.test(query)) {
    const note = searchChatbotNotes("high triglycerides ingredient swap pack")[0];
    if (note) conditionNotes.push(note);
  }

  if (/pcos/i.test(query)) {
    const note = searchChatbotNotes("pcos ingredient swap pack")[0];
    if (note) conditionNotes.push(note);
  }

  const lines = [];
  const bestSwaps =
    query.toLowerCase().includes("pcos")
      ? rule?.prefer_for_goals?.pcos ?? rule?.best_swaps ?? []
      : query.toLowerCase().includes("triglycer")
        ? rule?.prefer_for_goals?.["high-triglycerides"] ?? rule?.best_swaps ?? []
        : rule?.best_swaps ?? [];

  if (ingredient || rule?.target) lines.push(`Best match: ${ingredient?.name ?? rule.target}.`);
  if (bestSwaps.length > 0) lines.push(`Best swaps: ${bestSwaps.slice(0, 3).join(", ")}.`);
  if (rule?.changes?.length) lines.push(`What changes: ${rule.changes[0]}`);
  if (rule?.caution) {
    lines.push(`Caution: ${rule.caution}`);
  } else if (guardrailNote?.keyPoints?.[0]) {
    lines.push(`Caution: ${guardrailNote.keyPoints[0]}`);
  }
  if (!rule && relevantNote) lines.push(firstSentence(relevantNote.summary));

  for (const note of clampItems(conditionNotes, 1)) {
    lines.push(`${note.title}: ${note.keyPoints?.[0]}`);
  }

  const sources = [];

  if (ingredient) {
    sources.push({
      type: "ingredient",
      id: ingredient.slug,
      title: ingredient.name,
      path: ingredient.path,
    });
  }

  if (rule) {
    sources.push({
      type: "swap-rule",
      id: rule.id,
      title: rule.target,
      path: "src/data/chat/data/swapRules.json",
    });
  }

  if (relevantNote && !sources.some((source) => source.id === relevantNote.id)) {
    sources.push({
      type: "note",
      id: relevantNote.id,
      title: relevantNote.title,
      path: relevantNote.path,
    });
  }

  for (const note of conditionNotes) {
    sources.push({
      type: "note",
      id: note.id,
      title: note.title,
      path: note.path,
    });
  }

  if (guardrailNote) {
    sources.push({
      type: "note",
      id: guardrailNote.id,
      title: guardrailNote.title,
      path: guardrailNote.path,
    });
  }

  return createResponse(lines.join("\n"), {
    intent: "swap",
    answerType: "ingredient_swap",
    facts: {
      target: ingredient?.name ?? rule?.target ?? null,
      suggestions: bestSwaps.slice(0, 3),
      changes: rule?.changes?.slice(0, 2) ?? [],
      caution: rule?.caution ?? guardrailNote?.keyPoints?.[0] ?? null,
      worksWellFor: rule?.works_well_for ?? [],
    },
    sources,
    debug: buildDebugTrace(query, {
      intent: "swap",
      answerType: "ingredient_swap",
      sources: sources.map((source) => ({ id: source.id })),
    }, {
      matchedIngredient: ingredient?.slug ?? null,
      swapRuleId: rule?.id ?? null,
      matchedNoteIds: [relevantNote?.id, ...conditionNotes.map((note) => note.id)].filter(Boolean),
    }),
  });
}

function formatFaqReply(query) {
  const rule = searchFaqRules(query)[0];
  if (!rule) return null;

  const noteSources = (rule.source_note_ids ?? [])
    .map((id) => getChatbotNoteById(id))
    .filter(Boolean);

  const lines = [rule.short_answer];
  if (rule.practical_steps?.[0]) lines.push(`Start with: ${rule.practical_steps[0]}`);
  if (rule.caution) lines.push(`Caution: ${rule.caution}`);

  return createResponse(lines.join("\n"), {
    intent: rule.category === "health" || rule.category === "nutrition" ? "education" : "workout",
    answerType: "faq_answer",
    facts: {
      faqId: rule.id,
      topic: rule.topic,
      category: rule.category,
      shortAnswer: rule.short_answer,
      practicalSteps: rule.practical_steps ?? [],
      caution: rule.caution ?? null,
      followUpSuggestions: rule.follow_up_suggestions ?? [],
    },
    sources: [
      { type: "faq-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/faqRules.json" },
      ...noteSources.map((note) => ({
        type: "note",
        id: note.id,
        title: note.title,
        path: note.path,
      })),
    ],
    debug: buildDebugTrace(query, {
      intent: rule.category === "health" || rule.category === "nutrition" ? "education" : "workout",
      answerType: "faq_answer",
      sources: [{ id: rule.id }],
    }, {
      faqRuleId: rule.id,
    }),
  });
}

function formatWorkoutRuleReply(query) {
  if (isTargetedWorkoutQuery(query)) return null;

  const rule = searchWorkoutRules(query)[0];
  if (!rule) return null;

  const moves = findMovesForWorkoutRule(rule);
  const noteSources = (rule.source_note_ids ?? []).map((id) => getChatbotNoteById(id)).filter(Boolean);

  const lines = [rule.intro];
  if (moves.length > 0) {
    lines.push(
      ...clampItems(moves).map(
        (move) => `- ${move.name}: ${move.sets}. ${firstSentence(move.tips)}`,
      ),
    );
  }
  if (rule.guidance?.[0]) lines.push(`Start with: ${rule.guidance[0]}`);
  if (rule.caution) lines.push(`Caution: ${rule.caution}`);

  return createResponse(lines.join("\n"), {
    intent: "workout",
    answerType: "workout_rule",
    facts: {
      workoutRuleId: rule.id,
      topic: rule.topic,
      moveIds: moves.map((move) => `${move.difficulty}-${move.focus}-${move.name}`),
    },
    sources: [
      { type: "workout-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/workoutRules.json" },
      ...moves.map((move) => ({
        type: "workout",
        id: `${move.difficulty}-${move.focus}-${move.name}`.toLowerCase().replace(/\s+/g, "-"),
        title: `${move.name} (${move.difficulty} ${move.focus})`,
        path: "src/data/pageContent.js",
      })),
      ...noteSources.map((note) => ({ type: "note", id: note.id, title: note.title, path: note.path })),
    ],
    debug: buildDebugTrace(query, {
      intent: "workout",
      answerType: "workout_rule",
      sources: [{ id: rule.id }, ...moves.map((move) => ({ id: move.name }))],
    }, {
      workoutRuleId: rule.id,
      matchedMoveNames: moves.map((move) => move.name),
    }),
  });
}

function formatMachineRuleReply(query) {
  const rule = searchMachineRules(query)[0];
  if (!rule) return null;

  const noteSources = (rule.source_note_ids ?? []).map((id) => getChatbotNoteById(id)).filter(Boolean);
  const lines = [rule.short_answer];
  if (rule.steps?.[0]) lines.push(`First: ${rule.steps[0]}`);
  if (rule.steps?.[1]) lines.push(`Then: ${rule.steps[1]}`);
  if (rule.caution) lines.push(`Caution: ${rule.caution}`);

  return createResponse(lines.join("\n"), {
    intent: "equipment",
    answerType: "machine_rule",
    facts: { machineRuleId: rule.id, topic: rule.topic, steps: rule.steps ?? [] },
    sources: [
      { type: "machine-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/machineRules.json" },
      ...noteSources.map((note) => ({ type: "note", id: note.id, title: note.title, path: note.path })),
    ],
    debug: buildDebugTrace(query, {
      intent: "equipment",
      answerType: "machine_rule",
      sources: [{ id: rule.id }],
    }, {
      machineRuleId: rule.id,
    }),
  });
}

function findSpecificMachineRule(query) {
  return (
    searchMachineRules(query).find(
      (rule) => !["machine-setup-general", "machine-feels-wrong"].includes(rule.id),
    ) ?? null
  );
}

function formatSpecificMachineReply(query) {
  const machineRule = findSpecificMachineRule(query);
  if (machineRule) {
    const noteSources = (machineRule.source_note_ids ?? [])
      .map((id) => getChatbotNoteById(id))
      .filter(Boolean);
    const lines = [machineRule.short_answer];
    if (machineRule.steps?.[0]) lines.push(`First: ${machineRule.steps[0]}`);
    if (machineRule.steps?.[1]) lines.push(`Then: ${machineRule.steps[1]}`);
    if (machineRule.caution) lines.push(`Caution: ${machineRule.caution}`);

    return createResponse(lines.join("\n"), {
      intent: "equipment",
      answerType: "machine_specific_rule",
      facts: {
        machineRuleId: machineRule.id,
        topic: machineRule.topic,
        steps: machineRule.steps ?? [],
        caution: machineRule.caution ?? null,
      },
      sources: [
        {
          type: "machine-rule",
          id: machineRule.id,
          title: machineRule.topic,
          path: "src/data/chat/data/machineRules.json",
        },
        ...noteSources.map((note) => ({
          type: "note",
          id: note.id,
          title: note.title,
          path: note.path,
        })),
      ],
      debug: buildDebugTrace(query, {
        intent: "equipment",
        answerType: "machine_specific_rule",
        sources: [{ id: machineRule.id }],
      }, {
        machineRuleId: machineRule.id,
      }),
    });
  }

  const move = findMachineMatches(query)[0];
  if (!move) return null;

  const lines = [
    `${move.machine}: start by lining yourself up with the machine path before adding load.`,
  ];

  if (move.how?.[0]) {
    lines.push(`First: ${move.how[0]}`);
  } else {
    lines.push(`First: Set the seat or pad so the joint you are training lines up with the pivot point.`);
  }

  lines.push(`Then: ${firstSentence(move.tips)}`);

  if (move.watch?.[0]) {
    lines.push(`Caution: ${move.watch[0]}`);
  }

  return createResponse(lines.join("\n"), {
    intent: "equipment",
    answerType: "machine_specific_help",
    facts: {
      machine: move.machine,
      moveName: move.name,
      difficulty: move.difficulty,
      focus: move.focus,
      setup: move.how ?? [],
      caution: move.watch?.[0] ?? null,
    },
    sources: [
      {
        type: "workout",
        id: `${move.difficulty}-${move.focus}-${move.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: `${move.machine} / ${move.name}`,
        path: "src/data/pageContent.js",
      },
    ],
    debug: buildDebugTrace(query, {
      intent: "equipment",
      answerType: "machine_specific_help",
      sources: [{ id: move.name }],
    }, {
      matchedMachine: move.machine,
      matchedMoveName: move.name,
    }),
  });
}

function formatSnackRuleReply(query) {
  const rule = searchSnackRules(query)[0];
  if (!rule) return null;

  const noteSources = (rule.source_note_ids ?? []).map((id) => getChatbotNoteById(id)).filter(Boolean);
  const lines = [
    "Here are a few realistic snack directions:",
    ...rule.suggestions.slice(0, 2).map((item) => `- ${item}`),
  ];
  if (rule.why) lines.push(`Why: ${rule.why}`);
  if (rule.caution) lines.push(`Caution: ${rule.caution}`);

  return createResponse(lines.join("\n"), {
    intent: "snack",
    answerType: "snack_rule",
    facts: { snackRuleId: rule.id, suggestions: rule.suggestions.slice(0, 2) },
    sources: [
      { type: "snack-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/snackRules.json" },
      ...noteSources.map((note) => ({ type: "note", id: note.id, title: note.title, path: note.path })),
    ],
    debug: buildDebugTrace(query, {
      intent: "snack",
      answerType: "snack_rule",
      sources: [{ id: rule.id }],
    }, {
      snackRuleId: rule.id,
    }),
  });
}

function formatPlanRuleReply(query) {
  const rule = searchPlanRules(query)[0];
  if (!rule) return null;

  const noteSources = (rule.source_note_ids ?? []).map((id) => getChatbotNoteById(id)).filter(Boolean);
  const lines = [
    "Here is a simple starting plan:",
    ...rule.outline.slice(0, 3).map((item) => `- ${item}`),
  ];
  if (rule.caution) lines.push(`Caution: ${rule.caution}`);

  return createResponse(lines.join("\n"), {
    intent: "plan",
    answerType: "plan_rule",
    facts: { planRuleId: rule.id, outline: rule.outline ?? [] },
    sources: [
      { type: "plan-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/planRules.json" },
      ...noteSources.map((note) => ({ type: "note", id: note.id, title: note.title, path: note.path })),
    ],
    debug: buildDebugTrace(query, {
      intent: "plan",
      answerType: "plan_rule",
      sources: [{ id: rule.id }],
    }, {
      planRuleId: rule.id,
    }),
  });
}

function formatWorkoutReply(query) {
  const focus = findFocusFromQuery(query);
  const targetGroup = findWorkoutTargetGroup(query);
  const matches = targetGroup
    ? allWorkoutMoves.filter((move) => moveMatchesTargetGroup(move, targetGroup)).slice(0, 2)
    : focus
      ? allWorkoutMoves.filter((move) => move.focus === focus).slice(0, 2)
      : findWorkoutMatches(query).slice(0, 2);

  if (matches.length === 0) return null;

  const lines = matches.map(
    (move) => `- ${move.name}: ${move.sets}. ${firstSentence(move.tips)}`,
  );

  const intro = targetGroup
    ? `Here are a few ${targetGroup} workouts from the app data:`
    : "Here are a few workout ideas from the app data:";

  return createResponse(`${intro}\n${lines.join("\n")}`, {
    intent: "workout",
    answerType: "workout_recommendation",
    facts: {
      focus: focus ?? null,
      targetGroup,
      moves: matches.map((move) => ({
        name: move.name,
        machine: move.machine,
        difficulty: move.difficulty,
        focus: move.focus,
      })),
    },
    sources: matches.map((move) => ({
      type: "workout",
      id: `${move.difficulty}-${move.focus}-${move.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: `${move.name} (${move.difficulty} ${move.focus})`,
      path: "src/data/pageContent.js",
    })),
    debug: buildDebugTrace(query, {
      intent: "workout",
      answerType: "workout_recommendation",
      sources: matches.map((move) => ({ id: move.name })),
    }, {
      focus,
      targetGroup,
      matchedMoveNames: matches.map((move) => move.name),
    }),
  });
}

function formatEducationReply(query) {
  const needle = query.toLowerCase();
  const matches = education.filter((item) =>
    [item.title, item.desc, item.action].join(" ").toLowerCase().includes(needle),
  );

  if (matches.length === 0 && !needle.includes("triglycer") && !needle.includes("pcos")) {
    return null;
  }

  const items = matches.length > 0 ? matches.slice(0, 2) : education.slice(0, 2);
  const lines = items.map(
    (item) => `- ${item.title}: ${firstSentence(item.desc)}${item.action ? ` ${firstSentence(item.action)}` : ""}`,
  );

  return createResponse(
    `Here's the short version:\n${lines.join("\n")}`,
    {
      intent: "education",
      answerType: "health_education",
      facts: {
        topics: items.map((item) => item.title),
      },
      sources: [
        ...items.map((item) => ({
          type: "education",
          id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: item.title,
          path: "src/data/pageContent.js",
        })),
        ...getChatbotNotes().slice(0, 2).map((note) => ({
          type: "note",
          id: note.id,
          title: note.title,
          path: note.path,
        })),
      ],
      debug: buildDebugTrace(query, {
        intent: "education",
        answerType: "health_education",
        sources: items.map((item) => ({ id: item.title })),
      }, {
        matchedTopics: items.map((item) => item.title),
      }),
    },
  );
}

function classifyIntent(query) {
  const scores = {
    faq: /(what is|what are|what should i|how do i|how to|why does|best workout|routine|plan)/i.test(query) ? 3 : 0,
    meal: isMealQuery(query) ? 2 : 0,
    ingredient: isIngredientQuery(query) ? 2 : 0,
    workout: isWorkoutQuery(query) ? 2 : 0,
    education: isEducationQuery(query) ? 2 : 0,
    snack: /snack/i.test(query) ? 3 : 0,
    plan: /(plan|routine|week|today|3 day|day of eating)/i.test(query) ? 3 : 0,
    equipment: /machine|setup|feel wrong|equipment|leg press|chest press/i.test(query) ? 3 : 0,
    swap: /(swap|substitut|replace|alternative|use instead of|instead of|change)/i.test(query) ? 4 : 0,
  };

  if (/breakfast|lunch|dinner|recipe|meal/i.test(query)) scores.meal += 2;
  if (/ingredient|onion|rice|curd|buttermilk|coconut|grain/i.test(query)) scores.ingredient += 2;
  if (/machine|leg press|dumbbell|cardio|treadmill|gym/i.test(query)) scores.workout += 2;
  if (/triglycer|pcos|cholesterol|why|what is|what are/i.test(query)) scores.education += 2;
  if (/pcos|triglycer|machine|equipment|routine|setup|feel wrong|how do i use/i.test(query)) scores.faq += 2;
  if (/snack|fill|hungry|low sugar/i.test(query)) scores.snack += 2;
  if (/3 day|weekly|plan|routine|today/i.test(query)) scores.plan += 2;
  if (/machine|setup|feel wrong|leg press|chest press/i.test(query)) scores.equipment += 2;

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "education";
}

function formatSafetyReply() {
  const safetyRule =
    getSafetyRuleById("medical-red-flags") ?? searchSafetyRules("medical red flags")[0];

  return createResponse(
    safetyRule?.response ??
      "I can help with workouts, meals, ingredient swaps, and basic health education from your vault, but I should not diagnose urgent symptoms or replace clinician advice. If this is about chest pain, fainting, severe pain, pancreatitis symptoms, medication changes, or fertility treatment decisions, please get medical guidance directly.",
    {
      intent: "safety",
      answerType: "safety_redirect",
      sources: [
        ...(safetyRule
          ? [{ type: "safety-rule", id: safetyRule.id, title: safetyRule.id, path: "src/data/chat/data/safetyRules.json" }]
          : []),
        ...searchChatbotNotes("chatbot boundaries").slice(0, 1).map((note) => ({
          type: "note",
          id: note.id,
          title: note.title,
          path: note.path,
        })),
      ],
      debug: buildDebugTrace("safety", {
        intent: "safety",
        answerType: "safety_redirect",
        sources: safetyRule ? [{ id: safetyRule.id }] : [],
      }, {
        safetyRuleId: safetyRule?.id ?? null,
      }),
    },
  );
}

function isSafetySensitive(query) {
  const needle = query.toLowerCase();
  const safetyRules = [
    getSafetyRuleById("medical-red-flags"),
    ...searchSafetyRules(query),
  ].filter(Boolean);

  return safetyRules.some((rule) =>
    (rule.patterns ?? []).some((pattern) => needle.includes(pattern.toLowerCase())),
  );
}

function isMealQuery(query) {
  return /(breakfast|lunch|dinner|snack|meal|recipe|eat|food|plate|protein)/i.test(
    query,
  );
}

function isIngredientQuery(query) {
  return /(ingredient|swap|substitut|replace|alternative|use instead of|instead of|allergy|without|change)/i.test(
    query,
  );
}

function isWorkoutQuery(query) {
  return /(workout|exercise|gym|machine|cardio|upper|lower|leg|strength|fitness|weight loss|fat loss|abs|core|chest|back|biceps|triceps|shoulders|glutes|hamstrings|quads|calves)/i.test(
    query,
  );
}

function isEducationQuery(query) {
  return /(triglycer|pcos|health|why|what is|what are|help)/i.test(query);
}

export function createStarterMessages() {
  return [
    {
      id: "welcome",
      role: "assistant",
      text: "Hey there, I am your GlowUp girlie. Right now I answer from a local vault and app data, so sorry if I don't know everything!",
      intent: "welcome",
      answerType: "welcome",
      facts: {},
      sources: [],
    },
    {
      id: "prompt",
      role: "assistant",
      text: fallbackPrompts.join(" "),
      intent: "prompt",
      answerType: "prompt",
      facts: {},
      sources: [],
    },
  ];
}

export function buildAssistantReply(query, options = {}) {
  const history = options.history ?? [];
  if (isSafetySensitive(query)) {
    return formatSafetyReply();
  }

  if (shouldUseDirectRecipeReply(query)) {
    return formatRecipeReply(query, { history });
  }

  if (isIngredientDrivenRecipeQuery(query)) {
    return formatRecipeReply(query, { history }) ?? formatIngredientReply(query);
  }

  if (shouldUseSwapReply(query)) {
    return formatSwapReply(query) ?? formatIngredientReply(query);
  }

  if (isSpecificMachineUseQuery(query)) {
    return formatSpecificMachineReply(query) ?? formatMachineRuleReply(query);
  }

  if (isSpecificMachineTroubleshootingQuery(query)) {
    return formatSpecificMachineReply(query) ?? formatMachineRuleReply(query);
  }

  const intent = classifyIntent(query);
  const handlersByIntent = {
    faq: () => formatFaqReply(query),
    swap: () => formatSwapReply(query) ?? formatIngredientReply(query),
    meal: () => formatMealRuleReply(query, { history }) ?? formatRecipeReply(query, { history }),
    ingredient: () => formatIngredientReply(query),
    workout: () => formatWorkoutRuleReply(query) ?? formatWorkoutReply(query),
    education: () => formatEducationReply(query),
    snack: () => formatSnackRuleReply(query),
    plan: () => formatPlanRuleReply(query),
    equipment: () => formatSpecificMachineReply(query) ?? formatMachineRuleReply(query),
  };

  const orderedHandlers = [
    handlersByIntent[intent],
    () => formatFaqReply(query),
    () => formatSwapReply(query),
    () => formatMealRuleReply(query, { history }),
    () => formatSnackRuleReply(query),
    () => formatPlanRuleReply(query),
    () => formatSpecificMachineReply(query) ?? formatMachineRuleReply(query),
    () => formatWorkoutRuleReply(query),
    () => formatRecipeReply(query, { history }),
    () => formatIngredientReply(query),
    () => formatWorkoutReply(query),
    () => formatEducationReply(query),
  ];

  const firstMatch = orderedHandlers.map((handler) => handler?.()).find(Boolean);
  if (firstMatch) return firstMatch;

  const suggestions = uniqueList(fallbackPrompts);
  return createResponse(
    `I do not have a strong match for that yet. ${suggestions[0]}`,
    {
      intent: "fallback",
      answerType: "fallback",
      facts: {},
      sources: [],
      debug: buildDebugTrace(query, {
        intent: "fallback",
        answerType: "fallback",
        sources: [],
      }),
    },
  );
}
