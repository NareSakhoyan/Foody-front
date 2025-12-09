'use client';

import { SignInButton } from '@clerk/nextjs';
import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type SignInPromptProps = {
  title?: string;
  message?: string;
};

export const SignInPrompt = ({
  title = 'Please log in first to proceed.',
  message = 'You need to be signed in to view this page.',
}: SignInPromptProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const redirectUrl = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  return (
    <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center shadow-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex justify-center pt-2">
          <SignInButton mode="modal" redirectUrl={redirectUrl}>
            <Button type="button">Log in to continue</Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
};
