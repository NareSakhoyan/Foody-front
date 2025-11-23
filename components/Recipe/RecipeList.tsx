'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Recipe } from '@/lib/types/recipe';
import {
  deleteRecipe,
  favoriteRecipe,
  fetchRecipes,
} from '@/lib/api/recipes';
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
import { RecipeFilters, type SortOption } from './RecipeFilters';
import { RecipeCard } from './RecipeCard';
import { useApi } from '@/hooks/useApi';

type RecipeListProps = {
  refreshKey?: number;
  endpoint?: string;
  includeDrafts?: boolean;
  allowEdit?: boolean;
  onEdit?: (recipe: Recipe) => void;
  allowDelete?: boolean;
  allowFavorite?: boolean;
  onDeleted?: () => void;
};

const RecipeList = ({
  refreshKey = 0,
  endpoint = '/recipes',
  includeDrafts = false,
  allowEdit = false,
  onEdit,
  allowDelete = false,
  allowFavorite = false,
  onDeleted,
}: RecipeListProps) => {
  const { callApi } = useApi();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [tagChoice, setTagChoice] = useState<string>('');
  const [showTagPicker, setShowTagPicker] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecipes(callApi, endpoint);
        if (!isMounted) return;
        setRecipes(data);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load recipes. Please try again.');
        console.error('Error fetching recipes', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecipes();
    return () => {
      isMounted = false;
    };
  }, [callApi, endpoint, refreshKey]);

  const visibleRecipes = useMemo(
    () => (includeDrafts ? recipes : recipes.filter((r) => r.status !== 'draft')),
    [includeDrafts, recipes],
  );

  const { allTags, quickTags } = useMemo(() => {
    const counts = new Map<string, number>();
    visibleRecipes.forEach((r) =>
      r.tags?.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
    );
    const sortedByCount = Array.from(counts.entries()).sort((a, b) => {
      if (a[1] === b[1]) return a[0].localeCompare(b[0]);
      return b[1] - a[1];
    });
    const allTags = Array.from(counts.keys()).sort((a, b) =>
      a.localeCompare(b),
    );
    const quickTags = sortedByCount.slice(0, 10).map(([tag]) => tag);
    return { allTags, quickTags };
  }, [visibleRecipes]);

  const filteredRecipes = useMemo(() => {
    const term = search.trim().toLowerCase();
    const tags = Array.from(selectedTags);
    const filtered = visibleRecipes.filter((r) => {
      if (onlyFavorites && !r.isFavorite) return false;
      if (term) {
        const inText =
          r.name.toLowerCase().includes(term) ||
          (r.shortDescription ?? '').toLowerCase().includes(term) ||
          r.tags?.some((t) => t.toLowerCase().includes(term));
        if (!inText) return false;
      }
      if (tags.length && !tags.every((t) => r.tags?.includes(t))) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'prep':
          return (a.prepTimeMinutes ?? Infinity) - (b.prepTimeMinutes ?? Infinity);
        case 'cook':
          return (a.cookTimeMinutes ?? Infinity) - (b.cookTimeMinutes ?? Infinity);
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
  }, [onlyFavorites, search, selectedTags, sortBy, visibleRecipes]);

  const hasFiltered = useMemo(
    () => filteredRecipes.length > 0,
    [filteredRecipes],
  );
  const hasAny = useMemo(() => visibleRecipes.length > 0, [visibleRecipes]);

  const availableTagChoices = useMemo(
    () => allTags.filter((t) => !selectedTags.has(t) && !quickTags.includes(t)),
    [allTags, quickTags, selectedTags],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTags(new Set());
    setOnlyFavorites(false);
    setSortBy('recent');
    setTagChoice('');
  };

  useEffect(() => {
    if (!availableTagChoices.length) {
      setTagChoice('');
      return;
    }
    if (!tagChoice || !availableTagChoices.includes(tagChoice)) {
      setTagChoice(availableTagChoices[0]);
    }
  }, [availableTagChoices, tagChoice]);

  const addTagFilter = (value?: string) => {
    const tagToAdd = value ?? tagChoice;
    if (!tagToAdd) return;
    setSelectedTags((prev) => new Set(prev).add(tagToAdd));
    setTagChoice('');
    setShowTagPicker(false);
  };

  const handleDeleteConfirm = async () => {
    if (!allowDelete || !deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteRecipe(callApi, deleteTarget.id);
      setRecipes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      onDeleted?.();
    } catch (err) {
      console.error('Failed to delete recipe', err);
      setError('Failed to delete recipe. Please try again.');
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleFavoriteToggle = async (recipe: Recipe) => {
    if (!allowFavorite) return;
    setFavoriteLoading(recipe.id);
    const nextState = !recipe.isFavorite;
    try {
      await favoriteRecipe(callApi, recipe.id, nextState);
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipe.id ? { ...r, isFavorite: nextState } : r,
        ),
      );
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      setError('Failed to update favorites. Please try again.');
    } finally {
      setFavoriteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RecipeFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        allowFavorite={allowFavorite}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={() => setOnlyFavorites((prev) => !prev)}
        selectedTags={selectedTags}
        quickTags={quickTags}
        onToggleTag={toggleTag}
        availableTagChoices={availableTagChoices}
        tagChoice={tagChoice}
        onTagChoiceChange={setTagChoice}
        showTagPicker={showTagPicker}
        onToggleTagPicker={(open) => setShowTagPicker(open)}
        onAddTag={addTagFilter}
        recipes={visibleRecipes}
      />

      {!hasAny ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          No recipes yet. Add your first one to see it here.
        </div>
      ) : !hasFiltered ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          No recipes match your filters.
          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              allowFavorite={allowFavorite}
              favoriteLoading={favoriteLoading === recipe.id}
              onToggleFavorite={handleFavoriteToggle}
              allowEdit={allowEdit}
              onEdit={onEdit}
              allowDelete={allowDelete}
              onDelete={(r) => {
                setDeleteTarget(r);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {deleteTarget?.name || 'this recipe'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              disabled={deletingId !== null}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecipeList;
