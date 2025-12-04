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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
};

type ComboboxAdvancedProps = {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  autoFocus?: boolean;
};

function ComboboxAdvanced({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  emptyText = 'No options',
  className,
  autoFocus = false,
}: ComboboxAdvancedProps) {
  const [inputValue, setInputValue] = React.useState('');
  const selected = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (selected) {
      setInputValue(selected.label);
    }
  }, [selected]);

  const filteredOptions = React.useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => {
      const haystack = `${opt.label} ${opt.value}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [inputValue, options]);

  const handleSelect = (val: string) => {
    const match = options.find((opt) => opt.value === val);
    if (match) {
      setInputValue(match.label);
    }
    onChange?.(val);
    setOpen(false);
  };

  const handleEnter = () => {
    const trimmed = inputValue.trim();
    const match = filteredOptions[0] || (trimmed ? { value: trimmed } : null);
    if (match) {
      handleSelect(match.value);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && selected) {
          setInputValue(selected.label);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className,
          )}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
            {selected ? selected.label : placeholder}
          </span>
          <span aria-hidden className="text-xs text-muted-foreground">Enter</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onFocus={() => setHasInteracted(true)}
            onKeyDown={(e) => {
              setHasInteracted(true);
              if (e.key === 'Enter') {
                e.preventDefault();
                handleEnter();
              }
            }}
            onValueChange={(val) => {
              setHasInteracted(true);
              setInputValue(val);
            }}
            autoFocus={autoFocus}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {filteredOptions.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={`${opt.value} ${opt.label}`}
                  onSelect={() => handleSelect(opt.value)}
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
      </PopoverContent>
    </Popover>
  );
}

export { ComboboxAdvanced };
