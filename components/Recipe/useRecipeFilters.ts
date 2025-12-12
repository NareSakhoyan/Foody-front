'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchRecipeTags } from '@/lib/api/recipes';
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
    setSelectedTags(tags.length ? new Set(tags) : new Set());
  }, [searchParams, syncWithUrl]);

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
  };
};
