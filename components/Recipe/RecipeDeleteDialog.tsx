'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type RecipeDeleteDialogProps = {
  open: boolean;
  deleting?: boolean;
  targetName?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

const RecipeDeleteDialog = ({
  open,
  deleting = false,
  targetName,
  onOpenChange,
  onConfirm,
}: RecipeDeleteDialogProps) => (
  <AlertDialog
    open={open}
    onOpenChange={(next) => {
      onOpenChange(next);
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete recipe?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete{' '}
          {targetName || 'this recipe'}.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={deleting}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export { RecipeDeleteDialog };
