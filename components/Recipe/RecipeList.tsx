'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Recipe } from '@/lib/types/recipe';
import { deleteRecipe, favoriteRecipe, fetchRecipes } from '@/lib/api/recipes';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import type { RecipeFiltersState } from './useRecipeFilters';
import { RecipeListSkeleton } from './RecipeListSkeleton';
import { RecipeEmptyState } from './RecipeEmptyState';
import { RecipePagination } from './RecipePagination';
import { RecipeDeleteDialog } from './RecipeDeleteDialog';
import { RecipeCardsGrid } from './RecipeCardsGrid';

type RecipeListProps = {
  presetRecipes?: Recipe[];
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
  onAddMissingIngredient?: (name: string) => void | Promise<void>;
  shoppingNames?: Set<string>;
  showPagination?: boolean;
  horizontalScroll?: boolean;
  gridClassName?: string;
  showMatchData?: boolean;
  favoriteFirst?: boolean;
  showFavoritesMatchData?: boolean;
  filters: RecipeFiltersState;
};

const RecipeList = ({
  presetRecipes,
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
  onAddMissingIngredient,
  shoppingNames,
  showPagination = true,
  horizontalScroll = false,
  gridClassName,
  showMatchData = true,
  favoriteFirst = false,
  showFavoritesMatchData = true,
  filters,
}: RecipeListProps) => {
  const orderByFavorite = (list: Recipe[]) => {
    if (!favoriteFirst) return list;
    return [...list].sort((a, b) => {
      const aFav = a.isFavorite ? 1 : 0;
      const bFav = b.isFavorite ? 1 : 0;
      if (aFav === bFav) return 0;
      return bFav - aFav;
    });
  };
  const { callApi } = useApi();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>(presetRecipes ?? []);
  const [loading, setLoading] = useState(!presetRecipes);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(presetRecipes?.length ?? 0);
  const normalizedUserId =
    currentUserId === null || currentUserId === undefined
      ? null
      : String(currentUserId);
  const usingPreset = Boolean(presetRecipes);

  useEffect(() => {
    if (!presetRecipes) return;
    const ordered = favoriteFirst
      ? orderByFavorite(presetRecipes)
      : presetRecipes;
    setRecipes(ordered);
    setTotal(ordered.length);
    setLoading(false);
    setError(null);
  }, [favoriteFirst, presetRecipes]);

  useEffect(() => {
    if (usingPreset || !filters.syncWithUrl) return;
    const pageParam = Number(searchParams.get('page')) || 1;
    setPage(pageParam);
  }, [filters.syncWithUrl, searchParams, usingPreset]);

  useEffect(() => {
    if (usingPreset) return;
    let isMounted = true;

    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      const path = filters.onlyFavorites ? '/recipes/favorites' : endpoint;
      try {
        const query = {
          page,
          pageSize,
          q: filters.debouncedSearch || undefined,
          tag: filters.tagParam,
          status: includeDrafts ? undefined : 'published',
        } as const;

        if (favoriteFirst && !filters.onlyFavorites && page === 1) {
          const [favoriteRes, data] = await Promise.all([
            fetchRecipes(callApi, '/recipes/favorites', query),
            fetchRecipes(callApi, path, query),
          ]);
          if (!isMounted) return;
          const favItems = favoriteRes.items ?? [];
          const favIds = new Set(favItems.map((r) => r.id));
          const rest = (data.items ?? []).filter((r) => !favIds.has(r.id));
          const combined = [...favItems, ...rest];
          setRecipes(combined);
          setTotal(data.total);
          return;
        }

        const data = await fetchRecipes(callApi, path, query);
        if (!isMounted) return;
        const ordered = favoriteFirst
          ? orderByFavorite(data.items)
          : data.items;
        setRecipes(ordered);
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
    filters.debouncedSearch,
    filters.onlyFavorites,
    filters.tagParam,
    favoriteFirst,
    page,
    pageSize,
    usingPreset,
    refreshKey,
  ]);

  const hasAny = recipes.length > 0;

  const paramsFilterKey = useMemo(() => {
    if (!filters.syncWithUrl) return '';
    const q = searchParams.get('q') ?? '';
    const tag = searchParams.get('tag') ?? '';
    const fav = searchParams.get('fav') === '1';
    return `${q}||${tag}||${fav ? '1' : '0'}`;
  }, [filters.syncWithUrl, searchParams]);

  const currentFilterKey = useMemo(
    () =>
      `${filters.debouncedSearch ?? ''}||${filters.tagParam ?? ''}||${filters.onlyFavorites ? '1' : '0'}`,
    [filters.debouncedSearch, filters.onlyFavorites, filters.tagParam],
  );

  useEffect(() => {
    if (usingPreset) return;
    if (filters.syncWithUrl && paramsFilterKey === currentFilterKey) return;
    setPage(1);
  }, [
    currentFilterKey,
    filters.selectedTagsKey,
    filters.syncWithUrl,
    paramsFilterKey,
    usingPreset,
  ]);

  useEffect(() => {
    if (usingPreset || !filters.syncWithUrl) return;
    const params = new URLSearchParams();
    if (filters.debouncedSearch) params.set('q', filters.debouncedSearch);
    if (filters.tagParam) params.set('tag', filters.tagParam);
    if (filters.onlyFavorites) params.set('fav', '1');
    if (page > 1) params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    filters.debouncedSearch,
    filters.onlyFavorites,
    filters.syncWithUrl,
    filters.tagParam,
    page,
    pathname,
    router,
    usingPreset,
  ]);

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
    let removedFromFavorites = false;
    try {
      await favoriteRecipe(callApi, recipe.id, nextState);
      setRecipes((prev) => {
        if (filters.onlyFavorites && !nextState) {
          const updated = prev.filter((r) => r.id !== recipe.id);
          removedFromFavorites = prev.length !== updated.length;
          if (updated.length === 0 && page > 1) {
            setPage((p) => Math.max(1, p - 1));
          }
          return favoriteFirst ? orderByFavorite(updated) : updated;
        }
        const updated = prev.map((r) =>
          r.id === recipe.id ? { ...r, isFavorite: nextState } : r,
        );
        return favoriteFirst ? orderByFavorite(updated) : updated;
      });
      if (filters.onlyFavorites && !nextState && removedFromFavorites) {
        setTotal((t) => Math.max(0, t - 1));
      }
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

  const totalPages = Math.max(
    1,
    Math.ceil((usingPreset ? recipes.length : total) / pageSize),
  );

  const showPaginationControls = showPagination && totalPages > 1;

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : loading ? (
        <RecipeListSkeleton
          horizontalScroll={horizontalScroll}
          gridClassName={gridClassName}
        />
      ) : !hasAny ? (
        <RecipeEmptyState />
      ) : (
        <>
          <RecipeCardsGrid
            recipes={recipes}
            normalizedUserId={normalizedUserId}
            allowFavorite={allowFavorite}
            favoriteLoadingId={favoriteLoading}
            onToggleFavorite={handleFavoriteToggle}
            onAddMissingIngredient={onAddMissingIngredient}
            shoppingNames={shoppingNames}
            showMatchData={showMatchData}
            showFavoritesMatchData={showFavoritesMatchData}
            allowEdit={allowEdit}
            onEdit={onEdit}
            allowDelete={allowDelete}
            onDeleteClick={(recipe) => {
              setDeleteTarget(recipe);
              setDeleteDialogOpen(true);
            }}
            draggableCards={draggableCards}
            onRecipeDragStart={onRecipeDragStart}
            onRecipeDragEnd={onRecipeDragEnd}
            horizontalScroll={horizontalScroll}
            gridClassName={gridClassName}
          />
          {showPaginationControls ? (
            <RecipePagination
              page={page}
              totalPages={totalPages}
              onPageChange={(next) => setPage(next)}
            />
          ) : null}
        </>
      )}
      <RecipeDeleteDialog
        open={deleteDialogOpen}
        deleting={deletingId !== null}
        targetName={deleteTarget?.name}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
};

export default RecipeList;
