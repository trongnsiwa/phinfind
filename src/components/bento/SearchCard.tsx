'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';

export function SearchCard() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <Card className="col-span-2 row-span-1 bg-white rounded-3xl border border-phin-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-phin-100 flex items-center justify-center text-primary flex-shrink-0">
          <Search size={16} />
        </div>
        <div>
          <h4 className="font-sans font-bold text-xs text-phin-900 leading-tight">Tìm kiếm nhanh</h4>
          <p className="text-[10px] text-phin-600">Tìm quán theo tên hoặc địa chỉ</p>
        </div>
      </div>

      <div className="relative w-full mt-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Nhập tên quán, khu vực hoặc đường phố..."
          className="w-full h-10 pl-3 pr-8 text-xs bg-phin-50 text-phin-900 border-phin-200 rounded-xl focus-visible:ring-primary focus-visible:bg-white"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-phin-400 hover:text-phin-800 rounded-full"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <X size={14} />
          </Button>
        )}
      </div>
    </Card>
  );
}
