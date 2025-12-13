'use client';

import type React from 'react';
import { useCallback } from 'react';
import RecipeList from '@/components/Recipe/RecipeList';
import type { Recipe } from '@/lib/types/recipe';
import { useRecipeFilters } from '@/components/Recipe/useRecipeFilters';
import { RecipeFilterBar } from '@/components/Recipe/RecipeFilterBar';

type RecipeDockProps = {
  onAddRecipe?: (recipe: Recipe) => void;
  recipesById?: Record<string, Recipe | undefined>;
  setRecipesById?: React.Dispatch<
    React.SetStateAction<Record<string, Recipe | undefined>>
  >;
  loading?: boolean;
};

const RecipeDock = ({ onAddRecipe }: RecipeDockProps) => {
  const filters = useRecipeFilters({ syncWithUrl: false });

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
            Backlog of recipes to drag into the plan. Filter, tab between meals,
            and search.
          </p>
        </div>
      </div>

      <div className="space-y-4 pb-2">
        <RecipeFilterBar
          search={filters.search}
          onSearchChange={filters.setSearch}
          allowFavorite={false}
          onlyFavorites={filters.onlyFavorites}
          onToggleFavorites={() => filters.setOnlyFavorites((prev) => !prev)}
          selectedTags={filters.selectedTags}
          quickTags={filters.quickTags}
          onToggleTag={filters.toggleTag}
          availableTagChoices={filters.availableTagChoices}
          tagChoice={filters.tagChoice}
          onTagChoiceChange={filters.setTagChoice}
          showTagPicker={filters.showTagPicker}
          onToggleTagPicker={filters.setShowTagPicker}
          onAddTag={filters.addTagFilter}
          maxPrepTime={filters.maxPrepTime}
          onMaxPrepTimeChange={filters.setMaxPrepTime}
          maxCookTime={filters.maxCookTime}
          onMaxCookTimeChange={filters.setMaxCookTime}
          maxTotalTime={filters.maxTotalTime}
          onMaxTotalTimeChange={filters.setMaxTotalTime}
          includeIngredients={filters.includeIngredients}
          excludeIngredients={filters.excludeIngredients}
          onIncludeIngredientAdd={filters.addIncludeIngredient}
          onExcludeIngredientAdd={filters.addExcludeIngredient}
          onIncludeIngredientRemove={filters.removeIncludeIngredient}
          onExcludeIngredientRemove={filters.removeExcludeIngredient}
          ingredientSuggestions={filters.ingredientSuggestions}
          maxMissingIngredients={filters.maxMissingIngredients}
          onMaxMissingIngredientsChange={filters.setMaxMissingIngredients}
          minMatchPercent={filters.minMatchPercent}
          onMinMatchPercentChange={filters.setMinMatchPercent}
          onApply={filters.applyFilters}
        />

        <RecipeList
          allowEdit={false}
          allowDelete={false}
          draggableCards
          horizontalScroll
          onRecipeDragStart={handleDragStart}
          onRecipeDragEnd={() => {}}
          showPagination={false}
          filters={filters}
          favoriteFirst
          showFavoritesMatchData={false}
        />
      </div>
    </section>
  );
};

export { RecipeDock };
