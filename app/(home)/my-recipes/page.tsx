'use client';

import RecipeForm from '@/components/Recipe/RecipeForm';
import RecipeList from '@/components/Recipe/RecipeList';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Recipe } from '@/lib/types/recipe';
import { useState } from 'react';
import { SignInPrompt } from '@/components/Auth/SignInPrompt';
import { useRecipeFilters } from '@/components/Recipe/useRecipeFilters';
import { RecipeFilterBar } from '@/components/Recipe/RecipeFilterBar';

const MyRecipesPage = () => {
  const { user, loading } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [closeSignal, setCloseSignal] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const filters = useRecipeFilters();

  const handleSuccess = () => {
    setRefreshKey((key) => key + 1);
    setShowForm(false);
    setSelectedRecipe(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedRecipe(null);
  };

  if (loading) {
    return (
      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Spinner className="size-6" />
          <span className="ml-2">Loading…</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My recipes</h1>
            <p className="text-muted-foreground">
              View and edit your own recipes.
            </p>
          </div>
        </div>
        <SignInPrompt
          title="Please log in first to proceed."
          message="Sign in to view and manage your recipes."
        />
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My recipes</h1>
          <p className="text-muted-foreground">
            View and edit your own recipes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              if (showForm) {
                setCloseSignal((s) => s + 1);
              } else {
                setSelectedRecipe(null);
                setShowForm(true);
              }
            }}
          >
            {showForm ? 'Close' : 'Add recipe'}
          </Button>
        </div>
      </div>

      {showForm ? (
        <RecipeForm
          mode={selectedRecipe ? 'edit' : 'create'}
          initialData={selectedRecipe || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          closeSignal={closeSignal}
        />
      ) : null}

      <div className="space-y-4">
        <RecipeFilterBar
          search={filters.search}
          onSearchChange={filters.setSearch}
          allowFavorite
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
        />

        <RecipeList
          refreshKey={refreshKey}
          endpoint="/recipes/mine"
          includeDrafts
          allowEdit
          allowFavorite
          allowDelete
          currentUserId={user?.id}
          onDeleted={handleSuccess}
          onEdit={(recipe) => {
            setSelectedRecipe(recipe);
            setShowForm(true);
          }}
          filters={filters}
        />
      </div>
    </main>
  );
};

export default MyRecipesPage;
