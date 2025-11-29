import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreatePantryInput } from './pantry-utils';
import { commonIngredients } from './pantry-utils';

type PantryQuickAddProps = {
  onAdd: (input: CreatePantryInput) => void;
};

function PantryQuickAdd({ onAdd }: PantryQuickAddProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name,
      quantity: quantity || null,
    });
    setName('');
    setQuantity('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quick add</h3>
          <p className="text-sm text-muted-foreground">
            Add a single pantry item with an optional quantity.
          </p>
        </div>
        <Button type="submit" disabled={!name.trim()}>
          Add
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">Name</span>
          <Input
            list="pantry-common-ingredients"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tomatoes"
            required
          />
          <datalist id="pantry-common-ingredients">
            {commonIngredients.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">
            Quantity (optional)
          </span>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="2 pcs / 500g"
          />
        </label>
      </div>
    </form>
  );
}

export { PantryQuickAdd };
