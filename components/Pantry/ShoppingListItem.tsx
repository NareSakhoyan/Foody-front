import { Button } from '@/components/ui/button';
import type { ShoppingItem } from './shopping-utils';
import { CheckCircle, Trash2 } from 'lucide-react';

type ShoppingListItemProps = {
  item: ShoppingItem;
  readOnly: boolean;
  onTogglePurchased?: (item: ShoppingItem) => void;
  onRemove?: (id: number) => void;
};

function ShoppingListItem({
  item,
  readOnly,
  onTogglePurchased,
  onRemove,
}: ShoppingListItemProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-muted/40 p-3">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium leading-tight">
          <CheckCircle className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate min-w-0 flex-1">{item.name}</span>
        </div>
        {item.quantity ? (
          <div className="text-xs text-muted-foreground">{item.quantity}</div>
        ) : null}
        {item.notes ? (
          <div className="truncate text-xs text-muted-foreground">
            {item.notes}
          </div>
        ) : null}
      </div>
      {readOnly ? null : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTogglePurchased?.(item)}
          >
            Purchased
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove?.(item.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export { ShoppingListItem };
