'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import RecipeForm from '@/components/Recipe/RecipeForm';
import type { Recipe } from '@/lib/types/recipe';
import { getTagKey, getTagLabel } from '@/lib/utils/tags';
import { fetchRecipe, favoriteRecipe } from '@/lib/api/recipes';
import { useApi } from '@/hooks/useApi';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Heart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const RecipeDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { callApi } = useApi();
  const { user } = useCurrentUser();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!params?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecipe(callApi, params.id);
        setRecipe(data);
      } catch (err) {
        console.error('Failed to load recipe', err);
        const message = 'Could not load recipe.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    void loadRecipe();
  }, [callApi, params?.id]);

  const handleFavoriteToggle = async () => {
    if (!recipe) return;
    setFavoriteLoading(true);
    const nextState = !recipe.isFavorite;
    try {
      await favoriteRecipe(callApi, recipe.id, nextState);
      setRecipe({ ...recipe, isFavorite: nextState });
      toast.success(
        nextState ? 'Added to favorites.' : 'Removed from favorites.',
      );
    } catch (err) {
      toast.error('Failed to update favorite. Please try again.');
      console.error('Failed to update favorite', err);
      setError('Failed to update favorite. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const canEdit = useMemo(() => Boolean(user), [user]);
  const handleEditSuccess = (updated: Recipe) => {
    setRecipe(updated);
    setEditing(false);
  };
  const handleEditCancel = () => setEditing(false);

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner className="size-5" />
            Loading recipe…
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {recipe && !editing ? (
          <article className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold">{recipe.name}</h1>
                <p className="text-muted-foreground">
                  {recipe.shortDescription || 'No description provided.'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {recipe.tags?.map((tag, idx) => {
                    const label = getTagLabel(tag);
                    if (!label) return null;
                    return (
                      <Badge key={getTagKey(tag, idx)} variant="outline">
                        #{label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="cursor-pointer"
                  >
                    Edit
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={recipe.isFavorite ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className="cursor-pointer"
                >
                  <Heart
                    className="size-4"
                    fill={recipe.isFavorite ? 'currentColor' : 'none'}
                  />
                  {recipe.isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
              </div>
            </div>

            {recipe.imageUrl ? (
              <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {recipe.prepTimeMinutes ? (
                <Badge variant="outline">
                  Prep: {recipe.prepTimeMinutes} min
                </Badge>
              ) : null}
              {recipe.cookTimeMinutes ? (
                <Badge variant="outline">
                  Cook: {recipe.cookTimeMinutes} min
                </Badge>
              ) : null}
              {recipe.servings ? (
                <Badge variant="secondary">Serves {recipe.servings}</Badge>
              ) : null}
            </div>

            {recipe.prepDescription ? (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Preparation</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {recipe.prepDescription}
                </p>
              </section>
            ) : null}

            {recipe.cookDescription ? (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Cooking</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {recipe.cookDescription}
                </p>
              </section>
            ) : null}

            {recipe.ingredients?.length ? (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Ingredients</h2>
                <ul className="space-y-1 text-muted-foreground">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={`${ing.name}-${idx}`}>
                      {ing.quantity} {ing.measureUnit} {ing.name}
                      {ing.note ? ` — ${ing.note}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {recipe.spices?.length ? (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold">Spices</h2>
                <ul className="space-y-1 text-muted-foreground">
                  {recipe.spices.map((spice, idx) => (
                    <li key={`${spice.name || 'spice'}-${idx}`}>
                      {spice.name}
                      {spice.note ? ` — ${spice.note}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        ) : null}
        {recipe && editing ? (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <RecipeForm
              mode="edit"
              initialData={recipe}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RecipeDetailPage;
