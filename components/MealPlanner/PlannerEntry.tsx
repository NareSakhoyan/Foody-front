import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MealPlanEntry } from './types';
import type { Recipe } from '@/lib/types/recipe';

type PlannerEntryProps = {
  entry: MealPlanEntry;
  recipe?: Recipe;
  loading?: boolean;
  onRemoveEntry?: (entryId: string) => void;
};

function PlannerEntry({
  entry,
  recipe,
  loading,
  onRemoveEntry,
}: PlannerEntryProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 shadow-xs">
      <div className="min-w-0">
        <div className="text-sm font-medium">{recipe?.name ?? 'Recipe'}</div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {recipe?.shortDescription}
        </p>
      </div>
      {onRemoveEntry ? (
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onRemoveEntry(entry.id)}
          disabled={loading}
          aria-label="Remove entry"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

export { PlannerEntry };
