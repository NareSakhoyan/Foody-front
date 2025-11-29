'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Recipe } from '@/lib/types/recipe';
import { getTagKey, getTagLabel } from '@/lib/utils/tags';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

type RecipeCardProps = {
  recipe: Recipe;
  allowFavorite?: boolean;
  favoriteLoading?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
  allowEdit?: boolean;
  onEdit?: (recipe: Recipe) => void;
  allowDelete?: boolean;
  onDelete?: (recipe: Recipe) => void;
};

export const RecipeCard = ({
  recipe,
  allowFavorite,
  favoriteLoading,
  onToggleFavorite,
  allowEdit,
  onEdit,
  allowDelete,
  onDelete,
}: RecipeCardProps) => {
  const fallbackInitial = useMemo(
    () => (recipe.name?.[0] || 'R').toUpperCase(),
    [recipe.name],
  );

  return (
    <article className="group rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative mb-3 overflow-hidden rounded-lg">
        <Link
          href={`/recipes/${recipe.id}`}
          className="group/block relative block"
        >
          {recipe.imageUrl ? (
            <div className="relative h-44 w-full bg-muted">
              <Image
                src={recipe.imageUrl}
                alt={recipe.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-300 group-hover:scale-105"
                priority={false}
              />
            </div>
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-4xl font-semibold text-muted-foreground/70">
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
              {recipe.shortDescription || 'No description provided.'}
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
        <div className="mt-3 space-y-1 text-sm">
          <p className="font-medium text-foreground">Key ingredients</p>
          <p className="line-clamp-2 text-muted-foreground">
            {recipe.ingredients
              .slice(0, 3)
              .map(
                (item) => `${item.quantity} ${item.measureUnit} ${item.name}`,
              )
              .join(', ')}
            {recipe.ingredients.length > 3 ? '…' : ''}
          </p>
        </div>
      ) : null}
    </article>
  );
};
