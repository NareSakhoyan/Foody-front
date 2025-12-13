import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Heart, PlusCircle, SlidersHorizontal, X } from 'lucide-react';
import { getTagLabel } from '@/lib/utils/tags';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import type { SearchHistoryItem } from '@/lib/api/search-history';
import { IngredientSelector, NumberField, SliderField } from './FilterFields';
import { SearchInputWithHistory } from './SearchInputWithHistory';

type RecipeFiltersProps = {
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
  onTagChoiceChange: (value: string) => void;
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
  searchHistoryItems?: SearchHistoryItem[];
  searchHistoryLoading?: boolean;
  onSearchHistoryRefresh?: () => void;
  onSearchHistorySelect?: (entry: SearchHistoryItem) => void;
  onSearchHistoryDelete?: (id: string) => void;
  onSearchHistoryClear?: () => void;
};

export const RecipeFilters = ({
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
  searchHistoryItems,
  searchHistoryLoading,
  onSearchHistoryRefresh,
  onSearchHistorySelect,
  onSearchHistoryDelete,
  onSearchHistoryClear,
}: RecipeFiltersProps) => {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleApply = () => {
    onApply();
    setDrawerOpen(false);
  };

  const normalizeTag = (value: unknown) => {
    return getTagLabel(value as never);
  };

  const displayTags = useMemo(() => {
    const combined = [...quickTags, ...Array.from(selectedTags)];
    const normalized = combined
      .map(normalizeTag)
      .map((t) => t.trim())
      .filter(Boolean);
    return Array.from(new Set(normalized));
  }, [quickTags, selectedTags]);

  const showTagFilters =
    displayTags.length > 0 || availableTagChoices.length > 0;

  useEffect(() => {
    if (!showTagPicker) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onToggleTagPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggleTagPicker, showTagPicker]);

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-2 md:max-w-2xl md:flex-row md:items-center md:gap-3">
            <SearchInputWithHistory
              search={search}
              onSearchChange={onSearchChange}
              historyEnabled={Boolean(onSearchHistorySelect)}
              searchHistoryItems={searchHistoryItems}
              searchHistoryLoading={searchHistoryLoading}
              onSearchHistoryRefresh={onSearchHistoryRefresh}
              onSearchHistorySelect={onSearchHistorySelect}
              onSearchHistoryDelete={onSearchHistoryDelete}
              onSearchHistoryClear={onSearchHistoryClear}
            />
          </div>
          <div className="flex items-center justify-end md:justify-start">
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
            </DrawerTrigger>
          </div>
        </div>

        {showTagFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            {allowFavorite ? (
              <Button
                type="button"
                variant={onlyFavorites ? 'default' : 'outline'}
                size="sm"
                onClick={onToggleFavorites}
              >
                <Heart
                  className="size-4"
                  fill={onlyFavorites ? 'currentColor' : 'none'}
                />
                Favorites
              </Button>
            ) : null}
            {displayTags.length ? (
              displayTags.map((tag) => {
                const active = selectedTags.has(tag);
                return (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={active ? 'default' : 'outline'}
                    onClick={() => onToggleTag(tag)}
                  >
                    #{tag}
                  </Button>
                );
              })
            ) : (
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Quick filters
              </span>
            )}
            <div className="relative" ref={pickerRef}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleTagPicker(!showTagPicker)}
                disabled={!availableTagChoices.length}
              >
                <PlusCircle className="size-4" />
                Add tag filter
              </Button>
              {showTagPicker ? (
                <div className="absolute left-0 z-20 mt-2 w-64 min-w-[16rem] max-w-sm">
                  <Combobox
                    options={availableTagChoices.map((tag) => ({
                      label: `#${tag}`,
                      value: tag,
                    }))}
                    value={tagChoice}
                    onChange={(val) => {
                      onTagChoiceChange(val);
                      onAddTag(val);
                    }}
                    placeholder="Search tags..."
                    className="w-full shadow-lg"
                    emptyText="No tags"
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader className="flex flex-row items-center justify-between">
            <div>
              <DrawerTitle>Filters</DrawerTitle>
              <p className="text-sm text-muted-foreground">
                Refine by time and ingredients.
              </p>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close filters">
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="space-y-6 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <NumberField
                label="Max prep time (min)"
                value={maxPrepTime}
                onChange={onMaxPrepTimeChange}
                placeholder="e.g. 20"
              />
              <NumberField
                label="Max cook time (min)"
                value={maxCookTime}
                onChange={onMaxCookTimeChange}
                placeholder="e.g. 40"
              />
              <NumberField
                label="Max overall time (min)"
                value={maxTotalTime}
                onChange={onMaxTotalTimeChange}
                placeholder="e.g. 60"
              />
            </div>

            <div className="flex flex-col gap-4">
              <IngredientSelector
                label="Must include ingredient(s)"
                placeholder="Add ingredients to include"
                items={includeIngredients}
                suggestions={ingredientSuggestions}
                onAdd={onIncludeIngredientAdd}
                onRemove={onIncludeIngredientRemove}
              />
              <IngredientSelector
                label="Exclude ingredient(s)"
                placeholder="Add ingredients to exclude"
                items={excludeIngredients}
                suggestions={ingredientSuggestions}
                onAdd={onExcludeIngredientAdd}
                onRemove={onExcludeIngredientRemove}
              />
            </div>
            <div className="flex flex-col gap-3">
              <SliderField
                label="Max missing ingredients"
                value={maxMissingIngredients}
                min={0}
                max={12}
                step={1}
                onChange={onMaxMissingIngredientsChange}
              />
              <SliderField
                label="Min match %"
                value={minMatchPercent}
                min={0}
                max={100}
                step={5}
                formatValue={(val) => `${val}%`}
                onChange={onMinMatchPercentChange}
              />
            </div>
          </div>
          <div className="border-t p-4 pt-3">
            <Button className="w-full" onClick={handleApply}>
              Apply filters
            </Button>
          </div>
        </DrawerContent>
      </div>
    </Drawer>
  );
};
