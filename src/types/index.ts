export type MealTime = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type Preference = 'sweet' | 'savory';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  // Bilingual display fields (optional — AI-generated recipes won't have these)
  name_es?: string;
  name_en?: string;
  description_es?: string;
  description_en?: string;
  ingredients_es?: Ingredient[];
  steps_es?: string[];
  mealTime: MealTime[];
  preference: Preference;
  difficulty: Difficulty;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  imageUrl?: string;
  isAIGenerated?: boolean;
}

/** Returns the localized recipe name, falling back to the canonical `name` field. */
export function getLocalizedName(recipe: Recipe, lang: string): string {
  return (lang === 'es' ? recipe.name_es : recipe.name_en) ?? recipe.name;
}

/** Returns the localized recipe description. */
export function getLocalizedDescription(recipe: Recipe, lang: string): string {
  return (lang === 'es' ? recipe.description_es : recipe.description_en) ?? recipe.description;
}

/** Returns the localized ingredients list (for display). */
export function getLocalizedIngredients(recipe: Recipe, lang: string): Ingredient[] {
  return (lang === 'es' ? recipe.ingredients_es : undefined) ?? recipe.ingredients;
}

/** Returns the localized steps list. */
export function getLocalizedSteps(recipe: Recipe, lang: string): string[] {
  return (lang === 'es' ? recipe.steps_es : undefined) ?? recipe.steps;
}

export interface Filters {
  difficulty: Difficulty | null;
  maxTime: number | null;
  dietary: DietaryTag[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
  recipeId?: string;
  recipeName?: string;
}

export interface AppState {
  mealTime: MealTime | null;
  preference: Preference | null;
  pantryIngredients: string[];
  sessionIngredients: string[];
  filters: Filters;
  favorites: Recipe[];
  shoppingList: ShoppingItem[];
  cachedRecipes: { [key: string]: Recipe[] };
}

export type AppStackParamList = {
  Welcome: undefined;
  Main: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  Paywall: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Ingredients: undefined;
  RecipeList: undefined;
  RecipeDetail: { recipe: Recipe };
};

export type TabParamList = {
  HomeStack: undefined;
  Favorites: undefined;
  ShoppingList: undefined;
  Profile: undefined;
};
