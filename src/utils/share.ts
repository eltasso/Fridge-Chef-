import { Platform } from 'react-native';
import { Recipe } from '../types';

async function shareText(title: string, text: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, text });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
    return;
  }
  const { Share } = require('react-native');
  await Share.share({ message: text, title });
}

export async function shareRecipe(recipe: Recipe): Promise<void> {
  await shareText(recipe.name, buildRecipeText(recipe));
}

export async function shareShoppingList(items: { name: string; amount: string }[]): Promise<void> {
  const text = `🛒 Shopping List\n\n${items.map((i) => `• ${i.amount} ${i.name}`).join('\n')}`;
  await shareText('Shopping List', text);
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
