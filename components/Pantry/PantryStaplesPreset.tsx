import { useEffect, useMemo, useState } from 'react';
import type { PantryItem } from './pantry-utils';
import { staplePresetDetailed, type CreatePantryInput } from './pantry-utils';

type PantryStaplesPresetProps = {
  onAddMany: (items: CreatePantryInput[]) => void;
  existingItems?: PantryItem[];
};

function PantryStaplesPreset({
  onAddMany,
  existingItems = [],
}: PantryStaplesPresetProps) {
  const existingNames = useMemo(() => {
    return new Set(
      existingItems
        .map((item) => item.name.toLowerCase().trim())
        .filter(Boolean),
    );
  }, [existingItems]);

  const filteredStaples = useMemo(
    () =>
      staplePresetDetailed.filter(
        (item) => !existingNames.has(item.name.toLowerCase()),
      ),
    [existingNames],
  );

  const [visibleStaples, setVisibleStaples] = useState(
    filteredStaples.slice(0, 12),
  );
  const [queue, setQueue] = useState(filteredStaples.slice(12));

  useEffect(() => {
    setVisibleStaples(filteredStaples.slice(0, 12));
    setQueue(filteredStaples.slice(12));
  }, [filteredStaples]);

  const buildPayloads = (items = visibleStaples) =>
    items.map((item) => ({
      name: item.name,
      quantity: item.measureUnit
        ? `${item.quantity} ${item.measureUnit}`
        : item.quantity,
    }));

  const handleAddSingle = (name: string) => {
    const match = visibleStaples.find((item) => item.name === name);
    if (!match) return;
    onAddMany(buildPayloads([match]));
    setVisibleStaples((prev) => {
      const nextVisible = prev.filter((item) => item.name !== name);
      const [nextFromQueue, ...restQueue] = queue;
      if (nextFromQueue) nextVisible.push(nextFromQueue);
      setQueue(restQueue);
      return nextVisible;
    });
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Pantry staples</h3>
          <p className="text-sm text-muted-foreground">
            Tap a staple to drop it straight into your pantry.
          </p>
        </div>
      </div>
      {visibleStaples.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
          {visibleStaples.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleAddSingle(item.name)}
              className="cursor-pointer rounded-full bg-muted px-3 py-1 text-foreground transition hover:bg-accent hover:text-accent-foreground"
              title={`Add ${item.name} to pantry`}
            >
              {item.name} {item.quantity}
              {item.measureUnit ? ` ${item.measureUnit}` : ''}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          You already have all staples in your pantry.
        </p>
      )}
    </div>
  );
}

export { PantryStaplesPreset };
