// useCurrentUser.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { useApi } from './useApi';
import { useUser } from '@clerk/nextjs';

export type AppUser = {
  id: string; // internal UUID
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  username: string | null;
  role: string;
};

type ApiError = {
  status?: number;
};

export function useCurrentUser() {
  const { isSignedIn, user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { callApi } = useApi();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const creationAttemptedRef = useRef(false);

  const resetUserState = () => {
    setUser(null);
    setLoading(false);
    creationAttemptedRef.current = false;
  };

  // State resets on sign-out need to happen here even though the lint rule discourages it.
  useEffect(() => {
    if (!isUserLoaded) return;

    if (!isSignedIn) {
      resetUserState();
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      try {
        const data = await callApi<AppUser>('/me');
        setUser(data);
      } catch (e: unknown) {
        const status = (e as ApiError)?.status;
        const canCreate = !creationAttemptedRef.current && status === 404 && clerkUser;

        if (canCreate) {
          creationAttemptedRef.current = true;
          try {
            const createdUser = await callApi<AppUser>('/users', {
              method: 'POST',
              body: JSON.stringify({
                clerkId: clerkUser.id,
                email:
                  clerkUser.primaryEmailAddress?.emailAddress ??
                  clerkUser.emailAddresses[0]?.emailAddress ??
                  '',
                name: clerkUser.fullName ?? clerkUser.username ?? null,
                imageUrl: clerkUser.imageUrl ?? null,
              }),
            });
            setUser(createdUser);
            return;
          } catch (createErr) {
            console.error('Error creating the user', createErr);
          }
        }

        setUser(null);
        console.error('Error while fetching the user', e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [isSignedIn, isUserLoaded, clerkUser, callApi]);

  return { user, loading };
}
