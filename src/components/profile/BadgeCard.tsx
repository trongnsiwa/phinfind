'use client';

import React from 'react';
import { Award, Bookmark, MapPin, Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BadgeTier, CategoryBadge, TIER_THRESHOLDS } from '@/lib/utils/badges';
import { cn } from '@/lib/utils';

export interface BadgeCardProps {
  tier: BadgeTier;
  label: string;
  totalContributions: number;
  progressPercent: number;
  remaining: number;
  nextTierLabel: string | null;
  categoryBadges: CategoryBadge[];
}

function getTierVisuals(tier: BadgeTier) {
  switch (tier) {
    case 'kim-cuong':
      return {
        bg: 'bg-gradient-to-br from-teal-500/20 via-cyan-500/15 to-emerald-500/20 border-teal-500/30 text-teal-500 dark:text-teal-400',
        dot: 'bg-teal-400',
        progress: 'bg-teal-500',
      };
    case 'vang':
      return {
        bg: 'bg-gradient-to-br from-amber-gold/25 via-amber-500/15 to-yellow-600/20 border-amber-gold/40 text-amber-gold',
        dot: 'bg-amber-gold',
        progress: 'bg-amber-gold',
      };
    case 'bac':
      return {
        bg: 'bg-gradient-to-br from-slate-400/20 via-slate-500/15 to-zinc-600/20 border-slate-400/30 text-slate-400 dark:text-slate-300',
        dot: 'bg-slate-400',
        progress: 'bg-slate-400',
      };
    case 'dong':
    default:
      return {
        bg: 'bg-gradient-to-br from-amber-700/20 via-amber-800/15 to-stone-700/20 border-amber-700/30 text-amber-700 dark:text-amber-600',
        dot: 'bg-amber-700',
        progress: 'bg-amber-700',
      };
  }
}

function getCategoryIcon(id: CategoryBadge['id']) {
  switch (id) {
    case 'reviewer':
      return <Star size={14} className="text-amber-500 shrink-0" />;
    case 'explorer':
      return <MapPin size={14} className="text-primary shrink-0" />;
    case 'curator':
      return <Bookmark size={14} className="text-rose-500 shrink-0" />;
  }
}

function getCategoryCountLabel(id: CategoryBadge['id'], count: number) {
  switch (id) {
    case 'reviewer':
      return `${count} đánh giá`;
    case 'explorer':
      return `${count} quán đã ghé`;
    case 'curator':
      return `${count} quán đã lưu`;
  }
}

export function BadgeCard({
  tier,
  label,
  totalContributions,
  progressPercent,
  remaining,
  nextTierLabel,
  categoryBadges,
}: BadgeCardProps) {
  const visuals = getTierVisuals(tier);
  const isMaxTier = tier === 'kim-cuong';

  return (
    <Card className="bg-card border-border rounded-2xl shadow-card p-4 sm:p-5 space-y-4">
      {/* 1. Top Row: Badge Emblem, Tier Heading & Contributions Description */}
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 transition-transform duration-300 hover:scale-105',
            visuals.bg
          )}
        >
          {isMaxTier ? <Sparkles size={28} /> : <Award size={28} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Hạng {label}
            </h3>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                visuals.bg
              )}
            >
              {totalContributions} điểm
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            Bạn đã tích lũy {totalContributions} điểm cống hiến cho cộng đồng
          </p>
        </div>
      </div>

      {/* 2. Progress Bar toward Next Tier */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-medium">Tiến trình nâng hạng</span>
          <span className="text-foreground font-bold">{progressPercent}%</span>
        </div>
        <Progress
          value={progressPercent}
          className="h-2 bg-secondary"
          indicatorClassName={visuals.progress}
        />
        <p className="text-[11px] text-muted-foreground/90 pt-0.5">
          {isMaxTier
            ? 'Bạn đã đạt cấp độ cao nhất. Cảm ơn sự cống hiến nhiệt huyết của bạn!'
            : `Còn ${remaining} điểm để lên hạng ${nextTierLabel || 'tiếp theo'}`}
        </p>
      </div>

      {/* 3. Category Badges Grid */}
      <div className="pt-2 border-t border-border/50">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
          Danh hiệu theo hoạt động
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {categoryBadges.map((badge) => {
            const catVisuals = getTierVisuals(badge.tier);
            const catTierLabel = TIER_THRESHOLDS[badge.tier].label;

            return (
              <div
                key={badge.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-background border border-border/60 shrink-0">
                  {getCategoryIcon(badge.id)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {badge.label}
                    </span>
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        catVisuals.dot
                      )}
                      title={`Hạng ${catTierLabel}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                    <span>{getCategoryCountLabel(badge.id, badge.count)}</span>
                    <span className="text-[10px] font-medium opacity-80">{catTierLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
