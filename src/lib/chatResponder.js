import { education, meals, workoutPlans } from "@/data/pageContent";
import {
  getChatbotNotes,
  getChatbotNoteById,
  getAllRecipes,
  getFaqRuleById,
  getIngredientBySlug,
  getMachineRuleById,
  getMealRuleById,
  getPlanRuleById,
  getRecipeDetailsById,
  getRecipesByCategory,
  getSafetyRuleById,
  getSnackRuleById,
  getWorkoutRuleById,
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

function userFacingRuleText(value) {
  if (!value) return "";

  return value
    .replace(/^\s*(Start with|Caution|Warning|First|Then)\s*:\s*/i, "")
    .replace(/\bthe chatbot\b/gi, "this chat")
    .trim();
}

function addRuleText(lines, value) {
  const text = userFacingRuleText(value);
  if (text) lines.push(text);
}

function getHealthCondition(query) {
  const hasPcos = /\bpcos\b|polycystic/i.test(query);
  const hasTriglycerides = /\btriglycerides?\b|high triglycerides?|blood fats?/i.test(query);

  if (hasPcos && hasTriglycerides) return "both";
  if (hasPcos) return "pcos";
  if (hasTriglycerides) return "triglycerides";
  return null;
}

function getRuleConditionText(rule) {
  return [
    rule.id,
    rule.topic,
    rule.category,
    ...(rule.question_patterns ?? []),
    ...(rule.patterns ?? []),
    ...(rule.source_note_ids ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function ruleMentionsCondition(rule, condition) {
  const text = getRuleConditionText(rule);

  if (condition === "pcos") {
    return /\bpcos\b|polycystic/.test(text);
  }

  if (condition === "triglycerides") {
    return /\btriglycerides?\b|high-triglycerides/.test(text);
  }

  return false;
}

function rankConditionRules(rules, query, fallbackRules = []) {
  const condition = getHealthCondition(query);
  const baseRules = rules.filter(Boolean);

  if (!condition) return baseRules;

  const candidates = uniqueList([...baseRules, ...fallbackRules].filter(Boolean));

  if (condition === "both") return candidates;

  const otherCondition = condition === "pcos" ? "triglycerides" : "pcos";
  const exact = candidates.filter(
    (rule) => ruleMentionsCondition(rule, condition) && !ruleMentionsCondition(rule, otherCondition),
  );
  if (exact.length > 0) return exact;

  const compatible = candidates.filter((rule) => ruleMentionsCondition(rule, condition));
  if (compatible.length > 0) return compatible;

  const nonConflicting = candidates.filter((rule) => !ruleMentionsCondition(rule, otherCondition));
  return nonConflicting.length > 0 ? nonConflicting : candidates;
}

function getChatDetailLevel(query) {
  if (isSafetySensitive(query)) return "safety";
  if (/(plan|routine|week|weekly|today|day of eating|schedule|program)/i.test(query)) return "structured";
  if (/(explain|details?|detail|why|how does|how do|compare|difference|break it down|tell me more)/i.test(query)) {
    return "long";
  }
  if (/(meal|food|eat|recipe|workout|exercise|swap|substitute|replace|machine|setup|triglycer|pcos)/i.test(query)) {
    return "medium";
  }
  return "short";
}

function getDetailLimit(detailLevel, limits = {}) {
  const defaults = {
    safety: 1,
    short: 1,
    medium: 2,
    long: 3,
    structured: 4,
  };

  return limits[detailLevel] ?? defaults[detailLevel] ?? defaults.short;
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
      .replace(/\b(recipe|recipes|show me|give me|for|please)\b/g, " ")
      .replace(/\b(how much|how many|what is|what's|whats|what are|listed|amount|nutrition|macro|macros)\b/g, " ")
      .replace(/\b(protein|calories|calorie|kcal|carbs|carb|carbohydrates|fat|fats|grams|gram|g|in|of|does|have|has|is|are)\b/g, " "),
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

function findRecentAssistantContext(history = []) {
  return [...history]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        !["welcome", "prompt", "fallback"].includes(message.answerType),
    ) ?? null;
}

function getRecipeById(id) {
  return [...allRecipes, ...allCuratedMeals].find((recipe) => recipe.id === id) ?? null;
}

function findRecentRecipeContext(history = []) {
  const recentAssistantMessage = [...history]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        Array.isArray(message.facts?.recipeIds) &&
        message.facts.recipeIds.length > 0,
    );
  const recipeId = recentAssistantMessage?.facts?.recipeIds?.[0] ?? null;
  const recipe = recipeId ? getRecipeById(recipeId) : null;

  return recipe ? { recipe, fromAnswerType: recentAssistantMessage.answerType } : null;
}

function findRecentIngredientContext(history = []) {
  const recentAssistantMessage = [...history]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        (Array.isArray(message.facts?.ingredientSlugs) || message.facts?.target),
    );
  const slug = recentAssistantMessage?.facts?.ingredientSlugs?.[0] ?? null;
  const ingredient = slug
    ? getIngredientBySlug(slug)
    : searchIngredients(recentAssistantMessage?.facts?.target ?? "")[0] ?? null;

  return ingredient ? { ingredient, fromAnswerType: recentAssistantMessage.answerType } : null;
}

function findRecentWorkoutContext(history = []) {
  const recentAssistantMessage = [...history]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        (Array.isArray(message.facts?.moves) || Array.isArray(message.facts?.moveIds)),
    );
  const moveFact = recentAssistantMessage?.facts?.moves?.[0] ?? null;
  const move = moveFact
    ? allWorkoutMoves.find(
      (item) =>
        item.name === moveFact.name &&
        item.focus === moveFact.focus &&
        item.difficulty === moveFact.difficulty,
    ) ?? moveFact
    : null;

  return move ? { move, fromAnswerType: recentAssistantMessage.answerType } : null;
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

function getMoveKey(move) {
  return `${move.difficulty}-${move.focus}-${move.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getSeenMoveKeys(history = []) {
  return new Set(
    history.flatMap((message) => {
      if (message.role !== "assistant") return [];

      const moves = message.facts?.moves ?? [];
      const moveIds = message.facts?.moveIds ?? [];

      return [
        ...moveIds.map((id) => String(id).toLowerCase().replace(/[^a-z0-9]+/g, "-")),
        ...moves.map((move) =>
          `${move.difficulty ?? ""}-${move.focus ?? ""}-${move.name ?? ""}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
        ),
      ].filter(Boolean);
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

  if (filters.hard_exclude_ingredient_slugs?.length) {
    const hasHardExcluded = filters.hard_exclude_ingredient_slugs.some((slug) =>
      ingredientSlugs.includes(slug),
    );
    if (hasHardExcluded) return -1;
  }

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

function mergeUniqueValues(...groups) {
  return uniqueList(groups.flat().filter(Boolean));
}

function refineMealRuleForQuery(rule, query) {
  if (!rule) return null;

  const filters = { ...(rule.filters ?? {}) };
  const condition = getHealthCondition(query);
  const conditionRule = condition === "pcos"
    ? getMealRuleById("pcos-friendly-meals")
    : condition === "triglycerides"
      ? getMealRuleById("triglyceride-friendly-meals")
      : null;

  if (/(breakfast|lunch|dinner)/i.test(query)) {
    const category = findFocusFromQuery(query);
    if (category) filters.categories = [category];
  }

  if (/high protein|more protein|protein/i.test(query)) {
    filters.min_protein_g = Math.max(filters.min_protein_g ?? 0, filters.categories?.includes("dinner") ? 20 : 16);
  }

  if (/light|lighter|low calorie|lower calorie/i.test(query)) {
    filters.max_calories = Math.min(filters.max_calories ?? Number.MAX_SAFE_INTEGER, 420);
  }

  if (conditionRule?.filters?.prefer_ingredient_slugs?.length) {
    filters.prefer_ingredient_slugs = mergeUniqueValues(
      filters.prefer_ingredient_slugs ?? [],
      conditionRule.filters.prefer_ingredient_slugs,
    );
  }

  if (conditionRule?.filters?.exclude_ingredient_slugs?.length) {
    filters.exclude_ingredient_slugs = mergeUniqueValues(
      filters.exclude_ingredient_slugs ?? [],
      conditionRule.filters.exclude_ingredient_slugs,
    );
  }

  return {
    ...rule,
    filters,
    topic: condition && condition !== "both" ? `${rule.topic}-${condition}` : rule.topic,
  };
}

function isIngredientDrivenRecipeQuery(query) {
  if (isExplicitSwapQuery(query)) return false;

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
  if (isExplicitSwapQuery(query)) return false;

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

function formatNutritionEvidence(recipe, rule = null) {
  const nutrition = recipe.nutrition_per_serving ?? {};
  const parts = [];

  if (typeof nutrition.protein_g === "number") {
    parts.push(`${nutrition.protein_g}g protein`);
  }

  if (typeof nutrition.calories === "number") {
    parts.push(`${nutrition.calories} kcal`);
  }

  if (parts.length === 0) {
    return rule?.filters?.min_protein_g ? "protein amount not listed in the vault" : "";
  }

  return parts.join(", ");
}

function getNutritionMetric(query) {
  if (/\bprotein\b/i.test(query)) return { key: "protein_g", label: "protein", unit: "g" };
  if (/\bcalories?\b|\bkcal\b/i.test(query)) return { key: "calories", label: "calories", unit: "kcal" };
  if (/\bcarbs?\b|carbohydrate/i.test(query)) return { key: "carbs_g", label: "carbs", unit: "g" };
  if (/\bfat\b|fats/i.test(query)) return { key: "fat_g", label: "fat", unit: "g" };
  return null;
}

function formatNutritionValue(value, metric) {
  if (typeof value !== "number") return null;
  return metric.unit === "kcal" ? `${value} kcal` : `${value}g ${metric.label}`;
}

function isNutritionLookupQuery(query) {
  return Boolean(getNutritionMetric(query)) && /(how much|how many|which|most|highest|least|lowest|nutrition|macro|macros|in )/i.test(query);
}

function isNutritionRankingQuery(query) {
  return /(which|most|highest|least|lowest|rank|ranking|top)/i.test(query);
}

function isComparisonQuery(query) {
  return /(which|what).*(better|best)|\bvs\b| versus | compare | or /i.test(query) && searchIngredients(query).length >= 2;
}

function findNutritionCategory(query) {
  return findFocusFromQuery(query);
}

function getRankedRecipesByNutrition(query, metric, limit = 5) {
  const category = findNutritionCategory(query);
  const wantsLowest = /(least|lowest|low calorie|lower calorie)/i.test(query);
  const candidates = allRecipes.filter((recipe) => {
    if (category && recipe.category !== category) return false;
    return typeof recipe.nutrition_per_serving?.[metric.key] === "number";
  });

  return candidates
    .sort((a, b) => {
      const aValue = a.nutrition_per_serving[metric.key];
      const bValue = b.nutrition_per_serving[metric.key];
      return wantsLowest ? aValue - bValue : bValue - aValue;
    })
    .slice(0, limit);
}

function formatComparisonReply(query, options = {}) {
  if (!isComparisonQuery(query)) return null;

  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const condition = getHealthCondition(query);
  const matches = searchIngredients(query).slice(0, 4);
  const uniqueMatches = uniqueList(matches.map((ingredient) => ingredient.slug))
    .map((slug) => matches.find((ingredient) => ingredient.slug === slug))
    .filter(Boolean)
    .slice(0, 2);
  if (uniqueMatches.length < 2) return null;

  const conditionRule = condition === "pcos"
    ? getMealRuleById("pcos-friendly-meals")
    : condition === "triglycerides"
      ? getMealRuleById("triglyceride-friendly-meals")
      : null;
  const preferredSlugs = new Set(conditionRule?.filters?.prefer_ingredient_slugs ?? []);
  const scored = uniqueMatches
    .map((ingredient) => ({
      ingredient,
      score: (preferredSlugs.has(ingredient.slug) ? 10 : 0) + ingredient.count,
    }))
    .sort((a, b) => b.score - a.score);
  const winner = scored[0].ingredient;
  const other = scored[1].ingredient;
  const context = condition === "pcos"
    ? "for PCOS-style meals"
    : condition === "triglycerides"
      ? "for triglyceride-friendly meals"
      : "inside this recipe vault";
  const reason = preferredSlugs.has(winner.slug)
    ? `${winner.name} is in the preferred ingredient set ${context}.`
    : `${winner.name} appears in more vault recipes, so it has more practical recipe coverage here.`;

  return createResponse(
    [
      `I would lean ${winner.name} over ${other.name} ${context}.`,
      reason,
      detailLevel === "long" || detailLevel === "structured"
        ? `Still, this is a food-pattern choice, not a medical guarantee; portion, cooking method, and the rest of the plate matter.`
        : null,
    ].filter(Boolean).join("\n"),
    {
      intent: "education",
      answerType: "comparison_reply",
      facts: {
        comparedIngredientSlugs: uniqueMatches.map((ingredient) => ingredient.slug),
        preferredIngredientSlug: winner.slug,
        condition,
        detailLevel,
      },
      sources: uniqueMatches.map((ingredient) => ({
        type: "ingredient",
        id: ingredient.slug,
        title: ingredient.name,
        path: ingredient.path,
      })),
      debug: buildDebugTrace(query, {
        intent: "education",
        answerType: "comparison_reply",
        sources: uniqueMatches.map((ingredient) => ({ id: ingredient.slug })),
      }, {
        condition,
        preferredIngredientSlug: winner.slug,
        detailLevel,
      }),
    },
  );
}

function getRecipeMethodSteps(recipe, limit = 3) {
  const detailedRecipe = getRecipeDetailsById(recipe.id);
  if (detailedRecipe?.cooking_steps?.length) {
    return detailedRecipe.cooking_steps.slice(0, limit);
  }

  if (recipe.steps?.length) {
    return recipe.steps.slice(0, limit);
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

function findMovesForWorkoutRule(rule, options = {}) {
  const history = options.history ?? [];
  const seenMoveKeys = getSeenMoveKeys(history);
  const rankedMoves = allWorkoutMoves
    .map((move) => ({ move, score: scoreMoveForWorkoutRule(move, rule) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.move);
  const unseenMoves = rankedMoves.filter((move) => !seenMoveKeys.has(getMoveKey(move)));

  return (unseenMoves.length > 0 ? unseenMoves : rankedMoves).slice(0, 2);
}

function formatRecipeReply(query, options = {}) {
  const history = options.history ?? [];
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
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

  const recipeLimit = getDetailLimit(detailLevel, { short: 2, medium: 2, long: 3, structured: 4 });
  const stepLimit = getDetailLimit(detailLevel, { short: 0, medium: 2, long: 3, structured: 4 });
  const visibleResults = results.slice(0, recipeLimit);
  const lines = visibleResults.map((recipe) => {
    if (isGenericCategoryReply) {
      return `- ${recipe.name}`;
    }

    const ingredients = getRecipeIngredientList(recipe);
    const methodSteps = directRecipeMatches.some((match) => match.id === recipe.id)
      ? getRecipeMethodSteps(recipe, stepLimit)
      : [];

    if (methodSteps.length > 0) {
      return `- ${recipe.name}\n  Ingredients: ${ingredients.join(", ")}\n  How to make it:\n${methodSteps.map((step, index) => `  ${index + 1}. ${step}`).join("\n")}`;
    }

    const nutritionEvidence = formatNutritionEvidence(recipe);
    const evidenceText = nutritionEvidence ? ` (${nutritionEvidence})` : "";
    return `- ${recipe.name}${evidenceText}: ${ingredients.join(", ")}`;
  });

  return createResponse(`${intro}\n${lines.join("\n")}`, {
    intent: "meal",
    answerType: "recipe_recommendation",
    facts: {
      category: focus ?? null,
      recipeIds: visibleResults.map((recipe) => recipe.id),
      detailLevel,
    },
    sources: visibleResults.map((recipe) => ({
      type: "recipe",
      id: recipe.id,
      title: recipe.name,
      path: recipe.source_note,
    })),
    debug: buildDebugTrace(query, {
      intent: "meal",
      answerType: "recipe_recommendation",
      sources: visibleResults.map((recipe) => ({ id: recipe.id })),
    }, {
      focus,
      directRecipeLookup: directRecipeMatches.length > 0,
      ingredientDriven: ingredientDrivenResults.length > 0,
      categoryFallback: isGenericCategoryReply,
      matchedRecipeIds: visibleResults.map((recipe) => recipe.id),
      detailLevel,
      matchedIngredients: ingredientDrivenResults.length > 0
        ? searchIngredients(query).slice(0, 5).map((ingredient) => ingredient.slug)
        : [],
    }),
  });
}

function formatNutritionLookupReply(query, options = {}) {
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const history = options.history ?? [];
  const metric = getNutritionMetric(query);
  if (!metric || !isNutritionLookupQuery(query)) return null;

  const directMatches = findDirectRecipeMatches(query);
  const recentRecipeContext =
    directMatches.length === 0 && !isNutritionRankingQuery(query)
      ? findRecentRecipeContext(history)
      : null;
  const contextualMatches = recentRecipeContext ? [recentRecipeContext.recipe] : [];
  const directMatchesWithMetric = directMatches.filter(
    (recipe) => typeof recipe.nutrition_per_serving?.[metric.key] === "number",
  );
  const contextualMatchesWithMetric = contextualMatches.filter(
    (recipe) => typeof recipe.nutrition_per_serving?.[metric.key] === "number",
  );
  const limit = getDetailLimit(detailLevel, { short: 3, medium: 5, long: 6, structured: 6 });
  const rankedMatches =
    directMatchesWithMetric.length > 0
      ? directMatchesWithMetric
      : contextualMatchesWithMetric.length > 0
        ? contextualMatchesWithMetric
        : directMatches.length > 0
          ? directMatches
          : contextualMatches.length > 0
            ? contextualMatches
            : getRankedRecipesByNutrition(query, metric, limit);

  if (rankedMatches.length === 0) {
    return createResponse(
      `I cannot verify the ${metric.label} amount from the vault for that one.`,
      {
        intent: "meal",
        answerType: "nutrition_lookup",
        facts: {
          metric: metric.key,
          detailLevel,
          fallbackReason: "nutrition_missing",
        },
        sources: [],
        debug: buildDebugTrace(query, {
          intent: "meal",
          answerType: "nutrition_lookup",
          sources: [],
        }, {
          metric: metric.key,
          detailLevel,
          fallbackReason: "nutrition_missing",
        }),
      },
    );
  }

  const category = findNutritionCategory(query);
  const hasVerifiedDirectMatch = directMatchesWithMetric.length > 0;
  const hasVerifiedContextMatch = contextualMatchesWithMetric.length > 0;
  const usedContext = contextualMatches.length > 0 && directMatches.length === 0;
  const intro = directMatches.length > 0 || usedContext
    ? `Here is the ${metric.label} listed in the vault:`
    : `Here are the ${category ? `${category} ` : ""}recipes ranked by ${metric.label}:`;
  const lines = rankedMatches.map((recipe, index) => {
    const value = formatNutritionValue(recipe.nutrition_per_serving?.[metric.key], metric);
    return value
      ? `${index + 1}. ${recipe.name}: ${value}`
      : `${index + 1}. ${recipe.name}: ${metric.label} amount not listed`;
  });
  const verifierLine =
    directMatches.length > 0 && !hasVerifiedDirectMatch
      ? `I found the recipe/card name, but the vault does not list ${metric.label} for it.`
      : usedContext && !hasVerifiedContextMatch
        ? `I used the previous recipe as context, but the vault does not list ${metric.label} for it.`
      : null;
  const contextLine = usedContext
    ? `Using the previous recipe as context: ${recentRecipeContext.recipe.name}.`
    : null;

  return createResponse([contextLine, intro, lines.join("\n"), verifierLine].filter(Boolean).join("\n"), {
    intent: "meal",
    answerType: "nutrition_lookup",
    facts: {
      metric: metric.key,
      category: category ?? null,
      recipeIds: rankedMatches.map((recipe) => recipe.id),
      values: rankedMatches.map((recipe) => recipe.nutrition_per_serving?.[metric.key] ?? null),
      verified: (directMatches.length === 0 || hasVerifiedDirectMatch) && (!usedContext || hasVerifiedContextMatch),
      contextualSubject: usedContext ? "recipe" : null,
      detailLevel,
    },
    sources: rankedMatches.map((recipe) => ({
      type: "recipe",
      id: recipe.id,
      title: recipe.name,
      path: recipe.source_note,
    })),
    debug: buildDebugTrace(query, {
      intent: "meal",
      answerType: "nutrition_lookup",
      sources: rankedMatches.map((recipe) => ({ id: recipe.id })),
    }, {
      metric: metric.key,
      category,
      verified: (directMatches.length === 0 || hasVerifiedDirectMatch) && (!usedContext || hasVerifiedContextMatch),
      contextualSubject: usedContext ? recentRecipeContext.recipe.id : null,
      detailLevel,
    }),
  });
}

function isRecipeDetailFollowUp(query) {
  return /(ingredient|ingredients|how do i make|how to make|make it|cook it|steps|method|time|prep|cook time)/i.test(query);
}

function formatRecipeContextReply(query, options = {}) {
  if (!isRecipeDetailFollowUp(query)) return null;

  const history = options.history ?? [];
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const directMatch = findDirectRecipeMatches(query)[0] ?? null;
  const recentContext = directMatch ? null : findRecentRecipeContext(history);
  const recipe = directMatch ?? recentContext?.recipe ?? null;
  if (!recipe) return null;

  const ingredients = getRecipeIngredientList(recipe);
  const steps = getRecipeMethodSteps(recipe, getDetailLimit(detailLevel, { short: 2, medium: 3, long: 5, structured: 6 }));
  const timing = recipe.timing;
  const lines = [
    recentContext ? `Using the previous recipe as context: ${recipe.name}.` : recipe.name,
    ingredients.length > 0 ? `Ingredients: ${ingredients.join(", ")}.` : null,
    timing?.total_time_min ? `Time: about ${timing.total_time_min} minutes.` : null,
    steps.length > 0 ? `How to make it:\n${steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}` : null,
  ].filter(Boolean);

  return createResponse(lines.join("\n"), {
    intent: "meal",
    answerType: "recipe_recommendation",
    facts: {
      category: recipe.category ?? null,
      recipeIds: [recipe.id],
      contextualSubject: recentContext ? "recipe" : null,
      detailLevel,
    },
    sources: [{
      type: "recipe",
      id: recipe.id,
      title: recipe.name,
      path: recipe.source_note,
    }],
    debug: buildDebugTrace(query, {
      intent: "meal",
      answerType: "recipe_recommendation",
      sources: [{ id: recipe.id }],
    }, {
      contextualSubject: recentContext ? recipe.id : null,
      detailLevel,
    }),
  });
}

function formatMealRuleReply(query, options = {}) {
  const history = options.history ?? [];
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  if (shouldUseDirectRecipeReply(query)) return null;
  if (!isMealQuery(query) || /(plan|routine|week|weekly|today|day of eating)/i.test(query)) return null;

  const rule = rankConditionRules(searchMealRules(query), query, [
    getMealRuleById("pcos-friendly-meals"),
    getMealRuleById("triglyceride-friendly-meals"),
    getMealRuleById("high-protein-meals"),
    getMealRuleById("high-protein-dinner"),
    getMealRuleById("light-meals"),
    getMealRuleById("light-dinner"),
  ])[0];
  if (!rule) return null;

  const refinedRule = refineMealRuleForQuery(rule, query);
  const recipes = findRecipesForMealRule(refinedRule, { history });
  if (recipes.length === 0) return null;

  const noteSources = (refinedRule.source_note_ids ?? [])
    .map((id) => getChatbotNoteById(id))
    .filter(Boolean);

  const isGenericIdeaRule = ["breakfast-ideas", "dinner-ideas"].includes(refinedRule.id);
  const recipeLimit = getDetailLimit(detailLevel, { short: 2, medium: 3, long: 4, structured: 5 });
  const explanationLimit = getDetailLimit(detailLevel, { short: 0, medium: 1, long: 2, structured: 2 });
  const visibleRecipes = clampItems(recipes, isGenericIdeaRule ? Math.max(recipeLimit, randomIdeaCount()) : recipeLimit);
  const lines = isGenericIdeaRule
    ? visibleRecipes.map((recipe) => `- ${recipe.name}`)
    : [
        rule.intro,
        ...visibleRecipes.map(
          (recipe) => {
            const nutritionEvidence = formatNutritionEvidence(recipe, refinedRule);
            const evidenceText = nutritionEvidence ? ` (${nutritionEvidence})` : "";
            return `- ${recipe.name}${evidenceText}: ${getRecipeIngredientList(recipe).join(", ")}`;
          },
        ),
        ...clampItems(refinedRule.why_it_fits ?? [], explanationLimit).map((why) => `Why: ${why}`),
        ...(refinedRule.caution ? [userFacingRuleText(refinedRule.caution)] : []),
      ];

  return createResponse(lines.join("\n"), {
    intent: "meal",
    answerType: "meal_recommendation_rule",
    facts: {
      mealRuleId: refinedRule.id,
      topic: refinedRule.topic,
      recipeIds: visibleRecipes.map((recipe) => recipe.id),
      filters: refinedRule.filters ?? {},
      detailLevel,
    },
    sources: [
      { type: "meal-rule", id: refinedRule.id, title: refinedRule.topic, path: "src/data/chat/data/mealRules.json" },
      ...visibleRecipes.map((recipe) => ({
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
      sources: [{ id: refinedRule.id }, ...visibleRecipes.map((recipe) => ({ id: recipe.id }))],
    }, {
      mealRuleId: refinedRule.id,
      matchedRecipeIds: visibleRecipes.map((recipe) => recipe.id),
      detailLevel,
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

function findIngredientTarget(query, options = {}) {
  const history = options.history ?? [];
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

  const queryMatch = searchIngredients(query)[0] ?? null;
  if (queryMatch) return queryMatch;

  if (/\b(it|that|this|them|ingredient)\b/i.test(query)) {
    return findRecentIngredientContext(history)?.ingredient ?? null;
  }

  return null;
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

function shouldUseSwapReply(query, options = {}) {
  if (!isExplicitSwapQuery(query)) return false;

  const ingredient = findIngredientTarget(query, options);
  const rule = findSwapRuleTarget(query, ingredient);

  return Boolean(ingredient || rule);
}

function formatSwapReply(query, options = {}) {
  const ingredient = findIngredientTarget(query, options);
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
  if (rule?.caution) addRuleText(lines, rule.caution);
  else if (guardrailNote?.keyPoints?.[0]) addRuleText(lines, guardrailNote.keyPoints[0]);
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

function getConditionFaqFallbackRules(query) {
  if (!getHealthCondition(query)) return [];

  if (/(cure|fix|reverse|heal)/i.test(query)) {
    return [
      getFaqRuleById("can-this-cure-pcos"),
      getFaqRuleById("can-this-cure-high-triglycerides"),
    ];
  }

  if (/(eat|food|diet|meal|nutrition)/i.test(query)) {
    return [
      getFaqRuleById("what-should-i-eat-for-pcos"),
      getFaqRuleById("what-should-i-eat-for-high-triglycerides"),
    ];
  }

  if (/(exercise|workout|gym|routine|train|cardio|strength)/i.test(query)) {
    return [
      getFaqRuleById("what-exercise-helps-pcos"),
      getFaqRuleById("what-exercise-helps-high-triglycerides"),
      getFaqRuleById("simple-pcos-gym-routine"),
      getFaqRuleById("simple-triglycerides-gym-routine"),
    ];
  }

  return [
    getFaqRuleById("what-is-pcos"),
    getFaqRuleById("what-are-high-triglycerides"),
  ];
}

function formatFaqReply(query, options = {}) {
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const rule = rankConditionRules(
    searchFaqRules(query),
    query,
    getConditionFaqFallbackRules(query),
  )[0];
  if (!rule) return null;

  const noteSources = (rule.source_note_ids ?? [])
    .map((id) => getChatbotNoteById(id))
    .filter(Boolean);

  const lines = [rule.short_answer];
  for (const step of clampItems(rule.practical_steps ?? [], getDetailLimit(detailLevel))) {
    addRuleText(lines, step);
  }
  if (rule.caution) addRuleText(lines, rule.caution);

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
      detailLevel,
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
      detailLevel,
    }),
  });
}

function formatWorkoutRuleReply(query, options = {}) {
  if (isTargetedWorkoutQuery(query)) return null;

  const history = options.history ?? [];
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const rule = rankConditionRules(searchWorkoutRules(query), query)[0];
  if (!rule) return null;

  const moves = findMovesForWorkoutRule(rule, { history });
  const noteSources = (rule.source_note_ids ?? []).map((id) => getChatbotNoteById(id)).filter(Boolean);

  const lines = [rule.intro];
  if (moves.length > 0) {
    lines.push(
      ...clampItems(moves).map(
        (move) => `- ${move.name}: ${move.sets}. ${firstSentence(move.tips)}`,
      ),
    );
  }
  for (const guidance of clampItems(rule.guidance ?? [], getDetailLimit(detailLevel))) {
    addRuleText(lines, guidance);
  }
  if (rule.caution) addRuleText(lines, rule.caution);

  return createResponse(lines.join("\n"), {
    intent: "workout",
    answerType: "workout_rule",
    facts: {
      workoutRuleId: rule.id,
      topic: rule.topic,
      moveIds: moves.map((move) => `${move.difficulty}-${move.focus}-${move.name}`),
      detailLevel,
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
      detailLevel,
    }),
  });
}

function formatMachineRuleReply(query) {
  const rule = searchMachineRules(query)[0];
  if (!rule) return null;

  const noteSources = (rule.source_note_ids ?? []).map((id) => getChatbotNoteById(id)).filter(Boolean);
  const lines = [rule.short_answer];
  if (rule.steps?.[0]) addRuleText(lines, rule.steps[0]);
  if (rule.steps?.[1]) addRuleText(lines, rule.steps[1]);
  if (rule.caution) addRuleText(lines, rule.caution);

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
    if (machineRule.steps?.[0]) addRuleText(lines, machineRule.steps[0]);
    if (machineRule.steps?.[1]) addRuleText(lines, machineRule.steps[1]);
    if (machineRule.caution) addRuleText(lines, machineRule.caution);

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
    addRuleText(lines, move.how[0]);
  } else {
    addRuleText(lines, "Set the seat or pad so the joint you are training lines up with the pivot point.");
  }

  addRuleText(lines, firstSentence(move.tips));

  if (move.watch?.[0]) {
    addRuleText(lines, move.watch[0]);
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
    ...rule.suggestions.slice(0, 3).map((item) => `- ${item}`),
  ];
  if (rule.why) lines.push(`Why: ${rule.why}`);
  if (rule.caution) addRuleText(lines, rule.caution);

  return createResponse(lines.join("\n"), {
    intent: "snack",
    answerType: "snack_rule",
    facts: { snackRuleId: rule.id, suggestions: rule.suggestions.slice(0, 3) },
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

function formatPlanRuleReply(query, options = {}) {
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const rule = rankConditionRules(searchPlanRules(query), query, [
    getPlanRuleById("pcos-weekly-workout-plan"),
    getPlanRuleById("triglycerides-weekly-workout-plan"),
    getPlanRuleById("pcos-day-of-eating"),
    getPlanRuleById("triglycerides-day-of-eating"),
  ])[0];
  if (!rule) return null;

  const noteSources = (rule.source_note_ids ?? []).map((id) => getChatbotNoteById(id)).filter(Boolean);
  const lines = [
    "Here is a simple starting plan:",
    ...rule.outline.slice(0, getDetailLimit(detailLevel, { short: 3, medium: 4, long: 5, structured: 6 })).map((item) => `- ${item}`),
  ];
  if (rule.caution) addRuleText(lines, rule.caution);

  return createResponse(lines.join("\n"), {
    intent: "plan",
    answerType: "plan_rule",
    facts: { planRuleId: rule.id, outline: rule.outline ?? [], detailLevel },
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
      detailLevel,
    }),
  });
}

function formatWorkoutReply(query, options = {}) {
  const history = options.history ?? [];
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const seenMoveKeys = getSeenMoveKeys(history);
  const focus = findFocusFromQuery(query);
  const targetGroup = findWorkoutTargetGroup(query);
  const rankedMatches = targetGroup
    ? allWorkoutMoves.filter((move) => moveMatchesTargetGroup(move, targetGroup))
    : focus
      ? allWorkoutMoves.filter((move) => move.focus === focus)
      : findWorkoutMatches(query);
  const unseenMatches = rankedMatches.filter((move) => !seenMoveKeys.has(getMoveKey(move)));
  const matches = (unseenMatches.length > 0 ? unseenMatches : rankedMatches).slice(
    0,
    getDetailLimit(detailLevel, { short: 2, medium: 2, long: 3, structured: 4 }),
  );

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
      detailLevel,
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
      detailLevel,
    }),
  });
}

function isWorkoutDetailFollowUp(query) {
  return /(how do i do it|how to do it|how do i use it|form|setup|sets|reps|what muscle|muscles|tips|cues)/i.test(query);
}

function formatWorkoutContextReply(query, options = {}) {
  if (!isWorkoutDetailFollowUp(query)) return null;

  const history = options.history ?? [];
  const recentContext = findRecentWorkoutContext(history);
  if (!recentContext?.move) return null;

  const move = recentContext.move;
  const lines = [
    `Using the previous workout as context: ${move.name}.`,
    move.sets ? `Sets/reps: ${move.sets}.` : null,
    move.machine ? `Machine: ${move.machine}.` : null,
    move.tips ? `Tip: ${firstSentence(move.tips)}` : null,
    move.how?.length ? `How: ${move.how.slice(0, 2).join(" ")}` : null,
    move.watch?.length ? `Watch: ${move.watch[0]}` : null,
  ].filter(Boolean);

  return createResponse(lines.join("\n"), {
    intent: "workout",
    answerType: "workout_recommendation",
    facts: {
      focus: move.focus ?? null,
      targetGroup: null,
      moves: [move],
      contextualSubject: "workout",
    },
    sources: [{
      type: "workout",
      id: `${move.difficulty}-${move.focus}-${move.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: `${move.name} (${move.difficulty} ${move.focus})`,
      path: "src/data/pageContent.js",
    }],
    debug: buildDebugTrace(query, {
      intent: "workout",
      answerType: "workout_recommendation",
      sources: [{ id: move.name }],
    }, {
      contextualSubject: move.name,
    }),
  });
}

function formatEducationReply(query, options = {}) {
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  const needle = query.toLowerCase();
  const condition = getHealthCondition(query);
  const rawMatches = education.filter((item) =>
    [item.title, item.desc, item.action].join(" ").toLowerCase().includes(needle),
  );
  const conditionMatches =
    condition && condition !== "both"
      ? rawMatches.filter((item) => item.topic === condition)
      : rawMatches;
  const matches = conditionMatches.length > 0 ? conditionMatches : rawMatches;

  if (matches.length === 0 && !needle.includes("triglycer") && !needle.includes("pcos")) {
    return null;
  }

  const conditionFallback =
    condition && condition !== "both"
      ? education.filter((item) => item.topic === condition)
      : education;
  const items = matches.length > 0
    ? matches.slice(0, getDetailLimit(detailLevel, { short: 1, medium: 2, long: 3, structured: 2 }))
    : conditionFallback.slice(0, getDetailLimit(detailLevel, { short: 1, medium: 2, long: 3, structured: 2 }));
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
        detailLevel,
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
        detailLevel,
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
    nutrition: isNutritionLookupQuery(query) ? 5 : 0,
    comparison: isComparisonQuery(query) ? 5 : 0,
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
      facts: {
        safetyRuleId: safetyRule?.id ?? null,
        escalationRequired: true,
        detailLevel: "safety",
      },
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
        detailLevel: "safety",
      }),
    },
  );
}

function formatSmartFallback(query, options = {}) {
  const detailLevel = options.detailLevel ?? getChatDetailLevel(query);
  let text = null;
  let intent = "fallback";
  let fallbackReason = "unsupported_topic";

  if (isExplicitSwapQuery(query) || isIngredientQuery(query)) {
    intent = "ingredient";
    fallbackReason = "ingredient_no_match";
    text =
      "I do not have a strong swap rule for that ingredient yet. I can help with rice, coconut, curd, dal, oats, millets, vegetables, chilli, sambar powder, or mustard seed swaps.";
  } else if (isMealQuery(query)) {
    intent = "meal";
    fallbackReason = getNutritionMetric(query) ? "nutrition_missing" : "meal_no_match";
    text =
      "I do not have a strong meal match for that yet. Try asking for breakfast, dinner, light meals, high-protein meals, no-coconut meals, pre-workout meals, or PCOS/triglyceride-friendly meals.";
  } else if (isWorkoutQuery(query)) {
    intent = "workout";
    fallbackReason = "workout_no_match";
    text =
      "I do not have a strong workout match for that yet. Try asking for beginner gym days, upper body, lower body, cardio, machine setup, soreness, progression, or tired-day workouts.";
  } else if (isEducationQuery(query)) {
    intent = "education";
    fallbackReason = "health_out_of_scope";
    text =
      "I do not have a strong health-education match for that yet. I can answer basic PCOS, high triglycerides, food guidance, exercise guidance, and safety-boundary questions from the vault.";
  }

  if (!text) {
    const suggestions = uniqueList(fallbackPrompts);
    text = `I do not have a strong match for that yet. ${suggestions[0]}`;
  }

  return createResponse(text, {
    intent,
    answerType: "fallback",
    facts: { detailLevel, fallbackReason },
    sources: [],
    debug: buildDebugTrace(query, {
      intent,
      answerType: "fallback",
      sources: [],
    }, { detailLevel, fallbackReason }),
  });
}

function formatContextualMoreReply(query, options = {}) {
  if (!isMoreIdeasQuery(query)) return null;

  const history = options.history ?? [];
  const detailLevel = options.detailLevel ?? "medium";
  const recent = findRecentAssistantContext(history);
  if (!recent) return null;

  if (["recipe_recommendation"].includes(recent.answerType)) {
    const category = recent.facts?.category ?? findRecentFoodCategory(history);
    if (category) {
      return formatRecipeReply(`more ${category}`, { history, detailLevel });
    }
  }

  if (recent.answerType === "meal_recommendation_rule" && recent.facts?.mealRuleId) {
    const rule = getMealRuleById(recent.facts.mealRuleId);
    const queryText = rule?.question_patterns?.[0] ?? rule?.topic;
    if (queryText) {
      const reply = formatMealRuleReply(queryText, { history, detailLevel });
      if (reply) {
        return {
          ...reply,
          text: reply.text.replace(/^/, "Here are more options in the same direction:\n"),
          debug: { ...reply.debug, contextualMoreFrom: recent.answerType },
        };
      }
    }
  }

  if (recent.answerType === "workout_recommendation") {
    const target = recent.facts?.targetGroup;
    const focus = recent.facts?.focus;
    const queryText = target ? `${target} workout` : focus ? `${focus} workout` : "workout";
    const reply = formatWorkoutReply(queryText, { history, detailLevel });
    if (reply) {
      return {
        ...reply,
        text: reply.text.replace("Here are a few", "Here are a few more"),
        debug: { ...reply.debug, contextualMoreFrom: recent.answerType },
      };
    }
  }

  if (recent.answerType === "workout_rule" && recent.facts?.workoutRuleId) {
    const rule = getWorkoutRuleById(recent.facts.workoutRuleId);
    const queryText = rule?.question_patterns?.[0] ?? rule?.topic;
    if (queryText) {
      const reply = formatWorkoutRuleReply(queryText, { history, detailLevel });
      if (reply) {
        return {
          ...reply,
          text: reply.text.replace(/^/, "More for that workout context:\n"),
          debug: { ...reply.debug, contextualMoreFrom: recent.answerType },
        };
      }
    }
  }

  if (recent.answerType === "snack_rule" && recent.facts?.snackRuleId) {
    const rule = getSnackRuleById(recent.facts.snackRuleId);
    if (!rule) return null;

    return createResponse(
      [
        "More on that snack direction:",
        ...(rule.why ? [`Why: ${rule.why}`] : []),
        ...(rule.caution ? [userFacingRuleText(rule.caution)] : []),
      ].join("\n"),
      {
        intent: "snack",
        answerType: "snack_rule",
        facts: { snackRuleId: rule.id, suggestions: rule.suggestions ?? [], contextualMore: true },
        sources: [{ type: "snack-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/snackRules.json" }],
        debug: buildDebugTrace(query, {
          intent: "snack",
          answerType: "snack_rule",
          sources: [{ id: rule.id }],
        }, {
          snackRuleId: rule.id,
          contextualMoreFrom: recent.answerType,
        }),
      },
    );
  }

  if (recent.answerType === "plan_rule" && recent.facts?.planRuleId) {
    const rule = getPlanRuleById(recent.facts.planRuleId);
    if (!rule) return null;

    return createResponse(
      [
        "More detail on that plan:",
        ...(rule.why ? [`Why: ${rule.why}`] : []),
        ...(rule.outline?.length ? [`Keep the shape: ${rule.outline.join("; ")}.`] : []),
        ...(rule.caution ? [userFacingRuleText(rule.caution)] : []),
      ].join("\n"),
      {
        intent: "plan",
        answerType: "plan_rule",
        facts: { planRuleId: rule.id, outline: rule.outline ?? [], contextualMore: true },
        sources: [{ type: "plan-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/planRules.json" }],
        debug: buildDebugTrace(query, {
          intent: "plan",
          answerType: "plan_rule",
          sources: [{ id: rule.id }],
        }, {
          planRuleId: rule.id,
          contextualMoreFrom: recent.answerType,
        }),
      },
    );
  }

  if (["machine_rule", "machine_specific_rule"].includes(recent.answerType) && recent.facts?.machineRuleId) {
    const rule = getMachineRuleById(recent.facts.machineRuleId);
    if (!rule) return null;

    return createResponse(
      [
        "More on that machine setup:",
        ...clampItems(rule.steps ?? [], 4).map((step) => userFacingRuleText(step)),
        ...(rule.caution ? [userFacingRuleText(rule.caution)] : []),
      ].filter(Boolean).join("\n"),
      {
        intent: "equipment",
        answerType: recent.answerType,
        facts: { machineRuleId: rule.id, topic: rule.topic, steps: rule.steps ?? [], contextualMore: true },
        sources: [{ type: "machine-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/machineRules.json" }],
        debug: buildDebugTrace(query, {
          intent: "equipment",
          answerType: recent.answerType,
          sources: [{ id: rule.id }],
        }, {
          machineRuleId: rule.id,
          contextualMoreFrom: recent.answerType,
        }),
      },
    );
  }

  if (recent.answerType === "faq_answer" && recent.facts?.faqId) {
    const rule = getFaqRuleById(recent.facts.faqId);
    if (!rule) return null;

    const followUps = rule.follow_up_suggestions ?? [];
    return createResponse(
      [
        "More on that:",
        ...(followUps.length > 0
          ? followUps.slice(0, 2).map((item) => `- ${item}`)
          : clampItems(rule.practical_steps ?? [], 2).map((step) => userFacingRuleText(step))),
        ...(rule.caution ? [userFacingRuleText(rule.caution)] : []),
      ].filter(Boolean).join("\n"),
      {
        intent: rule.category === "health" || rule.category === "nutrition" ? "education" : "workout",
        answerType: "faq_answer",
        facts: {
          faqId: rule.id,
          topic: rule.topic,
          followUpSuggestions: followUps,
          contextualMore: true,
        },
        sources: [{ type: "faq-rule", id: rule.id, title: rule.topic, path: "src/data/chat/data/faqRules.json" }],
        debug: buildDebugTrace(query, {
          intent: rule.category === "health" || rule.category === "nutrition" ? "education" : "workout",
          answerType: "faq_answer",
          sources: [{ id: rule.id }],
        }, {
          faqRuleId: rule.id,
          contextualMoreFrom: recent.answerType,
        }),
      },
    );
  }

  if (recent.answerType === "ingredient_swap") {
    return createResponse(
      [
        `More on ${recent.facts?.target ?? "that swap"}:`,
        ...(recent.facts?.suggestions?.length ? [`Best options stay: ${recent.facts.suggestions.join(", ")}.`] : []),
        ...(recent.facts?.changes?.length ? [`Main change: ${recent.facts.changes[0]}`] : []),
        ...(recent.facts?.caution ? [userFacingRuleText(recent.facts.caution)] : []),
      ].filter(Boolean).join("\n"),
      {
        intent: "swap",
        answerType: "ingredient_swap",
        facts: { ...recent.facts, contextualMore: true },
        sources: recent.sources ?? [],
        debug: buildDebugTrace(query, {
          intent: "swap",
          answerType: "ingredient_swap",
          sources: recent.sources ?? [],
        }, {
          contextualMoreFrom: recent.answerType,
        }),
      },
    );
  }

  return null;
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

  const detailLevel = getChatDetailLevel(query);
  const replyOptions = { history, detailLevel };
  const contextualMoreReply = formatContextualMoreReply(query, replyOptions);
  if (contextualMoreReply) return contextualMoreReply;

  const nutritionLookupReply = formatNutritionLookupReply(query, replyOptions);
  if (nutritionLookupReply) return nutritionLookupReply;

  const recipeContextReply = formatRecipeContextReply(query, replyOptions);
  if (recipeContextReply) return recipeContextReply;

  const workoutContextReply = formatWorkoutContextReply(query, replyOptions);
  if (workoutContextReply) return workoutContextReply;

  const comparisonReply = formatComparisonReply(query, replyOptions);
  if (comparisonReply) return comparisonReply;

  if (shouldUseSwapReply(query, replyOptions)) {
    return formatSwapReply(query, replyOptions) ?? formatIngredientReply(query);
  }

  if (shouldUseDirectRecipeReply(query)) {
    return formatRecipeReply(query, replyOptions);
  }

  const mealRuleReply = formatMealRuleReply(query, replyOptions);
  if (mealRuleReply) return mealRuleReply;

  if (isIngredientDrivenRecipeQuery(query)) {
    return formatRecipeReply(query, replyOptions) ?? formatIngredientReply(query);
  }

  if (isSpecificMachineUseQuery(query)) {
    return formatSpecificMachineReply(query) ?? formatMachineRuleReply(query);
  }

  if (isSpecificMachineTroubleshootingQuery(query)) {
    return formatSpecificMachineReply(query) ?? formatMachineRuleReply(query);
  }

  const intent = classifyIntent(query);
  const handlersByIntent = {
    faq: () => formatFaqReply(query, replyOptions),
    swap: () => formatSwapReply(query, replyOptions) ?? formatIngredientReply(query),
    meal: () => formatMealRuleReply(query, replyOptions) ?? formatRecipeReply(query, replyOptions),
    nutrition: () => formatNutritionLookupReply(query, replyOptions),
    comparison: () => formatComparisonReply(query, replyOptions),
    ingredient: () => formatIngredientReply(query),
    workout: () => formatWorkoutRuleReply(query, replyOptions) ?? formatWorkoutReply(query, replyOptions),
    education: () => formatFaqReply(query, replyOptions) ?? formatEducationReply(query, replyOptions),
    snack: () => formatSnackRuleReply(query),
    plan: () => formatPlanRuleReply(query, replyOptions),
    equipment: () => formatSpecificMachineReply(query) ?? formatMachineRuleReply(query),
  };

  const orderedHandlers = [
    handlersByIntent[intent],
    () => formatFaqReply(query, replyOptions),
    () => formatNutritionLookupReply(query, replyOptions),
    () => formatRecipeContextReply(query, replyOptions),
    () => formatWorkoutContextReply(query, replyOptions),
    () => formatComparisonReply(query, replyOptions),
    () => formatSwapReply(query, replyOptions),
    () => formatMealRuleReply(query, replyOptions),
    () => formatSnackRuleReply(query),
    () => formatPlanRuleReply(query, replyOptions),
    () => formatSpecificMachineReply(query) ?? formatMachineRuleReply(query),
    () => formatWorkoutRuleReply(query, replyOptions),
    () => formatRecipeReply(query, replyOptions),
    () => formatIngredientReply(query),
    () => formatWorkoutReply(query, replyOptions),
    () => formatEducationReply(query, replyOptions),
  ];

  const firstMatch = orderedHandlers.map((handler) => handler?.()).find(Boolean);
  if (firstMatch) return firstMatch;

  return formatSmartFallback(query, { detailLevel });
}
