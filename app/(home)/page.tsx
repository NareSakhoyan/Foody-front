'use client';
import Header from '@/components/Header';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import RecipeList from '@/components/Recipe/RecipeList';
import RecipeForm from '@/components/Recipe/RecipeForm';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

const HomePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [closeSignal, setCloseSignal] = useState(0);
  const { user, loading } = useCurrentUser();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );

  const handleCreated = () => {
    setRefreshKey((key) => key + 1);
    setShowForm(false);
  };

  return (
    <div>
      <Header />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
        <Sidebar />
        <main className="flex-1 space-y-6">
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
          <RecipeList
            refreshKey={refreshKey}
            allowFavorite={!!user}
            allowEdit={false}
            allowDelete={false}
            currentUserId={user?.id}
          />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
