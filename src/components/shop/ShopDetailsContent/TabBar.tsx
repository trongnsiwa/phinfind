'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TabBarProps {
  onTabChange?: () => void;
  isStandalone?: boolean;
}

export function TabBar({ onTabChange, isStandalone }: TabBarProps) {
  return (
    <div className={cn('pt-1.5', isStandalone && 'sticky top-14 z-30 bg-card/95 backdrop-blur-md')}>
      <div className='relative'>
        {/* RESPONSIVE: tabs meet 44px touch target on mobile (< md), tightening to 40px on tablet/desktop */}
        <TabsList
          onClick={() => onTabChange?.()}
          className='flex items-center justify-between bg-transparent p-0 h-auto rounded-none w-full gap-2 mb-0'
        >
          <TabsTrigger
            value='overview'
            className='flex-1 min-h-[44px] md:min-h-[40px] pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center justify-center'
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value='photos'
            className='flex-1 min-h-[44px] md:min-h-[40px] pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center justify-center'
          >
            Hình ảnh
          </TabsTrigger>
          <TabsTrigger
            value='reviews'
            className='flex-1 min-h-[44px] md:min-h-[40px] pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center justify-center'
          >
            Đánh giá
          </TabsTrigger>
          <TabsTrigger
            value='amenities'
            className='flex-1 min-h-[44px] md:min-h-[40px] pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center justify-center'
          >
            Tiện ích
          </TabsTrigger>
          <TabsTrigger
            value='videos'
            className='flex-1 min-h-[44px] md:min-h-[40px] pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center justify-center'
          >
            Video
          </TabsTrigger>
        </TabsList>
        {/* Separator line flush with the bottom of the tabs */}
        <div className='absolute bottom-0 left-0 right-0 border-b border-border/50 pointer-events-none' />
      </div>
    </div>
  );
}
