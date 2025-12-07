import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { PantryBuckets } from './PantryBuckets';
import { getPantryCategory, type PantryItem } from './pantry-utils';

type PantryListProps = {
  items: PantryItem[];
  onRemove: (id: number, hard?: boolean) => void;
  onToggleFinished: (item: PantryItem) => void;
  onClearActive: () => void;
  onClearFinished: () => void;
  clearingActive?: boolean;
  clearingFinished?: boolean;
  onAddFinishedToShopping: (item: PantryItem) => void;
  addingFinishedIds?: Set<number>;
};

function PantryList({
  items,
  onRemove,
  onToggleFinished,
  onClearActive,
  onClearFinished,
  clearingActive = false,
  clearingFinished = false,
  onAddFinishedToShopping,
  addingFinishedIds = new Set(),
}: PantryListProps) {
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
  const [activeTab, setActiveTab] = useState<'active' | 'finished'>('active');

  const tabData =
    activeTab === 'active'
      ? {
          label: 'In your pantry',
          count: active.length,
          buckets: activeBuckets,
          empty: 'No active items. Add some staples or use the quick add form.',
        }
      : {
          label: 'Finished',
          count: finished.length,
          buckets: finishedBuckets,
          empty: 'Nothing finished yet. Mark items done to keep them here.',
        };
  const isClearing = activeTab === 'active' ? clearingActive : clearingFinished;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {tabData.label}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {tabData.count} item{tabData.count === 1 ? '' : 's'}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Switch tabs to manage active and finished pantry items.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonGroup className="overflow-hidden rounded-lg border">
            <Button
              type="button"
              variant={activeTab === 'active' ? 'default' : 'outline'}
              onClick={() => setActiveTab('active')}
              className="flex items-center gap-2"
            >
              In pantry
              <span className="text-xs text-muted-foreground">
                {active.length}
              </span>
            </Button>
            <Button
              type="button"
              variant={activeTab === 'finished' ? 'default' : 'outline'}
              onClick={() => setActiveTab('finished')}
              className="flex items-center gap-2"
            >
              Finished
              <span className="text-xs text-muted-foreground">
                {finished.length}
              </span>
            </Button>
          </ButtonGroup>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={tabData.count === 0 || isClearing}
            onClick={activeTab === 'active' ? onClearActive : onClearFinished}
          >
            {isClearing
              ? 'Clearing…'
              : activeTab === 'active'
                ? 'Clear pantry'
                : 'Clear finished'}
          </Button>
        </div>
      </div>
      {tabData.count ? (
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <PantryBuckets
            buckets={tabData.buckets}
            onToggleFinished={onToggleFinished}
            onRemove={onRemove}
            onAddToShopping={
              activeTab === 'finished' ? onAddFinishedToShopping : undefined
            }
            addingIds={addingFinishedIds}
          />
        </div>
      ) : (
        <div className="py-3 text-sm text-muted-foreground">
          {tabData.empty}
        </div>
      )}
    </div>
  );
}

export { PantryList };
