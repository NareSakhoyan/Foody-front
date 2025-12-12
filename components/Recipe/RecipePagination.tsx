'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

type RecipePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
};

const RecipePagination = ({
  page,
  totalPages,
  onPageChange,
}: RecipePaginationProps) =>
  totalPages > 1 ? (
    <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  ) : null;

export { RecipePagination };
