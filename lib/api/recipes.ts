import type { Recipe } from '@/lib/types/recipe';

type CallApi = <T>(path: string, options?: RequestInit) => Promise<T>;

export type RecipePayload = {
  name: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  prepDescription: string | null;
  cookDescription: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  tags: string[];
  ingredients: Recipe['ingredients'];
  isPublic: boolean;
  status: Recipe['status'];
};

export const fetchRecipes = (callApi: CallApi, endpoint = '/recipes') =>
  callApi<Recipe[]>(endpoint);

export const fetchRecipe = (callApi: CallApi, id: string) =>
  callApi<Recipe>(`/recipes/${id}`);

export const createRecipe = (callApi: CallApi, payload: RecipePayload) =>
  callApi<Recipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateRecipe = (
  callApi: CallApi,
  id: string,
  payload: RecipePayload,
) =>
  callApi<Recipe>(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteRecipe = (callApi: CallApi, id: string) =>
  callApi(`/recipes/${id}`, { method: 'DELETE' });

export const favoriteRecipe = (
  callApi: CallApi,
  id: string,
  favorite: boolean,
) =>
  callApi(`/recipes/${id}/favorite`, {
    method: favorite ? 'POST' : 'DELETE',
  });
