'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="relative w-full group">
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-gold z-10 pointer-events-none transition-all duration-200 ease-out group-focus-within:text-amber-gold-hover group-focus-within:scale-105"
        aria-hidden="true"
      />
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search coffee shops by name, street, or district..."
        aria-label="Search coffee shops by name, street, or district"
        className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-dark-roast text-cream-white border-dark-border rounded-2xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold/60 focus-visible:ring-offset-0 focus-visible:border-amber-gold/60 focus-visible:shadow-[0_0_0_1px_rgba(212,160,87,0.25)] focus-visible:scale-[1.005] hover:border-amber-gold/40 shadow-inner transition-all duration-200 ease-out placeholder:text-warm-gray"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-warm-gray hover:text-cream-white hover:bg-dark-bg rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
          aria-label="Clear search query"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}


