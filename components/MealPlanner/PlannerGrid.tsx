import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { MealKey, MealPlanEntry, MealRow, WeekDay } from './types';
import type { Recipe } from '@/lib/types/recipe';

type PlannerGridProps = {
  days: WeekDay[];
  meals: MealRow[];
  entries: MealPlanEntry[];
  recipesById: Record<string, Recipe | undefined>;
  loading?: boolean;
  onRemoveEntry?: (entryId: string) => void;
  onRecipeDrop?: (recipeId: string, day: string, meal: MealKey) => void;
};

const PlannerGrid = ({
  days,
  meals,
  entries,
  recipesById,
  loading,
  onRemoveEntry,
  onRecipeDrop,
}: PlannerGridProps) => {
  const renderEntry = (entry: MealPlanEntry) => {
    const recipe = recipesById[entry.recipeId];
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 shadow-xs">
        <div className="min-w-0">
          <div className="text-sm font-medium">{recipe?.name ?? 'Recipe'}</div>
          <p className="text-xs text-muted-foreground">
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
  };

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[760px]"
          style={{
            gridTemplateColumns: `140px repeat(${days.length}, minmax(140px, 1fr))`,
          }}
        >
          <div className="bg-muted/60 px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Meals
          </div>
          {days.map((day) => (
            <div
              key={day.key}
              className="flex items-center justify-between border-l border-muted/60 bg-muted/60 px-2.5 py-2.5"
            >
              <div>
                <div className="text-sm font-semibold">{day.label}</div>
                <div className="text-xs text-muted-foreground">
                  {day.dateLabel}
                </div>
              </div>
            </div>
          ))}

          {meals.map((meal) => (
            <div
              key={meal.key}
              className="contents"
              aria-label={`${meal.label} row`}
            >
              <div className="border-t border-muted/60 bg-muted/30 px-2.5 py-3">
                <div className="text-sm font-semibold">{meal.label}</div>
                <div className="text-xs text-muted-foreground">{meal.hint}</div>
              </div>
              {days.map((day) => (
                <div
                  key={`${meal.key}-${day.key}`}
                  className="border-l border-t border-muted/60 px-2.5 py-2.5"
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    try {
                      const data =
                        event.dataTransfer.getData('application/json');
                      const parsed = JSON.parse(data);
                      const recipeId = parsed?.recipeId ?? parsed?.id;
                      if (recipeId && onRecipeDrop) {
                        onRecipeDrop(String(recipeId), day.iso, meal.key);
                      }
                    } catch (err) {
                      console.error('Failed to handle drop', err);
                    }
                  }}
                >
                  {(() => {
                    const cellEntries = entries.filter(
                      (entry) =>
                        entry.day === day.iso &&
                        (entry.mealType ?? '') === meal.key,
                    );
                    return (
                      <div className="h-full">
                        {cellEntries.map((entry) => (
                          <div key={entry.id}>{renderEntry(entry)}</div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center border-t px-4 py-3 text-sm text-muted-foreground">
          <Spinner className="mr-2 size-4" /> Loading plan…
        </div>
      ) : null}
    </section>
  );
};

export { PlannerGrid };
