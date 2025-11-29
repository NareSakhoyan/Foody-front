import type { RecipeTag } from '@/lib/types/recipe';

const asTrimmedString = (value: unknown) => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
};

export const getTagLabel = (tag: RecipeTag | null | undefined): string => {
  if (typeof tag === 'string') return tag.trim();

  if (tag && typeof tag === 'object') {
    if ('name' in tag && typeof tag.name === 'string') {
      return tag.name.trim();
    }
    if ('tag' in tag && typeof tag.tag === 'string') {
      return tag.tag.trim();
    }
    if ('label' in tag && typeof tag.label === 'string') {
      return tag.label.trim();
    }
    if (
      'id' in tag &&
      (typeof tag.id === 'string' || typeof tag.id === 'number')
    ) {
      const id = String(tag.id).trim();
      if (id) return id;
    }
  }

  const fallback = asTrimmedString(tag);
  return fallback && fallback !== '[object Object]' ? fallback : 'tag';
};

export const getTagKey = (tag: RecipeTag, index: number): string => {
  if (
    tag &&
    typeof tag === 'object' &&
    'id' in tag &&
    (typeof tag.id === 'string' || typeof tag.id === 'number')
  ) {
    const id = String(tag.id).trim();
    if (id) return `tag-${id}`;
  }

  const label = getTagLabel(tag);
  return label ? `tag-${label}-${index}` : `tag-${index}`;
};
