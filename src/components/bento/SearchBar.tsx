'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore();
  const [localValue, setLocalValue] = useState(searchQuery);

  // Synchronize local input state with global store updates (e.g. resetFilters, header)
  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  // Debounce updates to global store to prevent excessive re-renders while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== searchQuery) {
        setSearchQuery(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, searchQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalValue('');
    setSearchQuery('');
  };

  return (
    <div className="relative w-full group">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-gold z-10 pointer-events-none transition-all duration-200 ease-out group-focus-within:text-amber-gold-hover group-focus-within:scale-105"
        aria-hidden="true"
      />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Tìm quán cà phê theo tên, đường phố hoặc quận..."
        aria-label="Tìm quán cà phê theo tên, đường phố hoặc quận"
        className="w-full h-9 pl-9 pr-8 text-xs bg-input-bg text-foreground border-input rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold/60 focus-visible:ring-offset-0 focus-visible:border-amber-gold/60 focus-visible:shadow-[0_0_0_1px_rgba(184,134,11,0.25)] focus-visible:scale-[1.005] hover:border-amber-gold/40 shadow-xs transition-all duration-200 ease-out placeholder:text-muted-foreground"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
          aria-label="Xóa nội dung tìm kiếm"
        >
          <X size={12} />
        </Button>
      )}
    </div>
  );
}
