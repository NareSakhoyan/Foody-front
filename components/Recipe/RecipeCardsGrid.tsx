'use client';

import React from 'react';
import type { Recipe } from '@/lib/types/recipe';
import { RecipeCard } from './RecipeCard';
import { cn } from '@/lib/utils';

type RecipeCardsGridProps = {
  recipes: Recipe[];
  normalizedUserId: string | null;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowFavorite?: boolean;
  favoriteLoadingId?: string | null;
  onToggleFavorite?: (recipe: Recipe) => void;
  onAddMissingIngredient?: (name: string) => void | Promise<void>;
  shoppingNames?: Set<string>;
  showMatchData?: boolean;
  showFavoritesMatchData?: boolean;
  onEdit?: (recipe: Recipe) => void;
  onDeleteClick?: (recipe: Recipe) => void;
  draggableCards?: boolean;
  onRecipeDragStart?: (
    recipe: Recipe,
    event: React.DragEvent<HTMLElement>,
  ) => void;
  onRecipeDragEnd?: (
    recipe: Recipe,
    event: React.DragEvent<HTMLElement>,
  ) => void;
  horizontalScroll?: boolean;
  gridClassName?: string;
};

const RecipeCardsGrid = ({
  recipes,
  normalizedUserId,
  allowEdit = false,
  allowDelete = false,
  allowFavorite = false,
  favoriteLoadingId,
  onToggleFavorite,
  onAddMissingIngredient,
  shoppingNames,
  showMatchData = true,
  showFavoritesMatchData = true,
  onEdit,
  onDeleteClick,
  draggableCards = false,
  onRecipeDragStart,
  onRecipeDragEnd,
  horizontalScroll = false,
  gridClassName,
}: RecipeCardsGridProps) => (
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
      const shouldShowMatch =
        showMatchData && (showFavoritesMatchData || !recipe.isFavorite);

      return (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          allowFavorite={allowFavorite}
          favoriteLoading={favoriteLoadingId === recipe.id}
          onToggleFavorite={onToggleFavorite}
          onAddMissingIngredient={onAddMissingIngredient}
          shoppingNames={shoppingNames}
          showMatchData={shouldShowMatch}
          allowEdit={canEditRecipe}
          onEdit={canEditRecipe ? onEdit : undefined}
          allowDelete={canDeleteRecipe}
          onDelete={canDeleteRecipe ? (r) => onDeleteClick?.(r) : undefined}
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
);

export { RecipeCardsGrid };
