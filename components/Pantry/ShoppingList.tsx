import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import type { CreateShoppingItemInput, ShoppingItem } from './shopping-utils';
import { ShoppingListItem } from './ShoppingListItem';

type ShoppingListProps = {
  items: ShoppingItem[];
  loading?: boolean;
  onAdd?: (input: CreateShoppingItemInput) => void;
  onTogglePurchased?: (item: ShoppingItem) => void;
  onRemove?: (id: number) => void;
  readOnly?: boolean;
};

function ShoppingList({
  items,
  loading = false,
  onAdd,
  onTogglePurchased,
  onRemove,
  readOnly = false,
}: ShoppingListProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const active = items.filter((item) => !item.isPurchased);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd?.({
      name: name.trim(),
      quantity: quantity || null,
      notes: notes || null,
    });
    setName('');
    setQuantity('');
    setNotes('');
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Shopping list</h3>
          <p className="text-sm text-muted-foreground">
            Track what to buy and mark items as purchased.
          </p>
        </div>
      </div>

      {readOnly ? null : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          <Input
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Quantity (optional)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <div className="flex flex-col gap-2 md:col-span-1 md:flex-row">
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="md:flex-1"
            />
            <Button type="submit" disabled={!name.trim()}>
              Add to list
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" /> Loading shopping list…
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {active.length ? (
            <div className="min-h-[30vh] overflow-y-auto pr-1 [scrollbar-gutter:stable] no-scrollbar">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {active.map((item, index) => (
                  <ShoppingListItem
                    key={`${item.id}-${index}`}
                    item={item}
                    readOnly={readOnly}
                    onTogglePurchased={onTogglePurchased}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Nothing to buy yet. Add items above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { ShoppingList };
