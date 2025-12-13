'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchRecipeTags, fetchRecipes } from '@/lib/api/recipes';
import { getTagLabel } from '@/lib/utils/tags';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

export type RecipeFiltersState = {
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTags: Set<string>;
  toggleTag: (tag: string) => void;
  tagChoice: string;
  setTagChoice: (value: string) => void;
  showTagPicker: boolean;
  setShowTagPicker: (open: boolean) => void;
  addTagFilter: (value?: string) => void;
  quickTags: string[];
  availableTagChoices: string[];
  tagParam?: string;
  selectedTagsKey: string;
  syncWithUrl: boolean;
  maxPrepTime?: number;
  setMaxPrepTime: React.Dispatch<React.SetStateAction<number | undefined>>;
  maxCookTime?: number;
  setMaxCookTime: React.Dispatch<React.SetStateAction<number | undefined>>;
  maxTotalTime?: number;
  setMaxTotalTime: React.Dispatch<React.SetStateAction<number | undefined>>;
  includeIngredients: string[];
  excludeIngredients: string[];
  addIncludeIngredient: (value: string) => void;
  addExcludeIngredient: (value: string) => void;
  removeIncludeIngredient: (value: string) => void;
  removeExcludeIngredient: (value: string) => void;
  ingredientSuggestions: string[];
  maxMissingIngredients?: number;
  setMaxMissingIngredients: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  minMatchPercent?: number;
  setMinMatchPercent: React.Dispatch<React.SetStateAction<number | undefined>>;
  advancedFiltersKey: string;
  applyFilters: () => void;
  appliedSearch: string;
  appliedOnlyFavorites: boolean;
  appliedTagParam?: string;
  appliedSelectedTagsKey: string;
  appliedMaxPrepTime?: number;
  appliedMaxCookTime?: number;
  appliedMaxTotalTime?: number;
  appliedIncludeIngredients: string[];
  appliedExcludeIngredients: string[];
  appliedMaxMissingIngredients?: number;
  appliedMinMatchPercent?: number;
};

type UseRecipeFiltersOptions = {
  loadTags?: boolean;
  syncWithUrl?: boolean;
  initialFavorites?: boolean;
};

const buildSelectedTagsKey = (tags: Set<string>) =>
  Array.from(tags)
    .map((t) => t.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join(',');

export const useRecipeFilters = (
  options: UseRecipeFiltersOptions = {},
): RecipeFiltersState => {
  const {
    loadTags = true,
    syncWithUrl = true,
    initialFavorites = false,
  } = options;
  const { callApi } = useApi();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(initialFavorites);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagChoice, setTagChoice] = useState('');
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [maxPrepTime, setMaxPrepTime] = useState<number | undefined>();
  const [maxCookTime, setMaxCookTime] = useState<number | undefined>();
  const [maxTotalTime, setMaxTotalTime] = useState<number | undefined>();
  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [maxMissingIngredients, setMaxMissingIngredients] = useState<
    number | undefined
  >();
  const [minMatchPercent, setMinMatchPercent] = useState<number | undefined>();
  const [ingredientSuggestions, setIngredientSuggestions] = useState<string[]>(
    [],
  );
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedOnlyFavorites, setAppliedOnlyFavorites] =
    useState(initialFavorites);
  const [appliedSelectedTags, setAppliedSelectedTags] = useState<Set<string>>(
    new Set(),
  );
  const [appliedMaxPrepTime, setAppliedMaxPrepTime] = useState<
    number | undefined
  >();
  const [appliedMaxCookTime, setAppliedMaxCookTime] = useState<
    number | undefined
  >();
  const [appliedMaxTotalTime, setAppliedMaxTotalTime] = useState<
    number | undefined
  >();
  const [appliedIncludeIngredients, setAppliedIncludeIngredients] = useState<
    string[]
  >([]);
  const [appliedExcludeIngredients, setAppliedExcludeIngredients] = useState<
    string[]
  >([]);
  const [appliedMaxMissingIngredients, setAppliedMaxMissingIngredients] =
    useState<number | undefined>();
  const [appliedMinMatchPercent, setAppliedMinMatchPercent] = useState<
    number | undefined
  >();

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (!loadTags) return undefined;
    let active = true;
    const load = async () => {
      try {
        const tags = await fetchRecipeTags(callApi);
        if (!active) return;
        const normalized = (tags || [])
          .map((tag) => getTagLabel(tag))
          .map((t) => t.trim())
          .filter((t) => t.length);
        setAvailableTags(Array.from(new Set(normalized)));
      } catch (err) {
        toast.error('Failed to load tags.');
        console.error('Failed to load tags', err);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [callApi, loadTags]);

  useEffect(() => {
    let active = true;
    const loadIngredients = async () => {
      try {
        const data = await fetchRecipes(callApi, '/recipes', {
          page: 1,
          pageSize: 100,
        });
        if (!active) return;
        const dedup = new Map<string, string>();
        (data.items || []).forEach((recipe) => {
          (recipe.ingredients || []).forEach((ingredient) => {
            const raw = ingredient?.name ?? '';
            const trimmed = raw.trim();
            if (!trimmed) return;
            const key = trimmed.toLowerCase();
            if (!dedup.has(key)) dedup.set(key, trimmed);
          });
        });
        const sorted = Array.from(dedup.values()).sort((a, b) =>
          a.localeCompare(b),
        );
        setIngredientSuggestions(
          sorted.length
            ? sorted
            : ['Salt', 'Pepper', 'Garlic', 'Onion', 'Olive oil'],
        );
      } catch (err) {
        if (!active) return;
        console.error('Failed to load ingredient suggestions', err);
        toast.error('Could not load ingredient suggestions.');
        setIngredientSuggestions(['Salt', 'Pepper', 'Garlic', 'Onion']);
      }
    };
    void loadIngredients();
    return () => {
      active = false;
    };
  }, [callApi]);

  const { quickTags, availableTagChoices } = useMemo(() => {
    const normalized = availableTags.map((t) => t.trim()).filter(Boolean);
    const unique = Array.from(new Set(normalized)).sort((a, b) =>
      a.localeCompare(b),
    );
    const quickTags = unique.slice(0, 10);
    const availableTagChoices = unique.filter(
      (t) => !quickTags.includes(t) && !selectedTags.has(t),
    );
    return { quickTags, availableTagChoices };
  }, [availableTags, selectedTags]);

  const tagParam = useMemo(() => {
    const tags = Array.from(selectedTags)
      .map((t) => t.trim())
      .filter(Boolean);
    return tags.length ? tags.join(',') : undefined;
  }, [selectedTags]);

  const appliedTagParam = useMemo(() => {
    const tags = Array.from(appliedSelectedTags)
      .map((t) => t.trim())
      .filter(Boolean);
    return tags.length ? tags.join(',') : undefined;
  }, [appliedSelectedTags]);

  useEffect(() => {
    if (!availableTagChoices.length) {
      setTagChoice('');
      return;
    }
    if (!tagChoice || !availableTagChoices.includes(tagChoice)) {
      setTagChoice(availableTagChoices[0]);
    }
  }, [availableTagChoices, tagChoice]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const addTagFilter = (value?: string) => {
    const tagToAdd = value ?? tagChoice;
    if (!tagToAdd) return;
    setSelectedTags((prev) => new Set(prev).add(tagToAdd));
    setTagChoice('');
    setShowTagPicker(false);
  };

  const normalizeIngredient = (value: string) =>
    value.trim().replace(/\s+/g, ' ');

  const addIncludeIngredient = (value: string) => {
    const normalized = normalizeIngredient(value);
    if (!normalized) return;
    setIncludeIngredients((prev) => {
      if (prev.some((item) => item.toLowerCase() === normalized.toLowerCase()))
        return prev;
      return [...prev, normalized];
    });
  };

  const addExcludeIngredient = (value: string) => {
    const normalized = normalizeIngredient(value);
    if (!normalized) return;
    setExcludeIngredients((prev) => {
      if (prev.some((item) => item.toLowerCase() === normalized.toLowerCase()))
        return prev;
      return [...prev, normalized];
    });
  };

  const removeIncludeIngredient = (value: string) => {
    const target = value.toLowerCase();
    setIncludeIngredients((prev) =>
      prev.filter((item) => item.toLowerCase() !== target),
    );
  };

  const removeExcludeIngredient = (value: string) => {
    const target = value.toLowerCase();
    setExcludeIngredients((prev) =>
      prev.filter((item) => item.toLowerCase() !== target),
    );
  };

  useEffect(() => {
    if (!syncWithUrl) return;
    const q = searchParams.get('q') ?? '';
    const tag = searchParams.get('tag') ?? '';
    const tags = tag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const fav = searchParams.get('fav') === '1';
    setSearch(q);
    setDebouncedSearch(q);
    setOnlyFavorites(fav);
    const nextTags = tags.length ? new Set(tags) : new Set<string>();
    setSelectedTags(nextTags);
    setAppliedSelectedTags(nextTags);
    setAppliedSearch(q);
    setAppliedOnlyFavorites(fav);
  }, [searchParams, syncWithUrl]);

  const advancedFiltersKey = useMemo(
    () =>
      [
        appliedMaxPrepTime ?? '',
        appliedMaxCookTime ?? '',
        appliedMaxTotalTime ?? '',
        appliedMaxMissingIngredients ?? '',
        appliedMinMatchPercent ?? '',
        appliedIncludeIngredients
          .map((i) => i.trim().toLowerCase())
          .filter(Boolean)
          .sort()
          .join(','),
        appliedExcludeIngredients
          .map((i) => i.trim().toLowerCase())
          .filter(Boolean)
          .sort()
          .join(','),
      ].join('|'),
    [
      appliedExcludeIngredients,
      appliedIncludeIngredients,
      appliedMaxCookTime,
      appliedMaxMissingIngredients,
      appliedMaxPrepTime,
      appliedMaxTotalTime,
      appliedMinMatchPercent,
    ],
  );

  const applyFilters = () => {
    setAppliedSearch(search);
    setAppliedOnlyFavorites(onlyFavorites);
    setAppliedSelectedTags(new Set(selectedTags));
    setAppliedMaxPrepTime(maxPrepTime);
    setAppliedMaxCookTime(maxCookTime);
    setAppliedMaxTotalTime(maxTotalTime);
    setAppliedIncludeIngredients(includeIngredients);
    setAppliedExcludeIngredients(excludeIngredients);
    setAppliedMaxMissingIngredients(maxMissingIngredients);
    setAppliedMinMatchPercent(minMatchPercent);
  };

  return {
    search,
    debouncedSearch,
    setSearch,
    onlyFavorites,
    setOnlyFavorites,
    selectedTags,
    toggleTag,
    tagChoice,
    setTagChoice,
    showTagPicker,
    setShowTagPicker,
    addTagFilter,
    quickTags,
    availableTagChoices,
    tagParam,
    selectedTagsKey: buildSelectedTagsKey(selectedTags),
    syncWithUrl,
    maxPrepTime,
    setMaxPrepTime,
    maxCookTime,
    setMaxCookTime,
    maxTotalTime,
    setMaxTotalTime,
    includeIngredients,
    excludeIngredients,
    addIncludeIngredient,
    addExcludeIngredient,
    removeIncludeIngredient,
    removeExcludeIngredient,
    ingredientSuggestions,
    maxMissingIngredients,
    setMaxMissingIngredients,
    minMatchPercent,
    setMinMatchPercent,
    advancedFiltersKey,
    applyFilters,
    appliedSearch,
    appliedOnlyFavorites,
    appliedTagParam,
    appliedSelectedTagsKey: buildSelectedTagsKey(appliedSelectedTags),
    appliedMaxPrepTime,
    appliedMaxCookTime,
    appliedMaxTotalTime,
    appliedIncludeIngredients,
    appliedExcludeIngredients,
    appliedMaxMissingIngredients,
    appliedMinMatchPercent,
  };
};
