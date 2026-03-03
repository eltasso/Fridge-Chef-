import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, ShoppingItem } from '../types';

const KEYS = {
  PANTRY: 'fridge_chef_pantry',
  FAVORITES: 'fridge_chef_favorites',
  SHOPPING_LIST: 'fridge_chef_shopping_list',
  CACHED_RECIPES: 'fridge_chef_cached_recipes',
};

export async function loadPantry(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PANTRY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function savePantry(ingredients: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PANTRY, JSON.stringify(ingredients));
  } catch {}
}

export async function loadFavorites(): Promise<Recipe[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(favorites: Recipe[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
  } catch {}
}

export async function loadShoppingList(): Promise<ShoppingItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SHOPPING_LIST);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveShoppingList(list: ShoppingItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SHOPPING_LIST, JSON.stringify(list));
  } catch {}
}

export async function loadCachedRecipes(): Promise<{ [key: string]: Recipe[] }> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CACHED_RECIPES);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function saveCachedRecipes(cache: { [key: string]: Recipe[] }): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CACHED_RECIPES, JSON.stringify(cache));
  } catch {}
}

export function buildCacheKey(ingredients: string[], mealTime: string, preference: string): string {
  const sorted = [...ingredients].sort().join(',');
  return `${mealTime}_${preference}_${sorted}`;
}
