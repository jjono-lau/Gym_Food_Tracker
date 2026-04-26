import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "src", "data", "chat", "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

function normalize(value) {
  return value.toLowerCase();
}

function includesAny(query, values) {
  const needle = normalize(query);
  return values.some((value) => needle.includes(normalize(value)));
}

const swapRules = readJson("swapRules.json");
const faqRules = readJson("faqRules.json");
const mealRules = readJson("mealRules.json");
const planRules = readJson("planRules.json");
const machineRules = readJson("machineRules.json");
const safetyRules = readJson("safetyRules.json");
const snackRules = readJson("snackRules.json");
const workoutRules = readJson("workoutRules.json");
const recipes = readJson("recipes.json");
const ingredients = readJson("ingredients.json");
const responder = fs.readFileSync(path.join(root, "src", "lib", "chatResponder.js"), "utf8");
const knowledge = fs.readFileSync(path.join(root, "src", "lib", "chatKnowledge.js"), "utf8");
const provider = fs.readFileSync(path.join(root, "src", "components", "ChatbotProvider.jsx"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const explicitSwapPattern = /(swap out for|swap out|swap|replace|substitut|alternative|use instead of|instead of|change)/i;
const knownNoteIds = new Set([...knowledge.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]));
const markdownNoteIds = new Set();
const ruleSets = [
  ["swapRules", swapRules],
  ["faqRules", faqRules],
  ["mealRules", mealRules],
  ["planRules", planRules],
  ["machineRules", machineRules],
  ["snackRules", snackRules],
  ["workoutRules", workoutRules],
  ["safetyRules", safetyRules],
];
const patternRuleSets = ruleSets.filter(([name]) => name !== "swapRules");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function collectMarkdownNoteIds(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownNoteIds(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      markdownNoteIds.add(slugify(path.basename(entry.name, ".md")));
    }
  }
}

collectMarkdownNoteIds(path.join(root, "src", "data", "chat"));

function hasSwapRule(query) {
  if (!explicitSwapPattern.test(query)) return false;
  return swapRules.some((rule) => includesAny(query, [rule.target, ...(rule.aliases ?? [])]));
}

function hasPatternRule(query, rules) {
  return rules.some((rule) => includesAny(query, rule.question_patterns ?? rule.patterns ?? []));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertUniqueIds(name, rows, key = "id") {
  const seen = new Set();
  for (const row of rows) {
    assert(row[key], `${name} contains a row without a ${key}.`);
    assert(!seen.has(row[key]), `${name} contains duplicate ${key} "${row[key]}".`);
    seen.add(row[key]);
  }
}

function assertPatternCoverage(name, rows) {
  for (const row of rows) {
    const patterns = row.question_patterns ?? row.patterns ?? [];
    assert(Array.isArray(patterns), `${name}/${row.id} patterns must be an array.`);
    assert(patterns.length > 0, `${name}/${row.id} needs at least one route pattern.`);
    assert(
      patterns.every((pattern) => typeof pattern === "string" && pattern.trim().length >= 3),
      `${name}/${row.id} has an empty or too-short route pattern.`,
    );
  }
}

function assertSourceNotes(name, rows) {
  for (const row of rows) {
    for (const noteId of row.source_note_ids ?? []) {
      assert(
        knownNoteIds.has(noteId) || markdownNoteIds.has(noteId),
        `${name}/${row.id} references unknown source note "${noteId}".`,
      );
    }
  }
}

function assertRecipeData() {
  assertUniqueIds("recipes", recipes);
  assertUniqueIds("ingredients", ingredients, "slug");

  const ingredientSlugs = new Set(ingredients.map((ingredient) => ingredient.slug));
  for (const recipe of recipes) {
    assert(recipe.name, `Recipe "${recipe.id}" is missing a name.`);
    assert(recipe.category, `Recipe "${recipe.id}" is missing a category.`);
    assert(
      ["breakfast", "lunch", "dinner"].includes(recipe.category),
      `Recipe "${recipe.id}" has unsupported category "${recipe.category}".`,
    );

    for (const slug of recipe.ingredient_slugs ?? []) {
      assert(
        ingredientSlugs.has(slug),
        `Recipe "${recipe.id}" references unknown ingredient slug "${slug}".`,
      );
    }
  }
}

function assertAnswerBuildersExposeContract() {
  const answerTypes = [
    "recipe_recommendation",
    "meal_recommendation_rule",
    "ingredient_lookup",
    "ingredient_swap",
    "faq_answer",
    "workout_rule",
    "machine_rule",
    "machine_specific_rule",
    "machine_specific_help",
    "snack_rule",
    "plan_rule",
    "workout_recommendation",
    "health_education",
    "nutrition_lookup",
    "comparison_reply",
    "safety_redirect",
    "fallback",
  ];

  for (const answerType of answerTypes) {
    const index = responder.indexOf(`answerType: "${answerType}"`);
    assert(index !== -1, `Missing answer type "${answerType}" in chatResponder.js.`);

    const responseBlock = responder.slice(Math.max(0, index - 450), index + 900);
    assert(
      responseBlock.includes("facts:"),
      `Answer type "${answerType}" should attach structured facts.`,
    );
    assert(
      responseBlock.includes("sources:"),
      `Answer type "${answerType}" should attach source metadata.`,
    );
    assert(
      responseBlock.includes("debug:"),
      `Answer type "${answerType}" should attach debug metadata.`,
    );
  }
}

function assertLocalChatContract() {
  assert(
    !packageJson.dependencies?.["@mlc-ai/web-llm"],
    "package.json should not include @mlc-ai/web-llm in local-only mode.",
  );
  assert(
    !fs.existsSync(path.join(root, "src", "lib", "webllmClient.js")) &&
      !fs.existsSync(path.join(root, "src", "lib", "chatEngine.js")) &&
      !fs.existsSync(path.join(root, "src", "lib", "chatPrompt.js")),
    "WebLLM helper files should be removed in local-only mode.",
  );
  assert(
    provider.includes("buildAssistantReply") && !provider.includes("webLlm") && !provider.includes("generateAssistantReply"),
    "ChatbotProvider should call the local responder directly.",
  );
  
  assert(
    provider.includes("showDebugTrace") &&
      provider.includes("Dev:") &&
      provider.includes("message.facts?.detailLevel"),
    "ChatbotProvider should expose a compact dev-only trace for intent, answer type, detail, and rule data.",
  );
}

function assertHealthConditionRoutingContract() {
  assert(
    responder.includes("function getHealthCondition(query)") &&
      responder.includes("function rankConditionRules(rules, query"),
    "chatResponder.js should rank PCOS and triglyceride rules with condition-aware helpers.",
  );
  assert(
    /rankConditionRules\(\s*searchFaqRules\(query\)/.test(responder) &&
      /rankConditionRules\(\s*searchMealRules\(query\)/.test(responder) &&
      /rankConditionRules\(\s*searchPlanRules\(query\)/.test(responder),
    "FAQ, meal, and plan rule lookups should use condition-aware ranking.",
  );
  assert(
    /education:\s*\(\)\s*=>\s*formatFaqReply\(query,\s*replyOptions\)\s*\?\?\s*formatEducationReply\(query,\s*replyOptions\)/.test(responder),
    "Education intent should prefer condition-specific FAQ rules before generic education cards.",
  );

  const expectedRules = [
    "what-is-pcos",
    "what-are-high-triglycerides",
    "what-should-i-eat-for-pcos",
    "what-should-i-eat-for-high-triglycerides",
    "what-exercise-helps-pcos",
    "what-exercise-helps-high-triglycerides",
    "pcos-friendly-meals",
    "triglyceride-friendly-meals",
    "pcos-day-of-eating",
    "triglycerides-day-of-eating",
  ];

  for (const id of expectedRules) {
    assert(
      responder.includes(id) || faqRules.some((rule) => rule.id === id) || mealRules.some((rule) => rule.id === id) || planRules.some((rule) => rule.id === id),
      `Condition routing is missing expected rule "${id}".`,
    );
  }
}

function assertDetailLevelContract() {
  assert(
    responder.includes("function getChatDetailLevel(query)") &&
      responder.includes("function getDetailLimit(detailLevel"),
    "chatResponder.js should classify reply detail level and map it to formatter limits.",
  );
  assert(
    responder.includes('return "safety"') &&
      responder.includes('return "structured"') &&
      responder.includes('return "long"') &&
      responder.includes('return "medium"') &&
      responder.includes('return "short"'),
    "Detail-level classifier should expose safety, structured, long, medium, and short modes.",
  );
  assert(
    responder.includes("const detailLevel = getChatDetailLevel(query);") &&
      responder.includes("const replyOptions = { history, detailLevel };"),
    "buildAssistantReply should calculate detailLevel once and pass it through replyOptions.",
  );
  assert(
    responder.includes("detailLevel,") &&
      responder.includes("getDetailLimit(detailLevel"),
    "Responses should expose detailLevel in facts/debug and use it to limit answer size.",
  );
}

function assertNutritionEvidenceContract() {
  assert(
    mealRules.some(
      (rule) =>
        rule.id === "high-protein-dinner" &&
        rule.filters?.categories?.includes("dinner") &&
        typeof rule.filters?.min_protein_g === "number",
    ),
    "mealRules should include a high-protein-dinner rule with dinner category and protein threshold.",
  );
  assert(
    responder.includes("function formatNutritionEvidence(recipe") &&
      responder.includes("nutrition.protein_g") &&
      responder.includes("g protein"),
    "Meal replies should surface protein evidence from recipe nutrition data.",
  );
  assert(
    responder.includes("formatNutritionEvidence(recipe, refinedRule)"),
    "Meal rule replies should include nutrition evidence beside recipe names.",
  );
  assert(
    responder.includes("function formatNutritionLookupReply(query") &&
      responder.includes('answerType: "nutrition_lookup"') &&
      responder.includes("getRankedRecipesByNutrition(query, metric"),
    "Chat responder should answer direct nutrition lookups and ranked nutrition questions.",
  );
  assert(
    responder.includes("directMatchesWithMetric") &&
      responder.includes("hasVerifiedDirectMatch") &&
      responder.includes("hasVerifiedContextMatch") &&
      responder.includes("the vault does not list ${metric.label}"),
    "Nutrition lookup should avoid treating recipe/card name matches without macro data as verified answers.",
  );
  assert(
    responder.includes("how much|how many") &&
      responder.includes("protein|calories|calorie|kcal"),
    "Recipe lookup normalization should strip nutrition question words before matching recipe names.",
  );
  assert(
    responder.includes("I cannot verify the ${metric.label} amount from the vault") &&
      responder.includes('fallbackReason: "nutrition_missing"'),
    "Nutrition lookup should say when the vault cannot prove a nutrient amount.",
  );
  assert(
    responder.includes("refineMealRuleForQuery(rule, query)") &&
      responder.includes("filters.min_protein_g = Math.max") &&
      responder.includes("filters.categories = [category]"),
    "Meal rules should combine goal and category filters from the user query.",
  );
  assert(
    responder.includes("function formatComparisonReply(query") &&
      responder.includes('answerType: "comparison_reply"') &&
      responder.includes("preferredIngredientSlug"),
    "Chat responder should support simple ingredient comparison questions.",
  );
}

function assertFollowUpContextContract() {
  assert(
    responder.includes("function findRecentRecipeContext(history") &&
      responder.includes("function findRecentIngredientContext(history") &&
      responder.includes("function findRecentWorkoutContext(history"),
    "Chat responder should keep recent recipe, ingredient, and workout subjects for follow-up questions.",
  );
  assert(
    responder.includes("formatNutritionLookupReply(query, replyOptions)") &&
      responder.includes("findRecentRecipeContext(history)") &&
      responder.includes("Using the previous recipe as context"),
    "Nutrition follow-ups should reuse the previous recipe when the user does not name a new one.",
  );
  assert(
    responder.includes("function formatRecipeContextReply(query") &&
      responder.includes("function formatWorkoutContextReply(query") &&
      responder.includes("const recipeContextReply = formatRecipeContextReply(query, replyOptions);") &&
      responder.includes("const workoutContextReply = formatWorkoutContextReply(query, replyOptions);"),
    "Recipe and workout detail follow-ups should use the previous subject before broad routing.",
  );
  assert(
    responder.includes("findIngredientTarget(query, options") &&
      responder.includes("findRecentIngredientContext(history)?.ingredient") &&
      responder.includes("shouldUseSwapReply(query, replyOptions)") &&
      responder.includes("formatSwapReply(query, replyOptions)"),
    "Ingredient swap follow-ups should reuse the previous ingredient when no new ingredient is named.",
  );
}

function expectedAnswerType(query) {
  if (safetyRules.some((rule) => includesAny(query, rule.patterns ?? []))) return "safety_redirect";
  if (/(protein|calories?|kcal|carbs?|fat)/i.test(query) && /(how much|how many|which|most|highest|least|lowest|nutrition|macro|macros|in )/i.test(query)) return "nutrition_lookup";
  if (/(which|what).*(better|best)|\bvs\b| versus | compare | or /i.test(query) && ingredients.filter((ingredient) => includesAny(query, [ingredient.name, ingredient.slug])).length >= 2) return "comparison_reply";
  if (hasSwapRule(query)) return "ingredient_swap";
  if (hasPatternRule(query, mealRules)) return "meal_recommendation_rule";
  if (hasPatternRule(query, planRules)) return "plan_rule";
  if (hasPatternRule(query, machineRules)) return "machine_specific_rule";
  if (hasPatternRule(query, faqRules)) return "faq_answer";
  if (hasPatternRule(query, workoutRules)) return "workout_rule";
  if (hasPatternRule(query, snackRules)) return "snack_rule";
  if (/(recipe|recipes|meal|meals|breakfast|lunch|dinner|using|with|plus|and)/i.test(query)) {
    return "recipe_recommendation";
  }
  return "fallback";
}

const cases = [
  ["alternative for rice", "ingredient_swap"],
  ["swap coconut for triglycerides", "ingredient_swap"],
  ["can i use buttermilk instead of curd", "ingredient_swap"],
  ["rice recipe", "recipe_recommendation"],
  ["breakfast ideas", "meal_recommendation_rule"],
  ["dinner ideas", "meal_recommendation_rule"],
  ["give dinner examples with high protein", "meal_recommendation_rule"],
  ["which dinner has the most protein", "nutrition_lookup"],
  ["how many calories in oats and red rice idli with sambar", "nutrition_lookup"],
  ["which is better for pcos rolled oats or red rice", "comparison_reply"],
  ["meals with no coconut", "meal_recommendation_rule"],
  ["what should i eat before gym", "meal_recommendation_rule"],
  ["give me a simple day of meals", "plan_rule"],
  ["pcos day of eating", "plan_rule"],
  ["weekly workout for triglycerides", "plan_rule"],
  ["leg press hurts knees", "machine_specific_rule"],
  ["why does chest press feel wrong", "machine_specific_rule"],
  ["how hard should cardio feel", "workout_rule"],
  ["what exercise helps pcos", "faq_answer"],
  ["what should i eat for pcos", "faq_answer"],
  ["pcos diet", "faq_answer"],
  ["what should i eat for high triglycerides", "faq_answer"],
  ["high triglycerides diet", "faq_answer"],
  ["what exercise helps high triglycerides", "faq_answer"],
  ["does diet cure pcos", "faq_answer"],
  ["does diet cure triglycerides", "faq_answer"],
  ["snack ideas", "snack_rule"],
  ["what does my lab result mean", "safety_redirect"],
  ["severe chest pain during cardio", "safety_redirect"],
  ["tell me about astronomy", "fallback"],
];

for (const [query, expected] of cases) {
  const actual = expectedAnswerType(query);
  if (actual !== expected) {
    throw new Error(`Expected "${query}" to route as ${expected}, got ${actual}`);
  }
}

for (const [name, rows] of ruleSets) {
  assertUniqueIds(name, rows);
  assertSourceNotes(name, rows);
}

for (const [name, rows] of patternRuleSets) {
  assertPatternCoverage(name, rows);
}

for (const rule of swapRules) {
  assert(rule.target, `swapRules/${rule.id} is missing target.`);
  assert(
    Array.isArray(rule.aliases),
    `swapRules/${rule.id} should expose aliases as an array for target matching.`,
  );
  assert(
    Array.isArray(rule.best_swaps) && rule.best_swaps.length > 0,
    `swapRules/${rule.id} needs at least one best swap.`,
  );
  assert(rule.caution, `swapRules/${rule.id} should include a caution for safe rewriting.`);
}

for (const rule of mealRules) {
  assert(rule.intro, `mealRules/${rule.id} is missing intro text.`);
  assert(rule.filters, `mealRules/${rule.id} is missing filters for deterministic retrieval.`);
}

for (const rule of planRules) {
  assert(
    Array.isArray(rule.outline) && rule.outline.length >= 3,
    `planRules/${rule.id} needs at least three outline items.`,
  );
  assert(rule.caution, `planRules/${rule.id} should include a caution.`);
}

for (const rule of faqRules) {
  assert(rule.short_answer, `faqRules/${rule.id} is missing short_answer.`);
  assert(
    Array.isArray(rule.practical_steps),
    `faqRules/${rule.id} should expose practical_steps as an array.`,
  );
}

assertRecipeData();
assertAnswerBuildersExposeContract();
assertLocalChatContract();
assertHealthConditionRoutingContract();
assertDetailLevelContract();
assertNutritionEvidenceContract();
assertFollowUpContextContract();

const buildReplyBody = responder.slice(responder.indexOf("export function buildAssistantReply"));
const swapIndex = buildReplyBody.indexOf("if (shouldUseSwapReply(query, replyOptions))");
const directRecipeIndex = buildReplyBody.indexOf("if (shouldUseDirectRecipeReply(query))");
const mealRuleIndex = buildReplyBody.indexOf("const mealRuleReply = formatMealRuleReply(query, replyOptions);");
const ingredientRecipeIndex = buildReplyBody.indexOf("if (isIngredientDrivenRecipeQuery(query))");
const safetyIndex = buildReplyBody.indexOf("if (isSafetySensitive(query))");
const contextualMoreIndex = buildReplyBody.indexOf("const contextualMoreReply = formatContextualMoreReply(query, replyOptions);");
const firstIntentIndex = buildReplyBody.indexOf("const intent = classifyIntent(query);");

assert(safetyIndex !== -1, "Safety routing check is missing.");
assert(
  firstIntentIndex !== -1 && safetyIndex < firstIntentIndex,
  "Safety routing must run before intent classification.",
);

assert(
  contextualMoreIndex !== -1 && safetyIndex < contextualMoreIndex && contextualMoreIndex < firstIntentIndex,
  "Contextual 'more' routing must run after safety and before broad intent classification.",
);

assert(
  swapIndex !== -1 && directRecipeIndex !== -1 && swapIndex < directRecipeIndex,
  "Swap routing must run before direct recipe routing.",
);

assert(
  mealRuleIndex !== -1 && ingredientRecipeIndex !== -1 && mealRuleIndex < ingredientRecipeIndex,
  "Meal rules must run before ingredient-driven recipe routing.",
);

const nutritionLookupIndex = buildReplyBody.indexOf("const nutritionLookupReply = formatNutritionLookupReply(query, replyOptions);");
assert(
  nutritionLookupIndex !== -1 && contextualMoreIndex < nutritionLookupIndex && nutritionLookupIndex < swapIndex,
  "Nutrition lookup should run after contextual 'more' and before broad meal/swap routing.",
);

console.log("chat responder smoke tests ok");
