import { useState, useEffect } from "react";

export interface DatasheetSearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function DatasheetSearchBar({ onSearch, initialValue = "" }: DatasheetSearchBarProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search datasheets..."
        className="flex-1 rounded-lg border border-border-glass bg-surface-card px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green focus:outline-none"
      />
    </div>
  );
}
