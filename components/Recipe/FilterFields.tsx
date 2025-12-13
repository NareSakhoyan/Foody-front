import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

type NumberFieldProps = {
  label: string;
  value?: number;
  placeholder?: string;
  onChange: (value?: number) => void;
  max?: number;
};

export const NumberField = ({
  label,
  value,
  placeholder,
  onChange,
  max,
}: NumberFieldProps) => {
  const handleChange = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      onChange(undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(
      0,
      max !== undefined ? Math.min(parsed, max) : parsed,
    );
    onChange(clamped);
  };

  return (
    <label className="grid gap-1 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />
    </label>
  );
};

type SliderFieldProps = {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (val: number) => string;
  onChange: (value?: number) => void;
};

export const SliderField = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  formatValue = (val) => String(val),
  onChange,
}: SliderFieldProps) => {
  const current = value ?? min;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground">
            {formatValue(current)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChange(undefined)}
            aria-label={`Clear ${label}`}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
      <div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[current]}
          onValueChange={(vals) => onChange(vals[0] ?? min)}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

type IngredientSelectorProps = {
  label: string;
  placeholder: string;
  items: string[];
  suggestions: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
};

export const IngredientSelector = ({
  label,
  placeholder,
  items,
  suggestions,
  onAdd,
  onRemove,
}: IngredientSelectorProps) => {
  const [draft, setDraft] = useState('');
  const displaySuggestions = suggestions.slice(0, 10);

  const handleAdd = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-48"
        />
        <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
              <button
                type="button"
                className="ml-1 inline-flex rounded-full p-0.5 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onRemove(item)}
                aria-label={`Remove ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No filters yet</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Suggestions:</span>
        {displaySuggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="rounded-full border px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => onAdd(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
