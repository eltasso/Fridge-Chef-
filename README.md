# 🧑‍🍳 Fridge Chef

An AI-powered recipe app that generates personalized recipes based on ingredients you already have.

## Screenshots

> _Add screenshots here after first run_

## Features

- **Meal Moment Selection** — Choose Breakfast, Lunch, Snack, or Dinner
- **Smart Ingredient Management** — Add ingredients as chips; pantry persists between sessions
- **15 Local Recipes** — Instant results with no API needed
- **AI Recipe Generation** — GPT-4o-mini creates 3-5 custom recipes from your ingredients
- **Smart Caching** — Same ingredient combo? Uses cached AI results, no extra API cost
- **Filters** — Difficulty, cook time, and dietary restrictions (vegetarian, vegan, gluten-free, dairy-free)
- **Portion Adjuster** — Scale servings 1-12x with auto-recalculated ingredient amounts
- **Cook Mode** — Full-screen step-by-step guide, built-in timer, screen stays awake
- **Favorites** — Save recipes with persistent storage
- **Shopping List** — Auto-generate from missing ingredients, check off as you shop, share the list

## Tech Stack

| Technology | Purpose |
|---|---|
| Expo (React Native) | Cross-platform mobile framework |
| TypeScript | Type safety |
| React Navigation | Stack + Bottom Tab navigation |
| OpenAI API (GPT-4o-mini) | AI recipe generation |
| AsyncStorage | Local data persistence |
| expo-keep-awake | Cook mode screen lock |
| expo-sharing | Share recipes & shopping list |

## Project Structure

```
src/
  components/
    common/        Button, Card, Input, Chip, Header
    recipe/        RecipeCard, IngredientTag
  screens/
    OnboardingScreen.tsx
    IngredientsScreen.tsx
    RecipeListScreen.tsx
    RecipeDetailScreen.tsx
    FavoritesScreen.tsx
    ShoppingListScreen.tsx
  data/
    recipes.ts     15 fallback recipes
  services/
    openai.ts      OpenAI API integration
  utils/
    filterRecipes.ts
    storage.ts
    share.ts
  styles/
    theme.ts
  context/
    AppContext.tsx
  types/
    index.ts
```

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd fridge-chef
npm install
```

### 2. Configure API Key

Copy the env file and add your OpenAI key:

```bash
# Edit .env
EXPO_PUBLIC_OPENAI_API_KEY=sk-...your-key-here...
```

Get your API key at [platform.openai.com](https://platform.openai.com).

> The app works fully offline with 15 local recipes. The API key is only needed for AI generation.

### 3. Run

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator / `i` for iOS simulator.

## Notes

- AI recipe generation uses `gpt-4o-mini` — very affordable (~$0.001 per generation)
- Generated recipes are cached locally; same ingredient combo won't trigger a new API call
- Cook Mode uses `expo-keep-awake` to prevent the screen from sleeping during cooking
