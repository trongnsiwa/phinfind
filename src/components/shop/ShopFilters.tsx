'use client';

import { Filter, Map, List } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/stores/useUIStore';

export function ShopFilters() {
  const { viewMode, setViewMode, filters, setFilters } = useUIStore();

  return (
    <div className="flex items-center justify-between gap-2 py-2 flex-wrap">
      {/* View Toggle */}
      <div className="flex items-center bg-phin-100 p-1 rounded-xl border border-phin-200">
        <button
          onClick={() => setViewMode('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'map'
              ? 'bg-white text-primary shadow-sm'
              : 'text-phin-700 hover:text-phin-900'
          }`}
        >
          <Map size={14} />
          Map View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'list'
              ? 'bg-white text-primary shadow-sm'
              : 'text-phin-700 hover:text-phin-900'
          }`}
        >
          <List size={14} />
          List View
        </button>
      </div>

      {/* Filter Quick Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={filters.openNowOnly ? 'primary' : 'outline'}
          size="sm"
          className="text-xs h-8 rounded-lg"
          onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
        >
          <Filter size={12} />
          {filters.openNowOnly ? 'Open Now Only' : 'All Shops'}
        </Button>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ sortBy: e.target.value as any })}
          className="h-8 px-2.5 text-xs font-medium bg-white text-phin-900 border border-phin-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="distance">Sort by Distance</option>
          <option value="rating">Sort by Rating</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>
    </div>
  );
}
