'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RecipeForm from '@/components/Recipe/RecipeForm';
import RecipeList from '@/components/Recipe/RecipeList';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Recipe } from '@/lib/types/recipe';
import { useState } from 'react';

const MyRecipesPage = () => {
  const { user, loading } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [closeSignal, setCloseSignal] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const handleSuccess = () => {
    setRefreshKey((key) => key + 1);
    setShowForm(false);
    setSelectedRecipe(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedRecipe(null);
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">My recipes</h1>
              <p className="text-muted-foreground">
                View and edit your own recipes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
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
              ) : null}
            </div>
          </div>

          {!user ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
              Sign in to view and manage your recipes.
            </div>
          ) : null}

          {showForm && user ? (
            <RecipeForm
              mode={selectedRecipe ? 'edit' : 'create'}
              initialData={selectedRecipe || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              closeSignal={closeSignal}
            />
          ) : null}

          {user ? (
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
            />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default MyRecipesPage;
