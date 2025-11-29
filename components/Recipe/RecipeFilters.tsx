import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Heart, Search, PlusCircle } from 'lucide-react';
import { getTagLabel } from '@/lib/utils/tags';

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
}: RecipeFiltersProps) => {
  const pickerRef = useRef<HTMLDivElement | null>(null);

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

      {showTagFilters ? (
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
    </div>
  );
};
