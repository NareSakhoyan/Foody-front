import { useMemo } from 'react';
import { ComboboxAdvanced } from '@/components/ui/combobox-advanced';
import { MEASURE_UNITS } from './constants';

type MeasureUnitSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

function MeasureUnitSelect({
  value = '',
  onChange,
  placeholder = 'Measure unit',
  className,
  autoFocus = true,
}: MeasureUnitSelectProps) {
  const options = useMemo(() => {
    const hasCustomValue = value && !MEASURE_UNITS.some((u) => u.value === value);
    if (hasCustomValue) {
      return [{ value, label: value }, ...MEASURE_UNITS];
    }
    return MEASURE_UNITS;
  }, [value]);

  return (
    <ComboboxAdvanced
      options={options}
      value={value}
      onChange={(val) => onChange?.(val)}
      placeholder={`${placeholder}...`}
      emptyText="No units found"
      className={className}
      autoFocus={autoFocus}
    />
  );
}

export { MeasureUnitSelect };
