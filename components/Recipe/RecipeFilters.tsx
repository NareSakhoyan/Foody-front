import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Heart, PlusCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { getTagLabel } from '@/lib/utils/tags';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';

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
};

type NumberFieldProps = {
  label: string;
  value?: number;
  placeholder?: string;
  onChange: (value?: number) => void;
  max?: number;
};

const NumberField = ({
  label,
  value,
  placeholder,
  onChange,
  max,
}: NumberFieldProps) => {
  const handleChange = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      onChange(undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(
      0,
      max !== undefined ? Math.min(parsed, max) : parsed,
    );
    onChange(clamped);
  };

  return (
    <label className="grid gap-1 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />
    </label>
  );
};

type SliderFieldProps = {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (val: number) => string;
  onChange: (value?: number) => void;
};

const SliderField = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  formatValue = (val) => String(val),
  onChange,
}: SliderFieldProps) => {
  const current = value ?? min;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground">
            {formatValue(current)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChange(undefined)}
            aria-label={`Clear ${label}`}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
      <div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[current]}
          onValueChange={(vals) => onChange(vals[0] ?? min)}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

type IngredientSelectorProps = {
  label: string;
  placeholder: string;
  items: string[];
  suggestions: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
};

const IngredientSelector = ({
  label,
  placeholder,
  items,
  suggestions,
  onAdd,
  onRemove,
}: IngredientSelectorProps) => {
  const [draft, setDraft] = useState('');
  const displaySuggestions = suggestions.slice(0, 10);

  const handleAdd = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-48"
        />
        <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
              <button
                type="button"
                className="ml-1 inline-flex rounded-full p-0.5 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onRemove(item)}
                aria-label={`Remove ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No filters yet</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Suggestions:</span>
        {displaySuggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="rounded-full border px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => onAdd(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
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
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <div className="flex justify-end">
          <DrawerTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
          </DrawerTrigger>
        </div>
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
      </Drawer>
    </div>
  );
};
