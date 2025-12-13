import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { PantryItem } from './pantry-utils';
import { CheckCircle, MoreVertical, Plus, Trash2 } from 'lucide-react';

type PantryBucket = {
  category: string;
  items: PantryItem[];
};

type PantryBucketsProps = {
  buckets: PantryBucket[];
  onToggleFinished: (item: PantryItem) => void;
  onRemove: (id: number, hard?: boolean) => void;
  onAddToShopping?: (item: PantryItem) => void;
  addingIds?: Set<number>;
};

function PantryBuckets({
  buckets,
  onToggleFinished,
  onRemove,
  onAddToShopping,
  addingIds,
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
            className="group flex flex-wrap items-center justify-between gap-3 py-3"
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100"
                  title="Actions"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={6} className="w-44 p-2">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => onToggleFinished(item)}
                  >
                    <CheckCircle
                      className={
                        item.isFinished ? 'size-4 text-green-600' : 'size-4'
                      }
                    />
                    {item.isFinished ? 'Unmark finished' : 'Mark finished'}
                  </Button>
                  {item.isFinished && onAddToShopping ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => onAddToShopping(item)}
                      disabled={addingIds?.has(item.id)}
                    >
                      <Plus className="size-4" />
                      {addingIds?.has(item.id) ? 'Adding…' : 'Add to shopping'}
                    </Button>
                  ) : null}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => onRemove(item.id, item.isFinished)}
                  >
                    <Trash2 className="size-4" />
                    {item.isFinished ? 'Delete' : 'Remove'}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
    </div>
  ));
}

export { PantryBuckets };
