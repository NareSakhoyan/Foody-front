'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Recipe } from '@/lib/types/recipe';
import {
  deleteRecipe,
  favoriteRecipe,
  fetchRecipes,
  fetchRecipeTags,
} from '@/lib/api/recipes';
import { toast } from 'sonner';
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
import { RecipeFilters } from './RecipeFilters';
import { RecipeCard } from './RecipeCard';
import { useApi } from '@/hooks/useApi';
import { getTagLabel } from '@/lib/utils/tags';
import { cn } from '@/lib/utils';

type RecipeListProps = {
  refreshKey?: number;
  endpoint?: string;
  includeDrafts?: boolean;
  allowEdit?: boolean;
  onEdit?: (recipe: Recipe) => void;
  allowDelete?: boolean;
  allowFavorite?: boolean;
  onDeleted?: () => void;
  currentUserId?: string | number;
  draggableCards?: boolean;
  onRecipeDragStart?: (
    recipe: Recipe,
    event: React.DragEvent<HTMLElement>,
  ) => void;
  onRecipeDragEnd?: (
    recipe: Recipe,
    event: React.DragEvent<HTMLElement>,
  ) => void;
  showPagination?: boolean;
  horizontalScroll?: boolean;
  gridClassName?: string;
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
  currentUserId,
  draggableCards = false,
  onRecipeDragStart,
  onRecipeDragEnd,
  showPagination = true,
  horizontalScroll = false,
  gridClassName,
}: RecipeListProps) => {
  const { callApi } = useApi();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [tagChoice, setTagChoice] = useState<string>('');
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const normalizedUserId =
    currentUserId === null || currentUserId === undefined
      ? null
      : String(currentUserId);

  const tagParam = useMemo(() => {
    const tags = Array.from(selectedTags)
      .map((t) => t.trim())
      .filter(Boolean);
    return tags.length ? tags.join(',') : undefined;
  }, [selectedTags]);

  // Initialize state from URL params
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const tag = searchParams.get('tag') ?? '';
    const tags = tag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const fav = searchParams.get('fav') === '1';
    const pageParam = Number(searchParams.get('page')) || 1;
    setSearch(q);
    setDebouncedSearch(q);
    setOnlyFavorites(fav);
    setSelectedTags(tags.length ? new Set(tags) : new Set());
    setPage(pageParam);
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (tagParam) params.set('tag', tagParam);
    if (onlyFavorites) params.set('fav', '1');
    if (page > 1) params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, onlyFavorites, page, pathname, router, tagParam]);

  useEffect(() => {
    let isMounted = true;

    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      const path = onlyFavorites ? '/recipes/favorites' : endpoint;
      try {
        const data = await fetchRecipes(callApi, path, {
          page,
          pageSize,
          q: debouncedSearch || undefined,
          tag: tagParam,
          status: includeDrafts ? undefined : 'published',
        });
        if (!isMounted) return;
        setRecipes(data.items);
        setTotal(data.total);
      } catch (err) {
        if (!isMounted) return;
        const message = 'Failed to load recipes. Please try again.';
        setError(message);
        toast.error(message);
        console.error('Error fetching recipes', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadRecipes();
    return () => {
      isMounted = false;
    };
  }, [
    callApi,
    endpoint,
    includeDrafts,
    onlyFavorites,
    page,
    pageSize,
    refreshKey,
    debouncedSearch,
    tagParam,
  ]);

  useEffect(() => {
    let isMounted = true;
    const loadTags = async () => {
      try {
        const tags = await fetchRecipeTags(callApi);
        if (!isMounted) return;
        const normalized = (tags || [])
          .map((tag) => getTagLabel(tag))
          .map((t) => t.trim())
          .filter((t) => t.length);
        setAvailableTags(Array.from(new Set(normalized)));
      } catch (err) {
        toast.error('Failed to load tags.');
        console.error('Failed to load tags', err);
      }
    };
    void loadTags();
    return () => {
      isMounted = false;
    };
  }, [callApi]);

  const { quickTags } = useMemo(() => {
    const normalized = availableTags.map((t) => t.trim()).filter(Boolean);
    const unique = Array.from(new Set(normalized)).sort((a, b) =>
      a.localeCompare(b),
    );
    const quickTags = unique.slice(0, 10);
    return { quickTags };
  }, [availableTags]);

  const hasAny = useMemo(() => total > 0, [total]);

  const availableTagChoices = useMemo(
    () =>
      availableTags.filter(
        (t) => !selectedTags.has(t) && !quickTags.includes(t),
      ),
    [availableTags, quickTags, selectedTags],
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
    setPage(1);
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
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!allowDelete || !deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteRecipe(callApi, deleteTarget.id);
      setRecipes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      onDeleted?.();
      toast.success('Recipe deleted.');
    } catch (err) {
      toast.error('Failed to delete recipe. Please try again.');
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
      toast.success(
        nextState ? 'Added to favorites.' : 'Removed from favorites.',
      );
    } catch (err) {
      toast.error('Failed to update favorites. Please try again.');
      console.error('Failed to toggle favorite', err);
      setError('Failed to update favorites. Please try again.');
    } finally {
      setFavoriteLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <RecipeFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        allowFavorite={allowFavorite}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={() => {
          setOnlyFavorites((prev) => !prev);
          setPage(1);
        }}
        selectedTags={selectedTags}
        quickTags={quickTags}
        onToggleTag={toggleTag}
        availableTagChoices={availableTagChoices}
        tagChoice={tagChoice}
        onTagChoiceChange={setTagChoice}
        showTagPicker={showTagPicker}
        onToggleTagPicker={(open) => setShowTagPicker(open)}
        onAddTag={addTagFilter}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : loading ? (
        <div
          className={cn(
            horizontalScroll
              ? 'grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-4 overflow-x-auto pb-2 no-scrollbar sm:auto-cols-[minmax(280px,340px)]'
              : 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3',
            gridClassName,
          )}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="flex h-full min-h-80 flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs"
            >
              <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : !hasAny ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          No recipes yet. Add your first one to see it here.
        </div>
      ) : (
        <>
          <div
            className={cn(
              horizontalScroll
                ? 'grid grid-flow-col auto-cols-[minmax(260px,320px)] gap-4 overflow-x-auto pb-2 no-scrollbar sm:auto-cols-[minmax(280px,340px)]'
                : 'grid gap-8 pt-4 sm:grid-cols-2 lg:grid-cols-3',
              gridClassName,
            )}
          >
            {recipes.map((recipe) => {
              const isOwner =
                normalizedUserId !== null &&
                String(recipe.authorId) === normalizedUserId;
              const canEditRecipe = allowEdit && isOwner;
              const canDeleteRecipe = allowDelete && isOwner;

              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  allowFavorite={allowFavorite}
                  favoriteLoading={favoriteLoading === recipe.id}
                  onToggleFavorite={handleFavoriteToggle}
                  allowEdit={canEditRecipe}
                  onEdit={canEditRecipe ? onEdit : undefined}
                  allowDelete={canDeleteRecipe}
                  onDelete={
                    canDeleteRecipe
                      ? (r) => {
                          setDeleteTarget(r);
                          setDeleteDialogOpen(true);
                        }
                      : undefined
                  }
                  draggable={draggableCards}
                  onDragStart={
                    draggableCards
                      ? (event) => onRecipeDragStart?.(recipe, event)
                      : undefined
                  }
                  onDragEnd={
                    draggableCards
                      ? (event) => onRecipeDragEnd?.(recipe, event)
                      : undefined
                  }
                />
              );
            })}
          </div>
          {showPagination && totalPages > 1 ? (
            <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
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
