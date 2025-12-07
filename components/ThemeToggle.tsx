'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';

type ThemeToggleProps = {
  collapsed?: boolean;
  className?: string;
};

const ThemeToggle = ({ collapsed = false, className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = mounted ? resolvedTheme : 'light';
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm',
        collapsed ? 'justify-center border-none bg-transparent px-0' : '',
        className,
      )}
    >
      {!collapsed ? (
        <div className="flex flex-col">
          <span className="font-medium">Theme</span>
          <span className="text-xs text-muted-foreground">
            Toggle light/dark appearance.
          </span>
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        aria-label="Toggle theme"
        disabled={!mounted}
        onClick={() => setTheme(nextTheme)}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default ThemeToggle;
