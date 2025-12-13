'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApi } from './useApi';
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  fetchSearchHistory,
  type SearchHistoryItem,
} from '@/lib/api/search-history';

type UseSearchHistoryOptions = {
  enabled?: boolean;
  pageSize?: number;
};

type ApiError = {
  status?: number;
};

export const useSearchHistory = (
  options: UseSearchHistoryOptions = {},
): {
  items: SearchHistoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
} => {
  const { enabled = true, pageSize = 10 } = options;
  const { callApi } = useApi();
  const [items, setItems] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSearchHistory(callApi, {
        page: 1,
        pageSize,
      });
      setItems(data.items ?? []);
    } catch (err) {
      const status = (err as ApiError)?.status;
      if (status === 401 || status === 403) {
        setItems([]);
        return;
      }
      console.error('Failed to load search history', err);
      setError('Failed to load search history.');
    } finally {
      setLoading(false);
    }
  }, [callApi, enabled, pageSize]);

  const remove = useCallback(
    async (id: string) => {
      if (!enabled) return;
      try {
        await deleteSearchHistoryItem(callApi, id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to delete search history item', err);
        setError('Failed to delete search history.');
      }
    },
    [callApi, enabled],
  );

  const clear = useCallback(async () => {
    if (!enabled) return;
    try {
      await clearSearchHistory(callApi);
      setItems([]);
    } catch (err) {
      console.error('Failed to clear search history', err);
      setError('Failed to clear search history.');
    }
  }, [callApi, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh, remove, clear };
};
