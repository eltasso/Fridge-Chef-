import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Recipe, ShoppingItem, MealTime, Preference, Filters } from '../types';
import {
  loadPantry, savePantry,
  loadFavorites, saveFavorites,
  loadShoppingList, saveShoppingList,
  loadCachedRecipes, saveCachedRecipes,
  buildCacheKey,
} from '../utils/storage';

type Action =
  | { type: 'SET_MEAL_TIME'; payload: MealTime }
  | { type: 'SET_PREFERENCE'; payload: Preference }
  | { type: 'ADD_INGREDIENT'; payload: string }
  | { type: 'REMOVE_INGREDIENT'; payload: string }
  | { type: 'SET_SESSION_INGREDIENTS'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'TOGGLE_FAVORITE'; payload: Recipe }
  | { type: 'ADD_TO_SHOPPING'; payload: ShoppingItem[] }
  | { type: 'TOGGLE_SHOPPING_ITEM'; payload: string }
  | { type: 'REMOVE_SHOPPING_ITEM'; payload: string }
  | { type: 'CLEAR_SHOPPING_LIST' }
  | { type: 'SET_CACHED_RECIPES'; payload: { key: string; recipes: Recipe[] } }
  | { type: 'HYDRATE'; payload: Partial<AppState> };

const initialState: AppState = {
  mealTime: null,
  preference: null,
  pantryIngredients: [],
  sessionIngredients: [],
  filters: { difficulty: null, maxTime: null, dietary: [] },
  favorites: [],
  shoppingList: [],
  cachedRecipes: {},
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_MEAL_TIME':
      return { ...state, mealTime: action.payload };
    case 'SET_PREFERENCE':
      return { ...state, preference: action.payload };
    case 'ADD_INGREDIENT': {
      const name = action.payload.toLowerCase().trim();
      if (state.sessionIngredients.includes(name)) return state;
      const session = [...state.sessionIngredients, name];
      const pantry = state.pantryIngredients.includes(name)
        ? state.pantryIngredients
        : [...state.pantryIngredients, name];
      return { ...state, sessionIngredients: session, pantryIngredients: pantry };
    }
    case 'REMOVE_INGREDIENT':
      return {
        ...state,
        sessionIngredients: state.sessionIngredients.filter((i) => i !== action.payload),
      };
    case 'SET_SESSION_INGREDIENTS':
      return { ...state, sessionIngredients: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.some((r) => r.id === action.payload.id);
      const favorites = exists
        ? state.favorites.filter((r) => r.id !== action.payload.id)
        : [...state.favorites, action.payload];
      return { ...state, favorites };
    }
    case 'ADD_TO_SHOPPING': {
      const existing = new Set(state.shoppingList.map((i) => i.name.toLowerCase()));
      const newItems = action.payload.filter((i) => !existing.has(i.name.toLowerCase()));
      return { ...state, shoppingList: [...state.shoppingList, ...newItems] };
    }
    case 'TOGGLE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.map((i) =>
          i.id === action.payload ? { ...i, checked: !i.checked } : i
        ),
      };
    case 'REMOVE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.filter((i) => i.id !== action.payload),
      };
    case 'CLEAR_SHOPPING_LIST':
      return { ...state, shoppingList: [] };
    case 'SET_CACHED_RECIPES':
      return {
        ...state,
        cachedRecipes: { ...state.cachedRecipes, [action.payload.key]: action.payload.recipes },
      };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  setMealTime: (m: MealTime) => void;
  setPreference: (p: Preference) => void;
  addIngredient: (name: string) => void;
  removeIngredient: (name: string) => void;
  setFilters: (f: Partial<Filters>) => void;
  toggleFavorite: (recipe: Recipe) => void;
  isFavorite: (id: string) => boolean;
  addToShoppingList: (items: ShoppingItem[]) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearShoppingList: () => void;
  setCachedRecipes: (key: string, recipes: Recipe[]) => void;
  getCacheKey: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const [pantryIngredients, favorites, shoppingList, cachedRecipes] = await Promise.all([
        loadPantry(),
        loadFavorites(),
        loadShoppingList(),
        loadCachedRecipes(),
      ]);
      dispatch({ type: 'HYDRATE', payload: { pantryIngredients, favorites, shoppingList, cachedRecipes } });
    })();
  }, []);

  useEffect(() => { savePantry(state.pantryIngredients); }, [state.pantryIngredients]);
  useEffect(() => { saveFavorites(state.favorites); }, [state.favorites]);
  useEffect(() => { saveShoppingList(state.shoppingList); }, [state.shoppingList]);
  useEffect(() => { saveCachedRecipes(state.cachedRecipes); }, [state.cachedRecipes]);

  const setMealTime = useCallback((m: MealTime) => dispatch({ type: 'SET_MEAL_TIME', payload: m }), []);
  const setPreference = useCallback((p: Preference) => dispatch({ type: 'SET_PREFERENCE', payload: p }), []);
  const addIngredient = useCallback((name: string) => dispatch({ type: 'ADD_INGREDIENT', payload: name }), []);
  const removeIngredient = useCallback((name: string) => dispatch({ type: 'REMOVE_INGREDIENT', payload: name }), []);
  const setFilters = useCallback((f: Partial<Filters>) => dispatch({ type: 'SET_FILTERS', payload: f }), []);
  const toggleFavorite = useCallback((recipe: Recipe) => dispatch({ type: 'TOGGLE_FAVORITE', payload: recipe }), []);
  const isFavorite = useCallback((id: string) => state.favorites.some((r) => r.id === id), [state.favorites]);
  const addToShoppingList = useCallback((items: ShoppingItem[]) => dispatch({ type: 'ADD_TO_SHOPPING', payload: items }), []);
  const toggleShoppingItem = useCallback((id: string) => dispatch({ type: 'TOGGLE_SHOPPING_ITEM', payload: id }), []);
  const removeShoppingItem = useCallback((id: string) => dispatch({ type: 'REMOVE_SHOPPING_ITEM', payload: id }), []);
  const clearShoppingList = useCallback(() => dispatch({ type: 'CLEAR_SHOPPING_LIST' }), []);
  const setCachedRecipes = useCallback((key: string, recipes: Recipe[]) =>
    dispatch({ type: 'SET_CACHED_RECIPES', payload: { key, recipes } }), []);
  const getCacheKey = useCallback(() =>
    buildCacheKey(state.sessionIngredients, state.mealTime ?? '', state.preference ?? ''),
    [state.sessionIngredients, state.mealTime, state.preference]);

  return (
    <AppContext.Provider value={{
      state, setMealTime, setPreference, addIngredient, removeIngredient,
      setFilters, toggleFavorite, isFavorite, addToShoppingList,
      toggleShoppingItem, removeShoppingItem, clearShoppingList,
      setCachedRecipes, getCacheKey,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
