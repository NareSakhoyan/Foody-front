import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { getPantryCategory, type PantryItem } from './pantry-utils';
import { CheckCircle, Trash2 } from 'lucide-react';

type PantryListProps = {
  items: PantryItem[];
  onRemove: (id: number, hard?: boolean) => void;
  onToggleFinished: (item: PantryItem) => void;
};

function PantryList({ items, onRemove, onToggleFinished }: PantryListProps) {
  const active = items.filter((item) => !item.isFinished);
  const finished = items.filter((item) => item.isFinished);

  const buildBuckets = (list: PantryItem[]) => {
    const buckets = new Map<string, PantryItem[]>();
    list.forEach((item) => {
      const category = getPantryCategory(item.name);
      const existing = buckets.get(category) ?? [];
      existing.push(item);
      buckets.set(category, existing);
    });
    const orderedKeys = Array.from(buckets.keys()).sort((a, b) => {
      if (a === 'uncategorized') return 1;
      if (b === 'uncategorized') return -1;
      return a.localeCompare(b);
    });
    return orderedKeys.map((key) => ({
      category: key,
      items: buckets.get(key)!,
    }));
  };

  const activeBuckets = useMemo(() => buildBuckets(active), [active]);
  const finishedBuckets = useMemo(() => buildBuckets(finished), [finished]);

  const renderBuckets = (
    buckets: { category: string; items: PantryItem[] }[],
  ) =>
    buckets.map((bucket) => (
      <div
        key={bucket.category}
        className="flex min-w-[240px] flex-col gap-2 rounded-lg border bg-muted/40 p-3"
      >
        <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
          {bucket.category === 'uncategorized'
            ? 'Uncategorized'
            : bucket.category}
        </div>
        <div
          className="divide-y overflow-y-auto pr-1 [scrollbar-gutter:stable]"
          style={{ maxHeight: '260px' }}
        >
          {bucket.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="space-y-1">
                <div className="text-sm font-medium leading-tight">
                  {item.name || 'Unnamed'}
                </div>
                {item.quantity ? (
                  <div className="text-xs text-muted-foreground">
                    {item.quantity}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onToggleFinished(item)}
                  title={item.isFinished ? 'Unmark' : 'Mark finished'}
                >
                  <CheckCircle
                    className={
                      item.isFinished ? 'size-4 text-green-600' : 'size-4'
                    }
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(item.id, item.isFinished)}
                  title={item.isFinished ? 'Delete' : 'Remove'}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            In your pantry
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {active.length} item{active.length === 1 ? '' : 's'}
            </span>
          </h3>
        </div>
        {active.length ? (
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {renderBuckets(activeBuckets)}
          </div>
        ) : (
          <div className="py-3 text-sm text-muted-foreground">
            No active items. Add some staples or use the quick add form.
          </div>
        )}
      </div>

      {finished.length ? (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Finished
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {finished.length} item{finished.length === 1 ? '' : 's'}
              </span>
            </h3>
          </div>
          {finishedBuckets.length ? (
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {renderBuckets(finishedBuckets)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { PantryList };
