import { Button } from '@/components/ui/button';
import type { SearchHistoryItem } from '@/lib/api/search-history';
import { X } from 'lucide-react';
import { forwardRef, useMemo } from 'react';

const parseListFilter = (value: unknown) => {
  const seen = new Map<string, string>();
  const addValue = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  };
  if (Array.isArray(value)) {
    value.forEach((item) => addValue(String(item)));
  } else if (typeof value === 'string') {
    value.split(',').forEach((part) => addValue(part));
  }
  return Array.from(seen.values());
};

const parseNumberFilter = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const formatFilterSummary = (entry?: SearchHistoryItem) => {
  if (!entry?.filters) return '';
  const filters = entry.filters as Record<string, unknown>;
  const tags = parseListFilter(filters.tag ?? filters.tags);
  const include = parseListFilter(
    filters.includeIngredients ?? filters.include ?? filters.ingredients,
  );
  const exclude = parseListFilter(
    filters.excludeIngredients ?? filters.exclude,
  );
  const maxTotal = parseNumberFilter(filters.maxTotalTime ?? filters.totalTime);
  const parts = [];
  if (tags.length) parts.push(`#${tags.slice(0, 2).join(', #')}`);
  if (include.length) parts.push(`Include: ${include.slice(0, 2).join(', ')}`);
  if (exclude.length) parts.push(`Skip: ${exclude.slice(0, 2).join(', ')}`);
  if (maxTotal !== undefined) parts.push(`≤ ${maxTotal} min`);
  return parts.length ? parts.join(' • ') : '';
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
};

const formatDateTitle = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

type SearchHistoryDropdownProps = {
  items?: SearchHistoryItem[];
  loading?: boolean;
  onSelect?: (entry: SearchHistoryItem) => void;
  onDelete?: (id: string) => void;
  onClear?: () => void;
};

export const SearchHistoryDropdown = forwardRef<
  HTMLDivElement,
  SearchHistoryDropdownProps
>(({ items, loading, onSelect, onDelete, onClear }, ref) => {
  const historyItems = useMemo(() => items ?? [], [items]);

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md border bg-card shadow-lg"
    >
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            Loading history…
          </div>
        ) : historyItems.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            Your recent searches will show up here.
          </div>
        ) : (
          <>
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="group flex w-full items-center gap-2 border-b px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <button
                  type="button"
                  className="flex w-full items-start gap-2 text-left"
                  onClick={() => onSelect?.(item)}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="block truncate text-sm font-medium">
                      {item.query}
                    </span>
                    {formatFilterSummary(item) ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {formatFilterSummary(item)}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className="self-center whitespace-nowrap text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    title={formatDateTitle(item.createdAt)}
                  >
                    {formatDate(item.createdAt)}
                  </span>
                </button>
                <button
                  type="button"
                  className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={() => onDelete?.(item.id)}
                  aria-label="Delete search"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-end px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3"
                onClick={() => onClear?.()}
              >
                Clear all history
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

SearchHistoryDropdown.displayName = 'SearchHistoryDropdown';
