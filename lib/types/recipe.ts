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
  isFavorite?: boolean;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
};
