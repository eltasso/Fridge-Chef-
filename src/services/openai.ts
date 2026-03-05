import { Recipe, MealTime, Preference, Difficulty, DietaryTag } from '../types';

export async function scanIngredients(imageBase64: string): Promise<string[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Look at this image and identify all food ingredients you can see. Return ONLY a JSON array of ingredient names in English, like ["chicken", "rice", "onion"]. No other text.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]) as string[];
  } catch {
    return [];
  }
}

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

interface GenerateParams {
  ingredients: string[];
  mealTime: MealTime;
  preference: Preference;
  difficulty: Difficulty | null;
  dietary: DietaryTag[];
  language?: string;
  servings?: number;
  cuisineTypes?: string[];
  maxTime?: number | null;
}

export async function generateRecipes(params: GenerateParams): Promise<Recipe[]> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  const dietaryStr = params.dietary.length > 0 ? params.dietary.join(', ') : 'none';
  const difficultyStr = params.difficulty ?? 'any difficulty';
  const servings = params.servings ?? 2;
  const cuisine = params.cuisineTypes && params.cuisineTypes.length > 0 && !params.cuisineTypes.includes('everything')
    ? params.cuisineTypes.join(', ')
    : 'any';
  const maxTime = params.maxTime ? `${params.maxTime} minutes` : 'no limit';
  const lang = params.language ?? 'en';
  const langInstruction = lang === 'es'
    ? 'Respond entirely in Spanish. All recipe names, descriptions, ingredients, and steps must be in Spanish.'
    : 'Respond entirely in English.';

  const prompt = `You are a creative chef assistant. ${langInstruction}

Generate 3-5 ${cuisine !== 'any' ? cuisine : ''} recipes for ${params.mealTime} that serve ${servings} people and take no more than ${maxTime}.

Ingredients available: ${params.ingredients.join(', ')}
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
  "servings": ${servings},
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
    servings: Number(r.servings) || servings,
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    imageUrl: undefined,
    isAIGenerated: true,
  }));
}
