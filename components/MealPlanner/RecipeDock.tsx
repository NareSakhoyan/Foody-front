import type React from 'react';
import { useCallback } from 'react';
import RecipeList from '@/components/Recipe/RecipeList';
import type { Recipe } from '@/lib/types/recipe';

type RecipeDockProps = {
  onAddRecipe?: (recipe: Recipe) => void;
};

const RecipeDock = ({ onAddRecipe }: RecipeDockProps) => {
  const handleDragStart = useCallback(
    (recipe: Recipe, event: React.DragEvent<HTMLElement>) => {
      try {
        event.dataTransfer.setData(
          'application/json',
          JSON.stringify({ recipeId: recipe.id }),
        );
        event.dataTransfer.effectAllowed = 'move';
      } catch (err) {
        console.error('Failed to set drag data', err);
      }
    },
    [],
  );

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Recipe dock</h3>
          <p className="text-sm text-muted-foreground">
            Keep a backlog of recipes to drag into the plan. Filter, tab between
            meals, and search.
          </p>
        </div>
      </div>

      <div className="pb-2">
        <RecipeList
          allowEdit={false}
          allowDelete={false}
          draggableCards
          horizontalScroll
          gridClassName="grid-cols-none! grid-flow-col auto-cols-[minmax(260px,320px)] gap-4 overflow-x-auto pb-2 no-scrollbar sm:auto-cols-[minmax(280px,340px)]"
          onRecipeDragStart={handleDragStart}
          onRecipeDragEnd={() => {}}
          showPagination={false}
        />
      </div>
    </section>
  );
};

export { RecipeDock };
