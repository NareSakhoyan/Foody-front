import React from 'react';
import { RecipeFilters } from './RecipeFilters';

type RecipeFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  allowFavorite: boolean;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  selectedTags: Set<string>;
  quickTags: string[];
  onToggleTag: (tag: string) => void;
  availableTagChoices: string[];
  tagChoice: string;
  onTagChoiceChange: (tag: string) => void;
  showTagPicker: boolean;
  onToggleTagPicker: (open: boolean) => void;
  onAddTag: (value?: string) => void;
  maxPrepTime?: number;
  onMaxPrepTimeChange: (value?: number) => void;
  maxCookTime?: number;
  onMaxCookTimeChange: (value?: number) => void;
  maxTotalTime?: number;
  onMaxTotalTimeChange: (value?: number) => void;
  includeIngredients: string[];
  excludeIngredients: string[];
  onIncludeIngredientAdd: (value: string) => void;
  onExcludeIngredientAdd: (value: string) => void;
  onIncludeIngredientRemove: (value: string) => void;
  onExcludeIngredientRemove: (value: string) => void;
  ingredientSuggestions: string[];
  maxMissingIngredients?: number;
  onMaxMissingIngredientsChange: (value?: number) => void;
  minMatchPercent?: number;
  onMinMatchPercentChange: (value?: number) => void;
  onApply: () => void;
};

export const RecipeFilterBar = ({
  search,
  onSearchChange,
  allowFavorite,
  onlyFavorites,
  onToggleFavorites,
  selectedTags,
  quickTags,
  onToggleTag,
  availableTagChoices,
  tagChoice,
  onTagChoiceChange,
  showTagPicker,
  onToggleTagPicker,
  onAddTag,
  maxPrepTime,
  onMaxPrepTimeChange,
  maxCookTime,
  onMaxCookTimeChange,
  maxTotalTime,
  onMaxTotalTimeChange,
  includeIngredients,
  excludeIngredients,
  onIncludeIngredientAdd,
  onExcludeIngredientAdd,
  onIncludeIngredientRemove,
  onExcludeIngredientRemove,
  ingredientSuggestions,
  maxMissingIngredients,
  onMaxMissingIngredientsChange,
  minMatchPercent,
  onMinMatchPercentChange,
  onApply,
}: RecipeFilterBarProps) => (
  <RecipeFilters
    search={search}
    onSearchChange={onSearchChange}
    allowFavorite={allowFavorite}
    onlyFavorites={onlyFavorites}
    onToggleFavorites={onToggleFavorites}
    selectedTags={selectedTags}
    quickTags={quickTags}
    onToggleTag={onToggleTag}
    availableTagChoices={availableTagChoices}
    tagChoice={tagChoice}
    onTagChoiceChange={onTagChoiceChange}
    showTagPicker={showTagPicker}
    onToggleTagPicker={onToggleTagPicker}
    onAddTag={onAddTag}
    maxPrepTime={maxPrepTime}
    onMaxPrepTimeChange={onMaxPrepTimeChange}
    maxCookTime={maxCookTime}
    onMaxCookTimeChange={onMaxCookTimeChange}
    maxTotalTime={maxTotalTime}
    onMaxTotalTimeChange={onMaxTotalTimeChange}
    includeIngredients={includeIngredients}
    excludeIngredients={excludeIngredients}
    onIncludeIngredientAdd={onIncludeIngredientAdd}
    onExcludeIngredientAdd={onExcludeIngredientAdd}
    onIncludeIngredientRemove={onIncludeIngredientRemove}
    onExcludeIngredientRemove={onExcludeIngredientRemove}
    ingredientSuggestions={ingredientSuggestions}
    maxMissingIngredients={maxMissingIngredients}
    onMaxMissingIngredientsChange={onMaxMissingIngredientsChange}
    minMatchPercent={minMatchPercent}
    onMinMatchPercentChange={onMinMatchPercentChange}
    onApply={onApply}
  />
);
