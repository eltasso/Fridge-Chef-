import { Recipe, MealTime, Preference, Difficulty, DietaryTag } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

interface GenerateParams {
  ingredients: string[];
  mealTime: MealTime;
  preference: Preference;
  difficulty: Difficulty | null;
  dietary: DietaryTag[];
}

export async function generateRecipes(params: GenerateParams): Promise<Recipe[]> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  const dietaryStr = params.dietary.length > 0 ? params.dietary.join(', ') : 'none';
  const difficultyStr = params.difficulty ?? 'any difficulty';

  const prompt = `You are a creative chef assistant. Generate 3-5 recipes based on these parameters:

Ingredients available: ${params.ingredients.join(', ')}
Meal time: ${params.mealTime}
Preference: ${params.preference}
Difficulty: ${difficultyStr}
Dietary restrictions: ${dietaryStr}

Return ONLY a valid JSON array of recipe objects. Each recipe must follow this exact structure:
{
  "name": "Recipe Name",
  "description": "One sentence description",
  "prepTime": 10,
  "cookTime": 20,
  "difficulty": "easy",
  "servings": 4,
  "ingredients": [
    { "name": "ingredient name", "amount": "1 cup" }
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "tags": ["tag1", "tag2"]
}

Rules:
- Use primarily the provided ingredients, add only essential staple pantry items
- prepTime and cookTime must be numbers (minutes)
- difficulty must be "easy", "medium", or "hard"
- Include 4-8 ingredients per recipe
- Include 4-8 clear steps
- Tags can include: vegetarian, vegan, gluten-free, dairy-free, and descriptive food tags
- Return ONLY the JSON array, no other text`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse recipe JSON from AI response');
  }

  const rawRecipes = JSON.parse(jsonMatch[0]);

  return rawRecipes.map((r: any, index: number): Recipe => ({
    id: `ai_${Date.now()}_${index}`,
    name: r.name ?? 'AI Recipe',
    description: r.description ?? '',
    mealTime: [params.mealTime],
    preference: params.preference,
    difficulty: (r.difficulty as Difficulty) ?? 'easy',
    prepTime: Number(r.prepTime) || 10,
    cookTime: Number(r.cookTime) || 15,
    servings: Number(r.servings) || 2,
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    imageUrl: undefined,
    isAIGenerated: true,
  }));
}
