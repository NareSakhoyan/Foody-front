import { Button } from '@/components/ui/button';
import type { PantryItem } from './pantry-utils';

type PantryListProps = {
  items: PantryItem[];
  onRemove: (id: number, hard?: boolean) => void;
  onToggleFinished: (item: PantryItem) => void;
};

function PantryList({ items, onRemove, onToggleFinished }: PantryListProps) {
  const active = items.filter((item) => !item.isFinished);
  const finished = items.filter((item) => item.isFinished);

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
        <div className="divide-y">
          {active.length ? (
            active.map((item) => (
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
                    size="sm"
                    onClick={() => onToggleFinished(item)}
                  >
                    Mark finished
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-3 text-sm text-muted-foreground">
              No active items. Add some staples or use the quick add form.
            </div>
          )}
        </div>
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
          <div className="divide-y">
            {finished.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-tight line-through">
                    {item.name}
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
                    size="sm"
                    onClick={() => onToggleFinished(item)}
                  >
                    Unmark
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id, true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { PantryList };
