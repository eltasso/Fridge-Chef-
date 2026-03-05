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
  const enNames = recipe.ingredients.map((i) => i.name.toLowerCase());
  const esNames = (recipe.ingredients_es ?? []).map((i) => i.name.toLowerCase());
  const allNames = [...new Set([...enNames, ...esNames])];
  const matches = ingredients.filter((ing) =>
    allNames.some((ri) => ri.includes(ing) || ing.includes(ri))
  );
  return matches.length / recipe.ingredients.length;
}

export function getMissingIngredients(
  recipe: Recipe,
  availableIngredients: string[]
): { name: string; amount: string }[] {
  const normalized = availableIngredients.map((i) => i.toLowerCase().trim());
  return recipe.ingredients.filter((ing, idx) => {
    const ingNameEn = ing.name.toLowerCase();
    const ingNameEs = (recipe.ingredients_es?.[idx]?.name ?? '').toLowerCase();
    return !normalized.some((a) =>
      a.includes(ingNameEn) || ingNameEn.includes(a) ||
      (ingNameEs && (a.includes(ingNameEs) || ingNameEs.includes(a)))
    );
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

// Units that are countable — always round UP to nearest whole number
const COUNTABLE_UNITS = new Set([
  'egg', 'eggs',
  'clove', 'cloves',
  'tortilla', 'tortillas',
  'slice', 'slices',
  'piece', 'pieces',
  'strip', 'strips',
  'fillet', 'fillets',
  'sheet', 'sheets',
  'breast', 'breasts',
  'thigh', 'thighs',
  'drumstick', 'drumsticks',
]);

function isCountableUnit(unit: string): boolean {
  const u = unit.trim().toLowerCase();
  if (u === '') return true; // bare number, e.g. "2"
  return COUNTABLE_UNITS.has(u) || [...COUNTABLE_UNITS].some((c) => u.startsWith(c + ' '));
}

const FRACTION_MAP: [number, string][] = [
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
];

function formatWithFractions(num: number): string {
  if (num <= 0) return '0';
  const whole = Math.floor(num);
  const decimal = num - whole;

  if (decimal < 0.05) return whole.toString();

  for (const [value, symbol] of FRACTION_MAP) {
    if (Math.abs(decimal - value) < 0.07) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }

  // Fallback to 1 decimal place
  return num.toFixed(1);
}

function scaleAmount(amount: string, ratio: number): string {
  const match = amount.match(/^([\d.\/]+)\s*(.*)$/);
  if (!match) return amount;

  const [, numStr, unitRaw] = match;
  const unit = unitRaw.trim();
  let num: number;

  if (numStr.includes('/')) {
    const [num1, num2] = numStr.split('/');
    num = parseFloat(num1) / parseFloat(num2);
  } else {
    num = parseFloat(numStr);
  }

  if (isNaN(num)) return amount;

  const scaled = num * ratio;

  if (isCountableUnit(unit)) {
    // Always round up for countable items
    const rounded = Math.ceil(scaled);
    return unit ? `${rounded} ${unit}` : `${rounded}`;
  }

  const formatted = formatWithFractions(scaled);
  return unit ? `${formatted} ${unit}` : formatted;
}
