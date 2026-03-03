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
};
