// useApi.ts
'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

type ApiError = Error & {
  status?: number;
  response?: Response;
  bodyText?: string;
};

export function useApi() {
  const { getToken } = useAuth();

  const callApi = useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      const token = await getToken();

      const headers = new Headers(options.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const error: ApiError = new Error(`API error ${res.status}`);
        error.status = res.status;
        error.response = res;
        try {
          error.bodyText = await res.text();
        } catch {
          // ignore body parsing errors in error path
        }
        throw error;
      }
      return res.json();
    },
    [getToken],
  );

  return { callApi };
}
