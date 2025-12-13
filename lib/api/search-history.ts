export type SearchHistoryItem = {
  id: string;
  query: string;
  filters?: Record<string, unknown> | null;
  createdAt: string;
};

export type SearchHistoryResponse = {
  items: SearchHistoryItem[];
  page: number;
  pageSize: number;
  total: number;
};

type CallApi = <T>(path: string, options?: RequestInit) => Promise<T>;

const buildQueryString = (page?: number, pageSize?: number) => {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (pageSize) params.set('pageSize', String(pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchSearchHistory = (
  callApi: CallApi,
  options: { page?: number; pageSize?: number } = {},
) => {
  const { page = 1, pageSize = 20 } = options;
  return callApi<SearchHistoryResponse>(
    `/search-history${buildQueryString(page, pageSize)}`,
  );
};

export const deleteSearchHistoryItem = (callApi: CallApi, id: string) =>
  callApi<{ deleted: boolean }>(`/search-history/${id}`, {
    method: 'DELETE',
  });

export const clearSearchHistory = (callApi: CallApi) =>
  callApi<{ deletedCount: number }>(`/search-history`, {
    method: 'DELETE',
  });
