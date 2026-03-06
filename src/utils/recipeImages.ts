import { Recipe } from '../types';

// Curated Unsplash food photos — each maps to a food keyword
const IMAGE_MAP: { keywords: string[]; url: string }[] = [
  { keywords: ['taco', 'tortilla', 'burrito'], url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop' },
  { keywords: ['enchilada', 'chilaquile', 'quesadilla'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop' },
  { keywords: ['pasta', 'spaghetti', 'carbonara', 'fettuccine', 'rigatoni', 'penne'], url: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&auto=format&fit=crop' },
  { keywords: ['pizza'], url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&auto=format&fit=crop' },
  { keywords: ['burger', 'hamburger', 'sandwich', 'sándwich'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop' },
  { keywords: ['soup', 'stew', 'broth', 'sopa', 'caldo', 'guiso'], url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop' },
  { keywords: ['salad', 'ensalada'], url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop' },
  { keywords: ['chicken', 'pollo'], url: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&auto=format&fit=crop' },
  { keywords: ['beef', 'steak', 'carne', 'meat'], url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop' },
  { keywords: ['fish', 'salmon', 'shrimp', 'seafood', 'pescado', 'camarón'], url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&auto=format&fit=crop' },
  { keywords: ['rice', 'arroz', 'bowl', 'fried rice'], url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop' },
  { keywords: ['egg', 'huevo', 'omelette', 'frittata', 'ranchero'], url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop' },
  { keywords: ['pancake', 'waffle', 'crepe'], url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&auto=format&fit=crop' },
  { keywords: ['toast', 'avocado', 'tostada', 'palta'], url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&auto=format&fit=crop' },
  { keywords: ['smoothie', 'shake', 'juice', 'batido'], url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop' },
  { keywords: ['curry', 'indian', 'tikka', 'masala'], url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop' },
  { keywords: ['stir', 'wok', 'asian', 'noodle'], url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&auto=format&fit=crop' },
  { keywords: ['oatmeal', 'granola', 'cereal', 'avena'], url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&auto=format&fit=crop' },
  { keywords: ['cake', 'cookie', 'brownie', 'dessert', 'postre', 'torta'], url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop' },
  { keywords: ['sushi', 'roll', 'maki'], url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&auto=format&fit=crop' },
];

// Fallback pool — variety of food shots for unmatched recipes
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop',
];

export function getRecipeImage(recipe: Recipe): string {
  if (recipe.imageUrl) return recipe.imageUrl;

  const nameLower = (recipe.name + ' ' + (recipe.name_es ?? '')).toLowerCase();

  for (const entry of IMAGE_MAP) {
    if (entry.keywords.some((kw) => nameLower.includes(kw))) {
      return entry.url;
    }
  }

  // Deterministic fallback based on recipe id
  const hash = recipe.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}
