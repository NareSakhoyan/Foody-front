import type { Recipe } from '@/lib/types/recipe';

export type PantryItem = {
  id: number;
  name: string;
  quantity: string | null;
  isFinished?: boolean;
};

export const commonIngredients = [
  'Salt',
  'Pepper',
  'Olive oil',
  'Garlic',
  'Onion',
  'Chicken breast',
  'Eggs',
  'Milk',
  'Butter',
  'Flour',
  'Sugar',
  'Rice',
  'Pasta',
  'Tomatoes',
  'Bell pepper',
  'Cumin',
  'Paprika',
  'Soy sauce',
];

export const staplePreset = [
  'Salt',
  'Pepper',
  'Olive oil',
  'Sugar',
  'Flour',
  'Rice',
  'Pasta',
];

export type CreatePantryInput = {
  name: string;
  quantity?: string | null;
  isFinished?: boolean;
  id?: number;
};

export const parseBatchLines = (raw: string): CreatePantryInput[] => {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[\t|,]+/).map((p) => p.trim());
      const [name, qty] = parts;
      return {
        name,
        quantity: qty || null,
      };
    })
    .filter((entry) => entry.name);
};

export type PantryRecommendation = {
  recipe?: Recipe;
  matchCount?: number;
  matchRatio?: number;
  matchedIngredients?: string[];
  missingIngredients?: string[];
} & Partial<Recipe>;
