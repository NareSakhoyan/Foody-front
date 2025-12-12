'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type RecipeListSkeletonProps = {
  horizontalScroll?: boolean;
  gridClassName?: string;
  count?: number;
};

const RecipeListSkeleton = ({
  horizontalScroll = false,
  gridClassName,
  count = 6,
}: RecipeListSkeletonProps) => (
  <div
    className={cn(
      horizontalScroll
        ? 'grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-4 overflow-x-auto pb-2 no-scrollbar sm:auto-cols-[minmax(280px,340px)]'
        : 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3',
      gridClassName,
    )}
  >
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={`skeleton-${idx}`}
        className="flex h-full min-h-80 flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs"
      >
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    ))}
  </div>
);

export { RecipeListSkeleton };
