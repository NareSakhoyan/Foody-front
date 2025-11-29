import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SpiceInput } from './recipe-form-utils';

type SpicesSectionProps = {
  spices: SpiceInput[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof SpiceInput, value: string) => void;
};

function SpicesSection({
  spices,
  onAdd,
  onRemove,
  onChange,
}: SpicesSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Spices</span>
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          Add spice
        </Button>
      </div>

      <div className="space-y-3">
        {spices.map((spice, index) => (
          <div
            key={`spice-${index}`}
            className="grid gap-2 rounded-lg border bg-muted/30 p-3 md:grid-cols-2"
          >
            <Input
              placeholder="Name"
              value={spice.name}
              onChange={(e) => onChange(index, 'name', e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                className="w-full"
                placeholder="Note (optional)"
                value={spice.note}
                onChange={(e) => onChange(index, 'note', e.target.value)}
              />
              {spices.length > 1 ? (
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

export { SpicesSection };
