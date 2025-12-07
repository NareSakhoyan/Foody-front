import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { IngredientInput } from './recipe-form-utils';
import { MeasureUnitSelect } from './MeasureUnitSelect';

type IngredientsSectionProps = {
  ingredients: IngredientInput[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof IngredientInput,
    value: string | number,
  ) => void;
  requiredLabel?: string;
};

function IngredientsSection({
  ingredients,
  onAdd,
  onRemove,
  onChange,
  requiredLabel = '',
}: IngredientsSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Ingredients {requiredLabel}
        </span>
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          Add ingredient
        </Button>
      </div>

      <div className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div
            key={`ingredient-${index}`}
            className="grid gap-2 rounded-lg border bg-muted/30 p-3 md:grid-cols-4"
          >
            <Input
              placeholder="Name"
              value={ingredient.name}
              onChange={(e) => onChange(index, 'name', e.target.value)}
            />
            <Input
              step="1"
              placeholder="Quantity"
              value={ingredient.quantity}
              onChange={(e) => onChange(index, 'quantity', e.target.value)}
            />
            <MeasureUnitSelect
              value={ingredient.measureUnit}
              onChange={(val) => onChange(index, 'measureUnit', val)}
            />
            <div className="flex gap-2">
              <Input
                className="w-full"
                placeholder="Note (optional)"
                value={ingredient.note}
                onChange={(e) => onChange(index, 'note', e.target.value)}
              />
              {ingredients.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(index)}
                >
                  ✕
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { IngredientsSection };
