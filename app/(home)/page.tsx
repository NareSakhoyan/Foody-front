'use client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import RecipeList from '@/components/Recipe/RecipeList';
import RecipeForm from '@/components/Recipe/RecipeForm';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useApi } from '@/hooks/useApi';
import { createShoppingItem } from '@/lib/api/shopping-list';
import { toast } from 'sonner';
import { fetchShoppingItems } from '@/lib/api/shopping-list';
import { RecipeFilterBar } from '@/components/Recipe/RecipeFilterBar';
import { useRecipeFilters } from '@/components/Recipe/useRecipeFilters';
import { useSearchHistory } from '@/hooks/useSearchHistory';

const HomePage = () => {
  const { callApi } = useApi();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [closeSignal, setCloseSignal] = useState(0);
  const [shoppingNames, setShoppingNames] = useState<Set<string>>(
    () => new Set(),
  );
  const { user, loading } = useCurrentUser();
  const filters = useRecipeFilters();
  const {
    items: searchHistory,
    loading: searchHistoryLoading,
    refresh: refreshSearchHistory,
    remove: removeSearchHistory,
    clear: clearSearchHistory,
  } = useSearchHistory({ enabled: !!user });

  const handleCreated = () => {
    setRefreshKey((key) => key + 1);
    setShowForm(false);
  };

  useEffect(() => {
    const loadShopping = async () => {
      try {
        const items = await fetchShoppingItems(callApi);
        const names = new Set(
          items
            .map((item) => item.name?.toLowerCase().trim())
            .filter((n): n is string => Boolean(n)),
        );
        setShoppingNames(names);
      } catch (err) {
        console.error('Failed to load shopping list for matches', err);
      }
    };
    void loadShopping();
  }, [callApi]);

  const handleAddMissingIngredient = async (name: string) => {
    if (!name?.trim()) return;
    try {
      await createShoppingItem(callApi, { name: name.trim() });
      toast.success(`Added ${name} to shopping list`);
      setShoppingNames((prev) => {
        const next = new Set(prev);
        next.add(name.toLowerCase().trim());
        return next;
      });
    } catch (err) {
      console.error('Failed to add shopping item', err);
      toast.error('Could not add to shopping list.');
    }
  };

  return (
    <main className="flex-1 min-w-0 space-y-6">
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Spinner className="size-6" />
          <span className="ml-2">Loading…</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Recipes</h1>
              <p className="text-muted-foreground">
                Browse and discover community recipes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Button
                  onClick={() => {
                    if (showForm) {
                      setCloseSignal((s) => s + 1);
                    } else {
                      setShowForm(true);
                    }
                  }}
                >
                  {showForm ? 'Close' : 'Add recipe'}
                </Button>
              ) : null}
            </div>
          </div>
          {showForm && user ? (
            <RecipeForm
              mode="create"
              onSuccess={handleCreated}
              onCancel={() => setShowForm(false)}
              closeSignal={closeSignal}
            />
          ) : null}
          <div className="space-y-4">
            <RecipeFilterBar
              search={filters.search}
              onSearchChange={filters.setSearch}
              allowFavorite={!!user}
              onlyFavorites={filters.onlyFavorites}
              onToggleFavorites={() =>
                filters.setOnlyFavorites((prev) => !prev)
              }
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
              searchHistoryItems={user ? searchHistory : undefined}
              searchHistoryLoading={user ? searchHistoryLoading : undefined}
              onSearchHistoryRefresh={user ? refreshSearchHistory : undefined}
              onSearchHistorySelect={
                user ? filters.applySearchHistory : undefined
              }
              onSearchHistoryDelete={user ? removeSearchHistory : undefined}
              onSearchHistoryClear={user ? clearSearchHistory : undefined}
            />
            <RecipeList
              refreshKey={refreshKey}
              endpoint="/recipes/recommendations"
              allowFavorite={!!user}
              allowEdit={false}
              allowDelete={false}
              currentUserId={user?.id}
              onAddMissingIngredient={handleAddMissingIngredient}
              shoppingNames={shoppingNames}
              filters={filters}
            />
          </div>
        </>
      )}
    </main>
  );
};

export default HomePage;
