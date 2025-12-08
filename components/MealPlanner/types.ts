export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ViewMode = 'week' | 'three-day';

export type WeekDay = {
  key: string;
  label: string;
  dateLabel: string;
  iso: string;
};

export type MealRow = {
  key: MealKey;
  label: string;
  hint: string;
};

export type BacklogRecipe = {
  id: string;
  name: string;
  meal: MealKey;
  duration: string;
  tags: string[];
  imageUrl?: string | null;
  shortDescription?: string | null;
};

export type MealPlan = {
  id: string | null;
  title: string | null;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MealPlanEntry = {
  id: string;
  planId: string | null;
  day: string;
  mealType: MealKey | null;
  recipeId: string;
  notes: string | null;
  sortOrder: number | null;
  createdAt?: string;
  updatedAt?: string;
};
