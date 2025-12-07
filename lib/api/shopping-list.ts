import type {
  CreateShoppingItemInput,
  ShoppingItem,
} from '@/components/Pantry/shopping-utils';

type CallApi = <T>(path: string, options?: RequestInit) => Promise<T>;

export const fetchShoppingItems = (callApi: CallApi) =>
  callApi<ShoppingItem[]>('/shopping-list');

export const createShoppingItem = (
  callApi: CallApi,
  payload: CreateShoppingItemInput,
) =>
  callApi<ShoppingItem>('/shopping-list', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateShoppingItem = (
  callApi: CallApi,
  id: number,
  payload: Partial<CreateShoppingItemInput>,
) =>
  callApi<ShoppingItem>(`/shopping-list/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteShoppingItem = (callApi: CallApi, id: number) =>
  callApi<ShoppingItem>(`/shopping-list/${id}`, {
    method: 'DELETE',
  });

export const clearPurchasedShoppingItems = (callApi: CallApi) =>
  callApi<{ deletedCount: number }>('/shopping-list/items?status=purchased', {
    method: 'DELETE',
  });
