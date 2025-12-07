import { Button } from '@/components/ui/button';
import type { PantryItem } from './pantry-utils';
import { CheckCircle, Trash2 } from 'lucide-react';

type PantryBucket = {
  category: string;
  items: PantryItem[];
};

type PantryBucketsProps = {
  buckets: PantryBucket[];
  onToggleFinished: (item: PantryItem) => void;
  onRemove: (id: number, hard?: boolean) => void;
};

function PantryBuckets({
  buckets,
  onToggleFinished,
  onRemove,
}: PantryBucketsProps) {
  return buckets.map((bucket) => (
    <div
      key={bucket.category}
      className="flex min-w-60 flex-col gap-2 rounded-lg border bg-muted/40 p-3"
    >
      <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {bucket.category === 'uncategorized'
          ? 'Uncategorized'
          : bucket.category}
      </div>
      <div
        className="divide-y overflow-y-auto pr-1 [scrollbar-gutter:stable] no-scrollbar"
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
}

export { PantryBuckets };
