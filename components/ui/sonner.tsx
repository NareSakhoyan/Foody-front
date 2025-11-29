'use client';

import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="bottom-right"
      expand
      toastOptions={{
        classNames: {
          toast: 'border border-border bg-card text-foreground shadow-md',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-foreground',
        },
      }}
      {...props}
    />
  );
}
