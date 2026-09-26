'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Coffee,
  Flame,
  Heart,
  MapPin,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import type { RecapStats } from '@/lib/recap/computeRecap';
import { getShopPath } from '@/lib/utils/shopUrl';

export interface RecapHeroCardProps {
  recap: RecapStats | null;
  displayName: string;
  selectedYear: number;
}

export function RecapHeroCard({ recap, displayName, selectedYear }: RecapHeroCardProps) {
  return (
    <div className="recap-hero-card relative overflow-hidden rounded-3xl bg-card bg-gradient-to-br from-amber-500/5 via-card to-card dark:from-[#1C120C] dark:via-[#1C120C] dark:to-[#1C120C] dark:bg-[#1C120C] dark:bg-none border border-amber-gold/30 dark:border-[#3A2A1E] shadow-card dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-foreground dark:text-[#FFF8F0] transition-colors">
      {/* Header: Title & User Identity */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 dark:border-[#3A2A1E] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-gold/15 dark:bg-[#C98B3B]/20 border border-amber-gold/30 dark:border-[#C98B3B]/40 flex items-center justify-center text-amber-gold dark:text-[#C98B3B] shrink-0 shadow-2xs">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-gold dark:text-[#C98B3B] uppercase tracking-wider">
              PhinFind Recap {selectedYear}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground dark:text-white tracking-tight">
              Hành trình của {displayName}
            </h1>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-amber-gold/15 dark:bg-[#C98B3B]/15 border border-amber-gold/30 dark:border-[#C98B3B]/40 text-amber-gold dark:text-[#C98B3B] text-xs font-bold shadow-2xs">
          <Trophy size={14} />
          <span>Hạng {recap?.tier_label}</span>
        </div>
      </div>

      {/* Primary Stat Grid (2x3 on desktop, 1x2 on mobile) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 my-6">
        {/* Stat 1: Visits */}
        <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 hover:bg-secondary dark:hover:border-amber-gold/40 dark:hover:bg-[#241810] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground dark:text-[#A8927E] uppercase tracking-wider">
              Quán đã ghé
            </span>
            <MapPin size={16} className="text-amber-gold dark:text-[#C98B3B]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white">
              {recap?.total_visits} <span className="text-sm font-semibold text-amber-gold dark:text-[#C98B3B]">quán</span>
            </div>
            <div className="text-[11px] text-muted-foreground dark:text-white/60 mt-1">
              {recap?.unique_shops_visited} địa điểm độc đáo
            </div>
          </div>
        </div>

        {/* Stat 2: Reviews & Favorites */}
        <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 hover:bg-secondary dark:hover:border-amber-gold/40 dark:hover:bg-[#241810] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground dark:text-[#A8927E] uppercase tracking-wider">
              Đánh giá & Đã lưu
            </span>
            <Star size={16} className="text-amber-gold dark:text-[#C98B3B]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white">
              {recap?.total_reviews} <span className="text-sm font-semibold text-amber-gold dark:text-[#C98B3B]">đánh giá</span>
            </div>
            <div className="text-[11px] text-muted-foreground dark:text-white/60 mt-1">
              Cùng {recap?.total_favorites} quán yêu thích đã lưu
            </div>
          </div>
        </div>

        {/* Stat 3: Streak */}
        <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 hover:bg-secondary dark:hover:border-amber-gold/40 dark:hover:bg-[#241810] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground dark:text-[#A8927E] uppercase tracking-wider">
              Chuỗi liên tiếp
            </span>
            <Flame size={16} className="text-orange-500 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white">
              {recap?.longest_streak_days} <span className="text-sm font-semibold text-amber-gold dark:text-[#C98B3B]">ngày</span>
            </div>
            <div className="text-[11px] text-muted-foreground dark:text-white/60 mt-1">
              Kỷ lục check-in liên tục
            </div>
          </div>
        </div>

        {/* Stat 4: Top Category */}
        <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 hover:bg-secondary dark:hover:border-amber-gold/40 dark:hover:bg-[#241810] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground dark:text-[#A8927E] uppercase tracking-wider">
              Gu cà phê
            </span>
            <Coffee size={16} className="text-amber-gold dark:text-[#C98B3B]" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-amber-gold dark:text-[#C98B3B] truncate">
              {recap?.top_category?.category || 'Đa dạng chuẩn vị'}
            </div>
            <div className="text-[11px] text-muted-foreground dark:text-white/60 mt-1">
              {recap?.top_category ? `${recap.top_category.count} lượt trải nghiệm` : 'Khám phá mọi phong cách'}
            </div>
          </div>
        </div>

        {/* Stat 5: Busiest Month */}
        <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 hover:bg-secondary dark:hover:border-amber-gold/40 dark:hover:bg-[#241810] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground dark:text-[#A8927E] uppercase tracking-wider">
              Tháng sôi động
            </span>
            <Calendar size={16} className="text-amber-gold dark:text-[#C98B3B]" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-foreground dark:text-white">
              {recap?.busiest_month?.name || `Năm ${selectedYear}`}
            </div>
            <div className="text-[11px] text-muted-foreground dark:text-white/60 mt-1">
              {recap?.busiest_month ? `${recap.busiest_month.count} lượt ghé quán` : 'Khởi đầu hành trình mới'}
            </div>
          </div>
        </div>

        {/* Stat 6: Price Range */}
        <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 hover:bg-secondary dark:hover:border-amber-gold/40 dark:hover:bg-[#241810] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground dark:text-[#A8927E] uppercase tracking-wider">
              Mức giá quen thuộc
            </span>
            <Heart size={16} className="text-rose-500 dark:text-rose-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-foreground dark:text-white">
              {recap?.top_price_range || 'Phù hợp mọi túi tiền'}
            </div>
            <div className="text-[11px] text-muted-foreground dark:text-white/60 mt-1">
              Phân khúc quen thuộc nhất
            </div>
          </div>
        </div>
      </div>

      {/* Special Spotlights */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {/* Top Shop Spotlight */}
        {recap?.top_shop ? (
          <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-2xs">
            <div>
              <div className="text-[11px] font-bold text-amber-gold dark:text-[#C98B3B] uppercase tracking-wider mb-1">
                Quán ruột của bạn
              </div>
              <div className="text-base sm:text-lg font-bold text-foreground dark:text-white line-clamp-1">
                {recap.top_shop.shop_name}
              </div>
              {recap.top_shop.address ? (
                <div className="text-xs text-muted-foreground dark:text-white/60 line-clamp-1 mt-0.5">
                  {recap.top_shop.address}
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/80 dark:border-[#3A2A1E]">
              <span className="text-xs font-semibold text-foreground/80 dark:text-[#FDE68A]">
                {recap.top_shop.count} lần ghé thăm
              </span>
              <Link
                href={getShopPath({ slug: recap.top_shop.slug, place_id: recap.top_shop.place_id })}
                className="text-xs font-bold text-amber-gold dark:text-[#C98B3B] hover:underline inline-flex items-center gap-1 min-h-[44px] py-2 px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
              >
                Xem quán →
              </Link>
            </div>
          </div>
        ) : null}

        {/* First Visit Spotlight */}
        {recap?.first_visit ? (
          <div className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] hover:border-amber-gold/40 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-2xs">
            <div>
              <div className="text-[11px] font-bold text-amber-gold dark:text-[#C98B3B] uppercase tracking-wider mb-1">
                Điểm dừng chân đầu tiên
              </div>
              <div className="text-base sm:text-lg font-bold text-foreground dark:text-white line-clamp-1">
                {recap.first_visit.shop_name}
              </div>
              <div className="text-xs text-muted-foreground dark:text-white/60 mt-0.5">
                Khởi đầu vào ngày {new Date(recap.first_visit.visited_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div className="flex items-center justify-end mt-3 pt-2 border-t border-border/80 dark:border-[#3A2A1E]">
              <Link
                href={getShopPath({ slug: recap.first_visit.slug, place_id: recap.first_visit.place_id })}
                className="text-xs font-bold text-amber-gold dark:text-[#C98B3B] hover:underline inline-flex items-center gap-1 min-h-[44px] py-2 px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
              >
                Xem quán →
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer Tagline */}
      <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground dark:text-white/60 mt-6 pt-4 border-t border-border dark:border-[#3A2A1E]">
        <span>PhinFind - Bản đồ Cà phê Việt Chuẩn Gu</span>
        <span className="font-semibold text-amber-gold dark:text-[#C98B3B]">phinfind.com</span>
      </div>
    </div>
  );
}
