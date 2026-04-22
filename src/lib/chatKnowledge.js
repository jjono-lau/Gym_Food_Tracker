import knowledgeIndex from "@/data/chat/data/index.json";
import recipes from "@/data/chat/data/recipes.json";
import recipeDetailsIndex from "@/data/chat/data/recipeDetailsIndex.json";
import ingredients from "@/data/chat/data/ingredients.json";
import swapRules from "@/data/chat/data/swapRules.json";
import faqRules from "@/data/chat/data/faqRules.json";
import mealRules from "@/data/chat/data/mealRules.json";
import workoutRules from "@/data/chat/data/workoutRules.json";
import machineRules from "@/data/chat/data/machineRules.json";
import snackRules from "@/data/chat/data/snackRules.json";
import planRules from "@/data/chat/data/planRules.json";
import safetyRules from "@/data/chat/data/safetyRules.json";
import breakfastCategory from "@/data/chat/data/categories/breakfast.json";
import lunchCategory from "@/data/chat/data/categories/lunch.json";
import dinnerCategory from "@/data/chat/data/categories/dinner.json";

const categories = {
  breakfast: breakfastCategory,
  lunch: lunchCategory,
  dinner: dinnerCategory,
};

const ingredientAliasesBySlug = {
  "low-fat-curd": [
    "curd",
    "dahi",
    "yogurt",
    "yoghurt",
    "plain yogurt",
    "plain yoghurt",
  ],
  "low-fat-buttermilk": ["buttermilk", "chaas", "chaach"],
  "brown-rice": ["rice", "plain rice", "cooked rice"],
  "red-rice": ["rice", "matta rice", "red rice"],
  capsicum: ["bell pepper", "bell peppers"],
  "green-chilli": [
    "green chili",
    "green chili peppers",
    "green chilies",
    "green chilli",
    "green chillies",
    "green chilli peppers",
    "chili",
    "chilies",
    "chilli",
    "chillies",
  ],
  onion: ["onions"],
  tomato: ["tomatoes"],
  cucumber: ["cucumbers"],
  "rolled-oats": ["oats", "oatmeal"],
  poha: ["aval", "flattened rice"],
};

const chatbotNotes = {
  boundaries: {
    id: "chatbot-boundaries",
    title: "Chatbot Boundaries",
    path: "Notes/Chatbot/Chatbot Boundaries.md",
    summary:
      "Defines what the chatbot should and should not answer so it stays useful without drifting into unsafe medical advice.",
    topics: ["safety", "boundaries", "medical escalation"],
  },
  supportHub: {
    id: "chatbot-support-hub",
    title: "Chatbot Support Hub",
    path: "Resources/Hubs/Chatbot Support Hub.md",
    summary:
      "Maps the main supported chatbot areas including workout help, meal suggestions, ingredient swaps, and health education.",
    topics: ["hub", "faq", "support"],
  },
  ingredientSwaps: {
    id: "ingredient-swaps",
    title: "Ingredient Swaps",
    path: "Notes/Chatbot/Ingredient Swaps.md",
    summary:
      "Defines how the chatbot should help users substitute ingredients while keeping recipes practical and aligned with health goals.",
    topics: ["ingredient swaps", "substitutions", "recipe adaptation"],
    keyPoints: [
      "Explain what the replacement changes, such as texture, protein, carbohydrate load, or ease of preparation.",
      "Use health-focused guidance to prefer higher-fiber, lower-sugar, or less processed choices when appropriate.",
      "Do not force a swap if the ingredient is structurally important to the dish.",
    ],
  },
  commonSwapPack: {
    id: "common-ingredient-swap-pack",
    title: "Common Ingredient Swap Pack",
    path: "Notes/Chatbot/Common Ingredient Swap Pack.md",
    summary:
      "Defines the most useful everyday ingredient substitutions for practical meal adaptation.",
    topics: ["swap pack", "grains", "protein", "dairy", "fats"],
    keyPoints: [
      "Brown rice, red rice, foxtail millet, little millet, and quinoa can often replace more refined grain choices.",
      "Oats, millets, legumes, and lentil-based options are usually better than highly refined white flour products for steadier energy.",
      "Lower-fat curd or buttermilk may work as lighter dairy swaps, but texture and tang can change.",
    ],
  },
  triglyceridesSwapPack: {
    id: "high-triglycerides-ingredient-swap-pack",
    title: "High Triglycerides Ingredient Swap Pack",
    path: "Notes/Chatbot/High Triglycerides Ingredient Swap Pack.md",
    summary:
      "Defines substitutions to favor when the goal is reducing excess sugar, improving food quality, and supporting better lipid control.",
    topics: ["triglycerides", "swap pack", "lipids"],
    keyPoints: [
      "Prefer high-fiber grains, legumes, vegetables, and minimally processed ingredients over sugary or heavily refined foods.",
      "Prefer leaner cooking patterns and avoid unnecessary deep-fried substitutions when baked, steamed, sauteed, or boiled options work.",
      "Focus on repeatable eating patterns rather than treating one ingredient as a cure.",
    ],
  },
  pcosSwapPack: {
    id: "pcos-ingredient-swap-pack",
    title: "PCOS Ingredient Swap Pack",
    path: "Notes/Chatbot/PCOS Ingredient Swap Pack.md",
    summary:
      "Defines ingredient substitutions to favor when helping with meals for insulin sensitivity and steadier energy.",
    topics: ["pcos", "swap pack", "insulin sensitivity"],
    keyPoints: [
      "Prefer higher-fiber grains such as millets, oats, brown rice, red rice, and quinoa over heavily refined starches when possible.",
      "Prefer legumes, lentils, and protein-supporting ingredients when a meal looks too carb-heavy and low in satiety.",
      "Keep swaps realistic for the recipe instead of forcing a health swap that makes the dish stop working.",
    ],
  },
  substitutionDecisionGuide: {
    id: "ingredient-substitution-decision-guide",
    title: "Ingredient Substitution Decision Guide",
    path: "Notes/Chatbot/Ingredient Substitution Decision Guide.md",
    summary:
      "Explains whether a missing ingredient can be swapped directly, swapped with adjustments, or should be left unchanged.",
    topics: ["decision guide", "substitutions", "recipe structure"],
    keyPoints: [
      "Check the ingredient role first: base carbohydrate, protein, vegetable, spice, souring agent, fat, or liquid.",
      "Easy swaps do the same job, while moderate swaps change cooking time, water absorption, or flavor intensity.",
      "Hard swaps should be flagged when fermentation, thickening, or defining flavor is central to the dish.",
    ],
  },
  whenNotToSwap: {
    id: "when-not-to-swap-ingredients",
    title: "When Not To Swap Ingredients",
    path: "Notes/Chatbot/When Not To Swap Ingredients.md",
    summary:
      "Explains when a missing ingredient is too central to the recipe structure or defining flavor to replace casually.",
    topics: ["no swaps", "fermentation", "structure"],
    keyPoints: [
      "Ingredients that control fermentation, binding, or batter structure should not be swapped casually.",
      "If several key ingredients are missing, suggest a different recipe instead of forcing many weak substitutions.",
      "Be especially careful with idli, dosa, appam, and other batter-driven dishes.",
    ],
  },
  onionSubstitutions: {
    id: "onion-substitutions",
    title: "Onion Substitutions",
    path: "Notes/Chatbot/Onion Substitutions.md",
    summary:
      "Explains when onion can be reduced, omitted, or only loosely replaced in recipes where it supports the flavor base.",
    topics: ["onion", "aromatics", "substitutions"],
    keyPoints: [
      "Omission is sometimes more honest than pretending there is a direct equal substitute.",
      "Onion contributes sweetness, moisture, and background flavor rather than just volume.",
      "In simple dishes where onion sweetness matters a lot, suggest a different recipe if needed.",
    ],
    targets: ["onion"],
  },
  brownRiceSubstitutions: {
    id: "brown-rice-substitutions",
    title: "Brown Rice Substitutions",
    path: "Notes/Chatbot/Brown Rice Substitutions.md",
    summary:
      "Explains which grains can replace brown rice when a recipe needs a whole-grain base with similar meal-planning value.",
    topics: ["brown rice", "grains", "millets", "quinoa"],
    keyPoints: [
      "Good substitutes include red rice, foxtail millet, little millet, barnyard millet, and quinoa.",
      "Red rice is usually the closest chewy whole-grain style swap.",
      "Millets and quinoa may change cooking time, water ratio, and texture.",
    ],
    targets: ["brown rice"],
  },
  curdSubstitutions: {
    id: "low-fat-curd-substitutions",
    title: "Low Fat Curd Substitutions",
    path: "Notes/Chatbot/Low Fat Curd Substitutions.md",
    summary:
      "Explains when curd can be replaced with buttermilk-style options and how that affects thickness and tang.",
    topics: ["curd", "buttermilk", "dairy", "substitutions"],
    keyPoints: [
      "Low fat buttermilk can sometimes replace low fat curd when the dish does not depend on a thick texture.",
      "The chatbot should explain whether the recipe needs body or just tang.",
      "In thicker recipes, buttermilk may make the final result thinner than expected.",
    ],
    targets: ["curd", "low fat curd", "buttermilk"],
  },
  coconutSubstitutions: {
    id: "coconut-substitutions",
    title: "Coconut Substitutions",
    path: "Notes/Chatbot/Coconut Substitutions.md",
    summary:
      "Explains how to replace coconut when the exact form is missing and when the dish can tolerate a lighter or less rich result.",
    topics: ["coconut", "light coconut milk", "richness", "substitutions"],
    keyPoints: [
      "Light coconut milk can sometimes replace coconut in chutney, stew, or curry-style dishes if the texture change is explained.",
      "Using less coconut may be better than forcing a poor replacement.",
      "Coconut swaps change richness, sweetness, and mouthfeel, and triglyceride-aware guidance should frame coconut more carefully.",
    ],
    targets: ["coconut", "light coconut milk"],
  },
};

const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
const recipeDetailsById = new Map(Object.entries(recipeDetailsIndex));
const ingredientsBySlug = new Map(
  ingredients.map((ingredient) => [ingredient.slug, ingredient]),
);
const swapRulesById = new Map(swapRules.map((rule) => [rule.id, rule]));
const faqRulesById = new Map(faqRules.map((rule) => [rule.id, rule]));
const mealRulesById = new Map(mealRules.map((rule) => [rule.id, rule]));
const workoutRulesById = new Map(workoutRules.map((rule) => [rule.id, rule]));
const machineRulesById = new Map(machineRules.map((rule) => [rule.id, rule]));
const snackRulesById = new Map(snackRules.map((rule) => [rule.id, rule]));
const planRulesById = new Map(planRules.map((rule) => [rule.id, rule]));
const safetyRulesById = new Map(safetyRules.map((rule) => [rule.id, rule]));

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeToken(token) {
  if (token.endsWith("ies") && token.length > 3) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.endsWith("oes") && token.length > 3) {
    return token.slice(0, -2);
  }

  if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) {
    return token.slice(0, -1);
  }

  return token;
}

function expandTokens(tokens) {
  return [...new Set(tokens.flatMap((token) => [token, normalizeToken(token)]).filter(Boolean))];
}

function scoreTextMatch(query, text, options = {}) {
  const tokens = expandTokens(tokenize(query));
  if (tokens.length === 0) return 0;

  const haystack = text.toLowerCase();
  const normalizedHaystack = expandTokens(tokenize(text)).join(" ");
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
    if (haystack.includes(` ${token} `)) score += 0.5;
    if (normalizedHaystack.includes(` ${token} `)) score += 1.5;
    if (options.boostWhole && haystack === token) score += 4;
    if (options.boostWhole && normalizedHaystack === token) score += 4;
    if (options.boostPrefix && haystack.startsWith(token)) score += 1;
    if (options.boostPrefix && normalizedHaystack.startsWith(token)) score += 1;
  }

  const normalizedQuery = expandTokens(tokenize(query)).join(" ");
  if (haystack.includes(query.toLowerCase())) score += 3;
  if (normalizedQuery && normalizedHaystack.includes(normalizedQuery)) score += 3;

  return score;
}

function withKnowledgePath(path) {
  return `src/data/chat/data/${path}`;
}

const ingredientIndex = ingredients.map((ingredient) => ({
  ...ingredient,
  aliases: ingredientAliasesBySlug[ingredient.slug] ?? [],
  path: withKnowledgePath(`ingredients/${ingredient.slug}.json`),
}));

function scoreIngredientMatch(query, ingredient) {
  const aliasText = (ingredient.aliases ?? []).join(" ");
  const baseText = [ingredient.name, ingredient.slug.replace(/-/g, " "), aliasText].join(" ");

  let score =
    scoreTextMatch(query, ingredient.name, { boostWhole: true, boostPrefix: true }) * 3 +
    scoreTextMatch(query, ingredient.slug, { boostWhole: true, boostPrefix: true }) * 2 +
    scoreTextMatch(query, aliasText, { boostWhole: true, boostPrefix: true }) * 3 +
    scoreTextMatch(query, baseText);

  const queryTokens = expandTokens(tokenize(query));
  const aliasMatches = (ingredient.aliases ?? []).filter((alias) =>
    queryTokens.some((token) => alias.toLowerCase().includes(token)),
  ).length;

  if (aliasMatches > 0) {
    score += aliasMatches * 2;
  }

  return score;
}

const normalizedIndex = {
  ...knowledgeIndex,
  paths: {
    recipes: withKnowledgePath(knowledgeIndex.paths.recipes),
    recipe_documents: withKnowledgePath("recipes/{id}.json"),
    categories: withKnowledgePath("categories/{category}.json"),
    ingredients: withKnowledgePath("ingredients/{ingredient}.json"),
  },
};

export function getChatKnowledgeIndex() {
  return normalizedIndex;
}

export function getAllRecipes() {
  return recipes;
}

export function getRecipeById(id) {
  return recipesById.get(id) ?? null;
}

export function getRecipeDetailsById(id) {
  return recipeDetailsById.get(id) ?? null;
}

export function getRecipesByCategory(category) {
  return categories[category]?.recipes ?? [];
}

export function getAllIngredients() {
  return ingredientIndex;
}

export function getIngredientBySlug(slug) {
  const ingredient = ingredientsBySlug.get(slug);
  if (!ingredient) return null;

  return {
    ...ingredient,
    path: withKnowledgePath(`ingredients/${ingredient.slug}.json`),
  };
}

export function searchRecipes(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return recipes
    .map((recipe) => {
      const score =
        scoreTextMatch(query, recipe.name, { boostPrefix: true }) * 3 +
        scoreTextMatch(query, recipe.category) * 1.5 +
        scoreTextMatch(query, recipe.description) +
        scoreTextMatch(query, recipe.source_note) +
        scoreTextMatch(query, (recipe.ingredient_slugs ?? []).join(" "));

      return { recipe, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.recipe);
}

export function searchIngredients(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return ingredientIndex
    .map((ingredient) => {
      const score = scoreIngredientMatch(query, ingredient);

      return { ingredient, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.ingredient);
}

export function getChatbotNotes() {
  return Object.values(chatbotNotes);
}

export function getChatbotNoteById(id) {
  return Object.values(chatbotNotes).find((note) => note.id === id) ?? null;
}

export function searchChatbotNotes(query) {
  const notes = Object.values(chatbotNotes);
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return notes
    .map((note) => {
      const text = [
        note.title,
        note.summary,
        ...(note.topics ?? []),
        ...(note.keyPoints ?? []),
        ...(note.targets ?? []),
      ].join(" ");

      const score =
        scoreTextMatch(query, note.title, { boostPrefix: true, boostWhole: true }) * 3 +
        scoreTextMatch(query, text);

      return { note, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.note);
}

export function getSwapRules() {
  return swapRules;
}

export function getSwapRuleById(id) {
  return swapRulesById.get(id) ?? null;
}

export function searchSwapRules(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return swapRules
    .map((rule) => {
      const text = [
        rule.target,
        ...(rule.aliases ?? []),
        ...(rule.best_swaps ?? []),
        ...(rule.works_well_for ?? []),
        ...(rule.changes ?? []),
        rule.caution ?? "",
        ...Object.values(rule.prefer_for_goals ?? {}).flat(),
      ].join(" ");

      const score =
        scoreTextMatch(query, rule.target, { boostWhole: true, boostPrefix: true }) * 4 +
        scoreTextMatch(query, (rule.aliases ?? []).join(" "), {
          boostWhole: true,
          boostPrefix: true,
        }) * 3 +
        scoreTextMatch(query, text);

      return { rule, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.rule);
}

export function getFaqRules() {
  return faqRules;
}

export function getFaqRuleById(id) {
  return faqRulesById.get(id) ?? null;
}

export function searchFaqRules(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return faqRules
    .map((rule) => {
      const text = [
        ...(rule.question_patterns ?? []),
        rule.topic,
        rule.category,
        rule.short_answer,
        ...(rule.practical_steps ?? []),
        rule.caution ?? "",
        ...(rule.follow_up_suggestions ?? []),
      ].join(" ");

      const score =
        scoreTextMatch(query, (rule.question_patterns ?? []).join(" "), {
          boostWhole: true,
          boostPrefix: true,
        }) * 3 +
        scoreTextMatch(query, `${rule.topic} ${rule.category}`) * 2 +
        scoreTextMatch(query, text);

      return { rule, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.rule);
}

export function getMealRules() {
  return mealRules;
}

export function getMealRuleById(id) {
  return mealRulesById.get(id) ?? null;
}

export function searchMealRules(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return mealRules
    .map((rule) => {
      const text = [
        ...(rule.question_patterns ?? []),
        rule.topic,
        rule.category,
        rule.intro,
        ...(rule.why_it_fits ?? []),
        rule.caution ?? "",
        ...(rule.follow_up_suggestions ?? []),
      ].join(" ");

      const score =
        scoreTextMatch(query, (rule.question_patterns ?? []).join(" "), {
          boostWhole: true,
          boostPrefix: true,
        }) * 3 +
        scoreTextMatch(query, rule.topic, { boostPrefix: true }) * 2 +
        scoreTextMatch(query, text);

      return { rule, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.rule);
}

function searchRulesByPatterns(rules, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return rules
    .map((rule) => {
      const text = [
        ...(rule.question_patterns ?? []),
        ...(rule.patterns ?? []),
        rule.topic ?? "",
        rule.category ?? "",
        rule.intro ?? "",
        rule.short_answer ?? "",
        rule.why ?? "",
        rule.caution ?? "",
        ...(rule.guidance ?? []),
        ...(rule.steps ?? []),
        ...(rule.suggestions ?? []),
        ...(rule.outline ?? []),
      ].join(" ");

      const score =
        scoreTextMatch(query, ((rule.question_patterns ?? []).concat(rule.patterns ?? [])).join(" "), {
          boostWhole: true,
          boostPrefix: true,
        }) * 3 +
        scoreTextMatch(query, `${rule.topic ?? ""} ${rule.category ?? ""}`) * 2 +
        scoreTextMatch(query, text);

      return { rule, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.rule);
}

export function searchWorkoutRules(query) {
  return searchRulesByPatterns(workoutRules, query);
}

export function getWorkoutRuleById(id) {
  return workoutRulesById.get(id) ?? null;
}

export function searchMachineRules(query) {
  return searchRulesByPatterns(machineRules, query);
}

export function getMachineRuleById(id) {
  return machineRulesById.get(id) ?? null;
}

export function searchSnackRules(query) {
  return searchRulesByPatterns(snackRules, query);
}

export function getSnackRuleById(id) {
  return snackRulesById.get(id) ?? null;
}

export function searchPlanRules(query) {
  return searchRulesByPatterns(planRules, query);
}

export function getPlanRuleById(id) {
  return planRulesById.get(id) ?? null;
}

export function searchSafetyRules(query) {
  return searchRulesByPatterns(safetyRules, query);
}

export function getSafetyRuleById(id) {
  return safetyRulesById.get(id) ?? null;
}
