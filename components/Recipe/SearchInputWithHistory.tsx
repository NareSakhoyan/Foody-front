import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { SearchHistoryItem } from '@/lib/api/search-history';
import { SearchHistoryDropdown } from './SearchHistoryDropdown';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  historyEnabled: boolean;
  searchHistoryItems?: SearchHistoryItem[];
  searchHistoryLoading?: boolean;
  onSearchHistoryRefresh?: () => void;
  onSearchHistorySelect?: (entry: SearchHistoryItem) => void;
  onSearchHistoryDelete?: (id: string) => void;
  onSearchHistoryClear?: () => void;
};

export const SearchInputWithHistory = ({
  search,
  onSearchChange,
  historyEnabled,
  searchHistoryItems,
  searchHistoryLoading,
  onSearchHistoryRefresh,
  onSearchHistorySelect,
  onSearchHistoryDelete,
  onSearchHistoryClear,
}: Props) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!historyEnabled || !historyOpen) return;
    onSearchHistoryRefresh?.();
  }, [historyEnabled, historyOpen, onSearchHistoryRefresh]);

  useEffect(() => {
    if (!historyEnabled || !historyOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setHistoryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [historyEnabled, historyOpen]);

  return (
    <div className="relative w-full max-w-md flex-1" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-10"
        placeholder="Search recipes, ingredients, tags..."
        value={search}
        onChange={(e) => {
          onSearchChange(e.target.value);
          if (historyEnabled) setHistoryOpen(true);
        }}
        onFocus={() => {
          if (!historyEnabled) return;
          setHistoryOpen(true);
        }}
        onClick={() => {
          if (!historyEnabled) return;
          setHistoryOpen(true);
        }}
      />
      {historyEnabled && historyOpen ? (
        <SearchHistoryDropdown
          ref={dropdownRef}
          items={searchHistoryItems}
          loading={searchHistoryLoading}
          onSelect={onSearchHistorySelect}
          onDelete={onSearchHistoryDelete}
          onClear={onSearchHistoryClear}
        />
      ) : null}
    </div>
  );
};
