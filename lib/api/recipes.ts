import type { Recipe } from '@/lib/types/recipe';

type CallApi = <T>(path: string, options?: RequestInit) => Promise<T>;

export type RecipeListResponse = {
  items: Recipe[];
  page: number;
  pageSize: number;
  total: number;
};

export type RecipeListQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  tag?: string;
  status?: string;
  authorId?: string;
};

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
  spices?: Recipe['spices'];
  isPublic: boolean;
  status: Recipe['status'];
};

const buildQuery = (query?: RecipeListQuery) => {
  const params = new URLSearchParams();
  if (!query) return '';
  Object.entries(query).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '') return;
    params.append(key, String(val));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchRecipes = (
  callApi: CallApi,
  endpoint = '/recipes',
  query?: RecipeListQuery,
) => callApi<RecipeListResponse>(`${endpoint}${buildQuery(query)}`);

export type TagsResponse = { tags: Recipe['tags'] } | Recipe['tags'];

export const fetchRecipeTags = async (
  callApi: CallApi,
): Promise<Recipe['tags']> => {
  const data = await callApi<TagsResponse>('/tags');
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === 'object' &&
    'tags' in data &&
    Array.isArray((data as { tags?: unknown }).tags)
  ) {
    return (data as { tags: Recipe['tags'] }).tags;
  }
  return [];
};

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
