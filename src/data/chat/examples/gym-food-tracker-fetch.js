const API_BASE = "https://YOUR_GITHUB_USERNAME.github.io/YOUR_RECIPE_REPO/data";

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchAllRecipeSummaries() {
  return fetchJson("/recipes.json");
}

export async function fetchRecipeById(recipeId) {
  return fetchJson(`/recipes/${recipeId}.json`);
}

export async function fetchCategory(category) {
  return fetchJson(`/categories/${category}.json`);
}

export async function fetchIngredient(ingredientSlug) {
  return fetchJson(`/ingredients/${ingredientSlug}.json`);
}

export function filterRecipesByAvailableIngredients(recipes, availableIngredientSlugs) {
  const pantry = new Set(availableIngredientSlugs);
  return recipes.filter((recipe) =>
    recipe.ingredient_slugs.every((ingredient) => pantry.has(ingredient))
  );
}

export function filterRecipesByMacroTarget(recipes, options = {}) {
  const {
    maxCalories,
    minProtein,
    maxCarbs,
    maxFat,
    category,
  } = options;

  return recipes.filter((recipe) => {
    const nutrition = recipe.nutrition_per_serving;

    if (category && recipe.category !== category) return false;
    if (maxCalories != null && nutrition.calories > maxCalories) return false;
    if (minProtein != null && nutrition.protein_g < minProtein) return false;
    if (maxCarbs != null && nutrition.carbs_g > maxCarbs) return false;
    if (maxFat != null && nutrition.fat_g > maxFat) return false;

    return true;
  });
}

export async function exampleUsage() {
  const recipes = await fetchAllRecipeSummaries();

  const highProteinBreakfasts = filterRecipesByMacroTarget(recipes, {
    category: "breakfast",
    minProtein: 15,
    maxCalories: 450,
  });

  const pantryFriendlyRecipes = filterRecipesByAvailableIngredients(recipes, [
    "horse-gram",
    "chana-dal",
    "toor-dal",
    "urad-dal",
    "spinach",
    "onion",
    "ginger",
    "dry-red-chilli",
    "cumin-seeds",
    "curry-leaves",
    "sesame-oil",
    "salt",
    "water",
  ]);

  const kolluAdai = await fetchRecipeById("kollu-adai");
  const horseGramIndex = await fetchIngredient("horse-gram");

  return {
    highProteinBreakfasts,
    pantryFriendlyRecipes,
    kolluAdai,
    horseGramIndex,
  };
}
