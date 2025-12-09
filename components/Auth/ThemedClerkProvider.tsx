'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark, light } from '@clerk/themes';
import { useTheme } from 'next-themes';
import type { PropsWithChildren } from 'react';

export const ThemedClerkProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();
  const baseTheme = resolvedTheme === 'dark' ? dark : light;

  return (
    <ClerkProvider
      appearance={{
        baseTheme,
        variables: {
          colorPrimary: 'hsl(var(--primary))',
          colorText: 'hsl(var(--foreground))',
          colorTextOnPrimaryBackground: 'hsl(var(--primary-foreground))',
          colorBackground: 'hsl(var(--background))',
          colorInputBackground: 'hsl(var(--card))',
          colorDanger: 'hsl(var(--destructive))',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-geist-sans)',
        },
        elements: {
          rootBox: 'bg-background text-foreground',
          card: 'bg-card border rounded-xl shadow-sm',
          headerTitle: 'text-2xl font-semibold text-foreground',
          headerSubtitle: 'text-sm text-muted-foreground',
          formButtonPrimary:
            'bg-primary text-primary-foreground hover:bg-primary/90',
          formButtonPrimary__icon: 'text-primary-foreground',
          socialButtonsBlockButton:
            'bg-muted text-foreground hover:bg-muted/80 border',
          formFieldInput:
            'bg-card text-foreground border focus-visible:ring-2 focus-visible:ring-primary/60',
          footer: 'bg-transparent border-0',
          modalBackdrop: 'bg-black/60 backdrop-blur-sm',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};
