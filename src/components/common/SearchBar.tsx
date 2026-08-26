'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { CoffeeShop } from '@/types/shop';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: CoffeeShop[];
  onSelectSuggestion?: (shop: CoffeeShop) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  suggestions = [],
  onSelectSuggestion,
  placeholder = 'Tìm tên quán cà phê hoặc địa chỉ...',
  className,
}: SearchBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative w-full ${className || ''}`}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-phin-500 z-10" />
          <Input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className="w-full h-10 pl-9 pr-4 text-xs bg-white text-phin-900 border-phin-200 rounded-xl focus-visible:ring-primary shadow-sm"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-phin-200 shadow-md">
        <Command>
          <CommandList>
            <CommandGroup heading="Gợi ý tìm kiếm">
              {suggestions.map((shop) => (
                <CommandItem
                  key={shop.id}
                  onSelect={() => {
                    onSelectSuggestion?.(shop);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between text-xs cursor-pointer text-phin-900 hover:bg-phin-50"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{shop.name}</span>
                    <span className="text-[10px] text-phin-600 line-clamp-1">{shop.address}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium">⭐ {shop.rating}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
