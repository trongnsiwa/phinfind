'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUIStore } from '@/stores/useUIStore';

export function SortCard() {
  const { filters, setFilters } = useUIStore();

  return (
    <Card className="col-span-1 row-span-1 bg-white rounded-3xl border border-phin-200 shadow-sm p-3.5 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center gap-1.5 text-primary">
        <ArrowUpDown size={15} />
        <span className="font-sans font-bold text-xs text-phin-900">Sort By</span>
      </div>

      <Select
        value={filters.sortBy}
        onValueChange={(val) => setFilters({ sortBy: val as 'distance' | 'rating' | 'name' })}
      >
        <SelectTrigger className="h-8 text-xs font-semibold bg-phin-50 text-phin-900 border-phin-200 rounded-xl focus:ring-primary gap-1.5">
          <ArrowUpDown size={14} className="text-primary flex-shrink-0" />
          <SelectValue placeholder="Sort..." />
        </SelectTrigger>
        <SelectContent className="bg-white border-phin-200">
          <SelectItem value="distance">Distance</SelectItem>
          <SelectItem value="rating">Rating</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>
    </Card>
  );
}
