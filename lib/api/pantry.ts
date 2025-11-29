import type {
  PantryItem,
  CreatePantryInput,
} from '@/components/Pantry/pantry-utils';

type CallApi = <T>(path: string, options?: RequestInit) => Promise<T>;

export const fetchPantryItems = (callApi: CallApi) =>
  callApi<PantryItem[]>('/pantry');

export const upsertPantryItem = (
  callApi: CallApi,
  payload: CreatePantryInput,
) =>
  callApi<PantryItem>('/pantry', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deletePantryItem = (callApi: CallApi, id: number, hard = false) =>
  callApi<void>(`/pantry/${id}${hard ? '?hard=true' : ''}`, {
    method: 'DELETE',
  });
