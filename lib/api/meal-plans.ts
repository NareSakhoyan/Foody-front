import type { MealPlan, MealPlanEntry } from '@/components/MealPlanner/types';

type CallApi = <T>(path: string, options?: RequestInit) => Promise<T>;

type MealPlanResponse = {
  plan: MealPlan;
  entries: MealPlanEntry[];
};

export const fetchMealPlanForRange = (
  callApi: CallApi,
  start: string,
  end: string,
) =>
  callApi<MealPlanResponse>(
    `/meal-plans/current?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  );

export const createMealPlan = (
  callApi: CallApi,
  payload: { startDate: string; endDate: string; title?: string | null },
) =>
  callApi<MealPlan>('/meal-plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateMealPlan = (
  callApi: CallApi,
  id: string,
  payload: Partial<Pick<MealPlan, 'startDate' | 'endDate' | 'title'>>,
) =>
  callApi<MealPlan>(`/meal-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const upsertMealPlanEntries = (
  callApi: CallApi,
  planId: string,
  entries: Partial<MealPlanEntry>[] | { entries: Partial<MealPlanEntry>[] },
) => {
  const body = Array.isArray(entries) ? entries : entries.entries;
  return callApi<MealPlanEntry[]>(`/meal-plans/${planId}/entries`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const deleteMealPlanEntry = (
  callApi: CallApi,
  planId: string,
  entryId: string,
) =>
  callApi<MealPlanEntry>(`/meal-plans/${planId}/entries/${entryId}`, {
    method: 'DELETE',
  });

export const addMissingIngredientsToShopping = (
  callApi: CallApi,
  planId: string,
) =>
  callApi<{ addedCount: number; items: unknown[] }>(
    `/meal-plans/${planId}/add-missing-to-shopping-list`,
    { method: 'POST' },
  );
