import * as Sharing from 'expo-sharing';
import { Recipe } from '../types';

export async function shareRecipe(recipe: Recipe): Promise<void> {
  const text = buildRecipeText(recipe);
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    console.log('Sharing not available');
    return;
  }

  // Expo Sharing requires a file URI; we write a temp text approach via the Share API
  const { Share } = require('react-native');
  await Share.share({ message: text, title: recipe.name });
}

export async function shareShoppingList(items: { name: string; amount: string }[]): Promise<void> {
  const { Share } = require('react-native');
  const text = `🛒 Shopping List\n\n${items.map((i) => `• ${i.amount} ${i.name}`).join('\n')}`;
  await Share.share({ message: text, title: 'Shopping List' });
}

function buildRecipeText(recipe: Recipe): string {
  const lines: string[] = [
    `🍽️ ${recipe.name}`,
    ``,
    recipe.description,
    ``,
    `⏱ Prep: ${recipe.prepTime}min  |  Cook: ${recipe.cookTime}min  |  Serves: ${recipe.servings}`,
    `📊 Difficulty: ${recipe.difficulty}`,
    ``,
    `🧂 Ingredients:`,
    ...recipe.ingredients.map((i) => `  • ${i.amount} ${i.name}`),
    ``,
    `📋 Steps:`,
    ...recipe.steps.map((s, idx) => `  ${idx + 1}. ${s}`),
    ``,
    `Made with Fridge Chef 🧑‍🍳`,
  ];
  return lines.join('\n');
}
