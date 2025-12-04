import type { Recipe } from '@/lib/types/recipe';
import {
  commonIngredients,
  staplePreset,
  staplePresetDetailed,
} from '@/constants/pantry';
export type { StapleItem } from '@/constants/pantry';

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

type StapleCategory =
  | 'spices'
  | 'grains'
  | 'proteins'
  | 'dairy'
  | 'produce'
  | 'baking'
  | 'condiments'
  | 'canned'
  | 'oils'
  | 'snacks'
  | 'misc'
  | 'uncategorized';

const stapleCategoryMap: Record<string, StapleCategory> =
  staplePresetDetailed.reduce(
    (acc, item) => {
      acc[item.name.toLowerCase()] = item.category as StapleCategory;
      return acc;
    },
    {} as Record<string, StapleCategory>,
  );

export const getPantryCategory = (name?: string | null): StapleCategory => {
  if (!name) return 'uncategorized';
  const key = name.trim().toLowerCase();
  return stapleCategoryMap[key] ?? 'uncategorized';
};

export { commonIngredients, staplePreset, staplePresetDetailed };
