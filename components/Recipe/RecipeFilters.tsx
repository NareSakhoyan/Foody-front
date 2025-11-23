import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Heart, Search, SlidersHorizontal, PlusCircle } from 'lucide-react';
import type { Recipe } from '@/lib/types/recipe';

export type SortOption = 'recent' | 'name' | 'prep' | 'cook';

type RecipeFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
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
  recipes: Recipe[];
};

export const RecipeFilters = ({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
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
  recipes,
}: RecipeFiltersProps) => {
  const hasRecipes = useMemo(() => recipes.length > 0, [recipes]);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const displayTags = useMemo(
    () => Array.from(new Set([...quickTags, ...selectedTags])),
    [quickTags, selectedTags],
  );

  useEffect(() => {
    if (!showTagPicker) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onToggleTagPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggleTagPicker, showTagPicker]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search recipes, ingredients, tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            <span>Sort</span>
            <select
              className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus-visible:border-ring"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
            >
              <option value="recent">Most recent</option>
              <option value="name">Name A–Z</option>
              <option value="prep">Prep time</option>
              <option value="cook">Cook time</option>
            </select>
          </label>
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
        </div>
      </div>

      {hasRecipes ? (
        <div className="flex flex-wrap items-center gap-2">
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
            <div ref={pickerRef} className="w-full max-w-sm">
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
                className="w-full"
                emptyText="No tags"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
