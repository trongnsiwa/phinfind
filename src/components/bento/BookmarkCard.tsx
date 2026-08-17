'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useShopStore } from '@/stores/useShopStore';
import { APP_ROUTES } from '@/lib/utils/constants';

export function BookmarkCard() {
  const { favorites } = useShopStore();

  return (
    <Link href={APP_ROUTES.FAVORITES} className="col-span-1 row-span-1 block group">
      <Card className="h-full bg-rose-50/70 border border-rose-200/80 rounded-3xl p-3.5 shadow-sm hover:shadow-card-hover hover:bg-rose-100/70 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-sm">
            <Heart size={16} className="fill-rose-500 animate-pulse" />
          </div>
          <ArrowUpRight size={16} className="text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-sans font-bold text-2xl text-rose-950 leading-none">
              {favorites.length}
            </span>
            <span className="text-[10px] text-rose-700 font-semibold uppercase tracking-wide">Saved</span>
          </div>
          <p className="text-[10px] text-rose-800/80 font-medium line-clamp-1 mt-0.5">Your bookmarked spots</p>
        </div>
      </Card>
    </Link>
  );
}
