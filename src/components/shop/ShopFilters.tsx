'use client';

import { Filter, Map, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUIStore } from '@/stores/useUIStore';

export function ShopFilters() {
  const { viewMode, setViewMode, filters, setFilters, resetFilters } = useUIStore();

  return (
    <div className="flex items-center justify-between gap-2 py-2 flex-wrap">
      {/* View Toggle using Tabs */}
      <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as 'map' | 'list')}>
        <TabsList className="bg-phin-100 p-1 rounded-xl border border-phin-200 h-9">
          <TabsTrigger
            value="map"
            className="flex items-center gap-1.5 px-3 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg"
          >
            <Map size={14} />
            Bản đồ
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="flex items-center gap-1.5 px-3 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg"
          >
            <List size={14} />
            Danh sách
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Desktop Filter Controls */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="open-now-desktop"
            checked={filters.openNowOnly}
            onCheckedChange={(checked) => setFilters({ openNowOnly: checked })}
          />
          <Label htmlFor="open-now-desktop" className="text-xs font-medium text-phin-900 cursor-pointer">
            Chỉ quán đang mở cửa
          </Label>
        </div>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters({ sortBy: value as 'distance' | 'rating' | 'name' })}
        >
          <SelectTrigger className="h-9 w-40 text-xs font-medium bg-white text-phin-900 border-phin-200">
            <SelectValue placeholder="Sắp xếp theo..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-phin-200">
            <SelectItem value="distance">Khoảng cách</SelectItem>
            <SelectItem value="rating">Đánh giá</SelectItem>
            <SelectItem value="name">Tên quán</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Filter Sheet Button */}
      <div className="sm:hidden flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-xs border-phin-200">
              <SlidersHorizontal size={14} className="mr-1.5" />
              Bộ lọc
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-white rounded-t-2xl border-t border-phin-200 p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="font-sans text-lg text-phin-900">Lọc Quán Cà Phê</SheetTitle>
              <SheetDescription className="text-xs text-phin-600">
                Tùy chỉnh tiêu chí tìm kiếm và sắp xếp kết quả
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="open-now-mobile" className="text-sm font-medium text-phin-900">
                  Chỉ quán đang mở cửa
                </Label>
                <Switch
                  id="open-now-mobile"
                  checked={filters.openNowOnly}
                  onCheckedChange={(checked) => setFilters({ openNowOnly: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-phin-900">Sắp xếp theo</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters({ sortBy: value as 'distance' | 'rating' | 'name' })}
                >
                  <SelectTrigger className="w-full text-xs bg-white border-phin-200">
                    <SelectValue placeholder="Sắp xếp theo..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-phin-200">
                    <SelectItem value="distance">Khoảng cách</SelectItem>
                    <SelectItem value="rating">Đánh giá</SelectItem>
                    <SelectItem value="name">Tên quán</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <Label className="text-sm font-medium text-phin-900">Đánh giá tối thiểu</Label>
                  <span className="text-phin-600 font-semibold">{filters.minRating || 0} ⭐</span>
                </div>
                <Slider
                  value={[filters.minRating || 0]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={([val]) => setFilters({ minRating: val })}
                  className="py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  Đặt lại
                </Button>
                <Button variant="default" className="flex-1 bg-phin-800 text-white">
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
