import * as React from 'react';

import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'secondary' | 'outline';

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary:
    'border-transparent bg-secondary text-secondary-foreground dark:bg-secondary/50',
  outline: 'text-foreground',
};

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: BadgeVariant;
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
        badgeStyles[variant],
        className,
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
