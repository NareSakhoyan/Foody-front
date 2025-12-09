'use client';

import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTagKey, getTagLabel } from '@/lib/utils/tags';
import { CheckCircle2 } from 'lucide-react';
import type { Recipe } from '@/lib/types/recipe';

type RecipeCardProps = {
  recipe: Recipe;
  allowFavorite?: boolean;
  favoriteLoading?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
  onAddMissingIngredient?: (name: string) => void | Promise<void>;
  shoppingNames?: Set<string>;
  allowEdit?: boolean;
  onEdit?: (recipe: Recipe) => void;
  allowDelete?: boolean;
  onDelete?: (recipe: Recipe) => void;
  className?: string;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLElement>, recipe: Recipe) => void;
  onDragEnd?: (event: React.DragEvent<HTMLElement>, recipe: Recipe) => void;
};

export const RecipeCard = ({
  recipe,
  allowFavorite,
  favoriteLoading,
  onToggleFavorite,
  onAddMissingIngredient,
  shoppingNames,
  allowEdit,
  onEdit,
  allowDelete,
  onDelete,
  className,
  draggable,
  onDragStart,
  onDragEnd,
}: RecipeCardProps) => {
  const fallbackInitial = useMemo(
    () => (recipe.name?.[0] || 'R').toUpperCase(),
    [recipe.name],
  );
  const matchPercent =
    recipe.matchRatio !== undefined && recipe.matchRatio !== null
      ? Math.round(recipe.matchRatio * 100)
      : null;
  const matchedIngredients =
    recipe.matchedIngredients?.filter(Boolean) ?? ([] as string[]);
  const missingIngredients =
    recipe.missingIngredients?.filter(Boolean) ?? ([] as string[]);
  const [addedMissing, setAddedMissing] = useState<Set<string>>(
    () => new Set(),
  );
  const ingredientSummary = (recipe.ingredients ?? [])
    .map((item) => item.name)
    .filter(Boolean)
    .join(', ');
  const totalForMatch = matchedIngredients.length + missingIngredients.length;
  const computedMatchRatio =
    totalForMatch > 0 ? matchedIngredients.length / totalForMatch : null;
  const displayMatchPercent =
    computedMatchRatio !== null
      ? Math.round(computedMatchRatio * 100)
      : matchPercent;
  const matchBadgeClass = (() => {
    const pct = displayMatchPercent ?? 0;
    if (pct >= 90)
      return 'border-emerald-500/60 text-emerald-800 dark:text-emerald-200';
    if (pct >= 75) return 'border-lime-500/60 text-lime-800 dark:text-lime-200';
    if (pct >= 50)
      return 'border-amber-500/70 text-amber-800 dark:text-amber-200';
    if (pct >= 25)
      return 'border-orange-500/70 text-orange-800 dark:text-orange-200';
    return 'border-red-500/70 text-red-800 dark:text-red-200';
  })();
  const [addingMissing, setAddingMissing] = useState<string | null>(null);
  const hasMatchData =
    displayMatchPercent !== null ||
    matchedIngredients.length > 0 ||
    missingIngredients.length > 0;
  const matchSummary =
    displayMatchPercent !== null ? `Match ${displayMatchPercent}%` : null;

  return (
    <article
      className={cn(
        'group flex h-full min-h-[400px] flex-col rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md',
        className,
      )}
      draggable={draggable}
      onDragStart={(event) => onDragStart?.(event, recipe)}
      onDragEnd={(event) => onDragEnd?.(event, recipe)}
    >
      <div className="relative mb-3 h-48 w-full overflow-hidden rounded-lg bg-muted md:h-52">
        <Link
          href={`/recipes/${recipe.id}`}
          className="relative block h-full w-full"
        >
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-4xl font-semibold text-muted-foreground/70">
              {fallbackInitial}
            </div>
          )}
        </Link>
        {allowFavorite && onToggleFavorite ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(recipe);
            }}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:scale-105 cursor-pointer"
            aria-label={recipe.isFavorite ? 'Unfavorite' : 'Favorite'}
            disabled={favoriteLoading}
          >
            <Heart
              className="size-5"
              fill={recipe.isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/recipes/${recipe.id}`}>
            <h3 className="truncate text-lg font-semibold">{recipe.name}</h3>
          </Link>
          <Link href={`/recipes/${recipe.id}`}>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {recipe.shortDescription}
            </p>
          </Link>
        </div>
        <div className="flex flex-col items-end gap-2">
          {recipe.servings ? (
            <Badge variant="secondary" className="shrink-0 whitespace-nowrap">
              Serves {recipe.servings}
            </Badge>
          ) : null}
          {allowEdit && onEdit ? (
            <div className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe);
                }}
                aria-label="Edit recipe"
              >
                <Pencil className="size-4" />
              </Button>
              {allowDelete && onDelete ? (
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(recipe);
                  }}
                  aria-label="Delete recipe"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          ) : allowDelete && onDelete ? (
            <Button
              size="icon-sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe);
              }}
              aria-label="Delete recipe"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {hasMatchData ? (
          <div className="flex flex-wrap items-center gap-2">
            {matchSummary ? (
              <Badge variant="outline" className={matchBadgeClass}>
                {matchSummary}
              </Badge>
            ) : null}
          </div>
        ) : null}
        {recipe.prepTimeMinutes ? (
          <Badge variant="outline">Prep: {recipe.prepTimeMinutes} min</Badge>
        ) : null}
        {recipe.cookTimeMinutes ? (
          <Badge variant="outline">Cook: {recipe.cookTimeMinutes} min</Badge>
        ) : null}
        {recipe.tags?.slice(0, 4).map((tag, idx) => {
          const label = getTagLabel(tag);
          if (!label) return null;
          return (
            <Badge key={getTagKey(tag, idx)} variant="outline">
              #{label}
            </Badge>
          );
        })}
        {recipe.tags?.length > 4 ? (
          <Badge variant="outline">+{recipe.tags.length - 4} more</Badge>
        ) : null}
      </div>

      {recipe.ingredients?.length ? (
        <div className="mt-auto pt-3 space-y-1 text-sm">
          <p className="font-medium text-foreground">Ingredients</p>
          {ingredientSummary &&
          (displayMatchPercent === null || displayMatchPercent === 100) ? (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {ingredientSummary}
            </p>
          ) : null}
          {hasMatchData ? (
            <div className="space-y-2">
              {matchedIngredients.length && missingIngredients.length ? (
                <div className="space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Matched ({matchedIngredients.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedIngredients.map((ing, idx) => (
                      <Badge
                        key={`${ing}-${idx}`}
                        variant="outline"
                        className="border-emerald-400/60 text-emerald-800 dark:text-emerald-100"
                      >
                        {ing}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {missingIngredients.length ? (
                <div className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                  <div className="font-semibold text-amber-800 dark:text-amber-200">
                    Missing ({missingIngredients.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingIngredients.map((ing, idx) => {
                      const normalized = ing.toLowerCase().trim();
                      const isAlreadyInShopping =
                        (shoppingNames?.has(normalized) ?? false) ||
                        addedMissing.has(normalized);
                      if (!onAddMissingIngredient) {
                        return (
                          <Badge
                            key={`${ing}-${idx}`}
                            variant="outline"
                            className="border-amber-400/60 text-amber-800 dark:text-amber-100"
                          >
                            {ing}
                          </Badge>
                        );
                      }
                      return (
                        <button
                          key={`${ing}-${idx}`}
                          type="button"
                          className={cn(
                            'cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition flex items-center gap-1.5',
                            isAlreadyInShopping
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60',
                          )}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isAlreadyInShopping) return;
                            setAddingMissing(ing);
                            try {
                              await onAddMissingIngredient(ing);
                              setAddedMissing((prev) => {
                                const next = new Set(prev);
                                next.add(normalized);
                                return next;
                              });
                            } catch (err) {
                              console.error('Failed to add missing item', err);
                            } finally {
                              setAddingMissing((curr) =>
                                curr === ing ? null : curr,
                              );
                            }
                          }}
                          aria-label={
                            isAlreadyInShopping
                              ? `${ing} already in shopping list`
                              : `Add ${ing} to shopping list`
                          }
                          title={
                            isAlreadyInShopping
                              ? 'Already in shopping list'
                              : 'Add to shopping list'
                          }
                          disabled={
                            addingMissing !== null || isAlreadyInShopping
                          }
                        >
                          {isAlreadyInShopping ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {ing}
                            </>
                          ) : (
                            `+ ${ing}`
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};
