import type { Recipe } from '@/lib/types/recipe';
export {
  commonIngredients,
  staplePreset,
  staplePresetDetailed,
  type StapleItem,
} from '@/constants/pantry';

export type PantryItem = {
  id: number;
  name: string;
  quantity: string | null;
  isFinished?: boolean;
};

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
