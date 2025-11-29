import type { Recipe } from '@/lib/types/recipe';
import { getTagLabel } from '@/lib/utils/tags';

export type IngredientInput = {
  name: string;
  quantity: number;
  measureUnit: string;
  note?: string;
};

export type SpiceInput = {
  name: string;
  note?: string;
};

export const emptyIngredient: IngredientInput = {
  name: '',
  quantity: 1,
  measureUnit: '',
  note: '',
};

export const emptySpice: SpiceInput = {
  name: '',
  note: '',
};

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export const capitalizeStart = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

export const formatTagsInput = (value?: Recipe['tags'] | string | null) => {
  if (Array.isArray(value)) {
    return value
      .map((tag) => getTagLabel(tag))
      .filter(Boolean)
      .join(', ');
  }
  return value ?? '';
};
