export type RecipeTag =
  | string
  | {
      id?: string | number;
      name?: string;
      tag?: string;
      label?: string;
    };

export type Recipe = {
  id: string;
  authorId: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  prepDescription?: string | null;
  cookDescription?: string | null;
  steps?: string | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings?: number | null;
  matchCount?: number;
  matchRatio?: number;
  matchedIngredients?: string[];
  missingIngredients?: string[];
  ingredients: {
    name: string;
    quantity: number;
    measureUnit: string;
    note?: string;
  }[];
  spices?: {
    name: string;
    note?: string;
  }[];
  tags: RecipeTag[];
  tagIds?: Array<string | number>;
  author?: {
    id: string | number;
    name?: string | null;
    imageUrl?: string | null;
  };
  isFavorite?: boolean;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
};
