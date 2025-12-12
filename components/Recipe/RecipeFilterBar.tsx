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
  />
);
