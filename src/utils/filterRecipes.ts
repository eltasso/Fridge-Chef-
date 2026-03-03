import { Recipe, Filters, MealTime, Preference } from '../types';

export function filterRecipes(
  recipes: Recipe[],
  ingredients: string[],
  mealTime: MealTime | null,
  preference: Preference | null,
  filters: Filters
): Recipe[] {
  const normalizedIngredients = ingredients.map((i) => i.toLowerCase().trim());

  return recipes
    .filter((recipe) => {
      if (mealTime && !recipe.mealTime.includes(mealTime)) return false;
      if (preference && recipe.preference !== preference) return false;
      if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;

      const totalTime = recipe.prepTime + recipe.cookTime;
      if (filters.maxTime && totalTime > filters.maxTime) return false;

      if (filters.dietary.length > 0) {
        const hasAllDietary = filters.dietary.every((d) => recipe.tags.includes(d));
        if (!hasAllDietary) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const scoreA = matchScore(a, normalizedIngredients);
      const scoreB = matchScore(b, normalizedIngredients);
      return scoreB - scoreA;
    });
}

function matchScore(recipe: Recipe, ingredients: string[]): number {
  if (ingredients.length === 0) return 1;
  const recipeIngredientNames = recipe.ingredients.map((i) => i.name.toLowerCase());
  const matches = ingredients.filter((ing) =>
    recipeIngredientNames.some((ri) => ri.includes(ing) || ing.includes(ri))
  );
  return matches.length / recipe.ingredients.length;
}

export function getMissingIngredients(
  recipe: Recipe,
  availableIngredients: string[]
): { name: string; amount: string }[] {
  const normalized = availableIngredients.map((i) => i.toLowerCase().trim());
  return recipe.ingredients.filter((ing) => {
    const ingName = ing.name.toLowerCase();
    return !normalized.some((a) => a.includes(ingName) || ingName.includes(a));
  });
}

export function scaleIngredients(
  ingredients: { name: string; amount: string }[],
  originalServings: number,
  newServings: number
): { name: string; amount: string }[] {
  const ratio = newServings / originalServings;
  return ingredients.map((ing) => ({
    name: ing.name,
    amount: scaleAmount(ing.amount, ratio),
  }));
}

function scaleAmount(amount: string, ratio: number): string {
  const match = amount.match(/^([\d.\/]+)\s*(.*)$/);
  if (!match) return amount;

  const [, numStr, unit] = match;
  let num: number;

  if (numStr.includes('/')) {
    const parts = numStr.split('/');
    num = parseFloat(parts[0]) / parseFloat(parts[1]);
  } else {
    num = parseFloat(numStr);
  }

  if (isNaN(num)) return amount;

  const scaled = num * ratio;
  const formatted = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
  return unit ? `${formatted} ${unit}` : formatted;
}
