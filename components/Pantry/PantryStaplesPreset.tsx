import { Button } from '@/components/ui/button';
import { staplePreset, type CreatePantryInput } from './pantry-utils';

type PantryStaplesPresetProps = {
  onAddMany: (items: CreatePantryInput[]) => void;
};

function PantryStaplesPreset({ onAddMany }: PantryStaplesPresetProps) {
  const buildPayloads = () =>
    staplePreset.map((name) => ({
      name,
      quantity: null,
    }));

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Staples presets</h3>
          <p className="text-sm text-muted-foreground">
            Quickly add common pantry staples you probably already have.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => onAddMany(buildPayloads())}>
          Add staples
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
        {staplePreset.map((item) => (
          <span
            key={item}
            className="rounded-full bg-muted px-3 py-1 text-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export { PantryStaplesPreset };
