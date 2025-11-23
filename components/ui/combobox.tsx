import * as React from 'react';
import { Check } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
};

type ComboboxProps = {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  emptyText = 'No options',
  className,
}: ComboboxProps) {
  const selected = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );
  const [hasInteracted, setHasInteracted] = React.useState(false);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-md border bg-background text-left text-sm',
        className,
      )}
    >
      <Command>
        <CommandInput
          placeholder={placeholder}
          onKeyDown={() => setHasInteracted(true)}
          onValueChange={() => setHasInteracted(true)}
        />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.value}
                onSelect={() => onChange?.(opt.value)}
                onMouseEnter={() => setHasInteracted(true)}
                className={cn(
                  'cursor-pointer px-2 py-1.5 text-sm',
                  hasInteracted
                    ? 'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground'
                    : 'data-[selected=true]:bg-transparent data-[selected=true]:text-foreground',
                )}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === opt.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      {selected ? (
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          Selected: {selected.label}
        </div>
      ) : null}
    </div>
  );
}
