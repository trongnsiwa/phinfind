export type BadgeTier = 'dong' | 'bac' | 'vang' | 'kim-cuong';

export interface TierMeta {
  tier: BadgeTier;
  threshold: number;
  label: string;
  color: string;
  gradient: string;
}

export const TIER_THRESHOLDS: Record<BadgeTier, TierMeta> = {
  dong: {
    tier: 'dong',
    threshold: 0,
    label: 'Đồng',
    color: 'text-amber-700 dark:text-amber-600',
    gradient: 'from-amber-700/20 to-amber-900/30 border-amber-700/30',
  },
  bac: {
    tier: 'bac',
    threshold: 10,
    label: 'Bạc',
    color: 'text-slate-400 dark:text-slate-300',
    gradient: 'from-slate-400/20 to-slate-600/30 border-slate-400/30',
  },
  vang: {
    tier: 'vang',
    threshold: 50,
    label: 'Vàng',
    color: 'text-amber-gold',
    gradient: 'from-amber-gold/20 to-amber-500/30 border-amber-gold/40',
  },
  'kim-cuong': {
    tier: 'kim-cuong',
    threshold: 200,
    label: 'Kim Cương',
    color: 'text-teal-400 dark:text-teal-300',
    gradient: 'from-teal-400/20 to-cyan-600/30 border-teal-400/40',
  },
};

export const CATEGORY_THRESHOLDS = {
  reviewer: { dong: 0, bac: 3, vang: 15, kimCuong: 50 },
  explorer: { dong: 0, bac: 10, vang: 40, kimCuong: 150 },
  curator: { dong: 0, bac: 10, vang: 50, kimCuong: 200 },
} as const;

export interface ComputedTier {
  tier: BadgeTier;
  label: string;
  nextTier: BadgeTier | null;
  nextThreshold: number | null;
  progressPercent: number;
  remaining: number;
}

export interface CategoryBadge {
  id: 'reviewer' | 'explorer' | 'curator';
  label: string;
  tier: BadgeTier;
  count: number;
}

/**
 * Calculates weighted contribution points.
 * Weighting rationale:
 * - Reviews (3 pts): High friction activity requiring ratings, text evaluation, and photo uploads.
 * - Visits (1 pt): Verifies physical real-world presence and tracking.
 * - Favorites (1 pt): Lightweight bookmarking and shop curation.
 */
export function computeTotalContributions({
  reviews = 0,
  visits = 0,
  favorites = 0,
}: {
  reviews: number;
  visits: number;
  favorites: number;
}): number {
  return Math.max(0, reviews) * 3 + Math.max(0, visits) * 1 + Math.max(0, favorites) * 1;
}

/**
 * Computes overall user badge tier and progress toward the next tier threshold.
 */
export function computeTier(totalContributions: number): ComputedTier {
  const points = Math.max(0, totalContributions);

  if (points >= TIER_THRESHOLDS['kim-cuong'].threshold) {
    return {
      tier: 'kim-cuong',
      label: TIER_THRESHOLDS['kim-cuong'].label,
      nextTier: null,
      nextThreshold: null,
      progressPercent: 100,
      remaining: 0,
    };
  }

  if (points >= TIER_THRESHOLDS.vang.threshold) {
    const floor = TIER_THRESHOLDS.vang.threshold;
    const ceil = TIER_THRESHOLDS['kim-cuong'].threshold;
    const progressPercent = Math.min(100, Math.max(0, Math.round(((points - floor) / (ceil - floor)) * 100)));
    return {
      tier: 'vang',
      label: TIER_THRESHOLDS.vang.label,
      nextTier: 'kim-cuong',
      nextThreshold: ceil,
      progressPercent,
      remaining: ceil - points,
    };
  }

  if (points >= TIER_THRESHOLDS.bac.threshold) {
    const floor = TIER_THRESHOLDS.bac.threshold;
    const ceil = TIER_THRESHOLDS.vang.threshold;
    const progressPercent = Math.min(100, Math.max(0, Math.round(((points - floor) / (ceil - floor)) * 100)));
    return {
      tier: 'bac',
      label: TIER_THRESHOLDS.bac.label,
      nextTier: 'vang',
      nextThreshold: ceil,
      progressPercent,
      remaining: ceil - points,
    };
  }

  // Tier 'dong'
  const ceil = TIER_THRESHOLDS.bac.threshold;
  const progressPercent = Math.min(100, Math.max(0, Math.round((points / ceil) * 100)));
  return {
    tier: 'dong',
    label: TIER_THRESHOLDS.dong.label,
    nextTier: 'bac',
    nextThreshold: ceil,
    progressPercent,
    remaining: ceil - points,
  };
}

function resolveCategoryTier(
  count: number,
  thresholds: { dong: number; bac: number; vang: number; kimCuong: number }
): BadgeTier {
  if (count >= thresholds.kimCuong) return 'kim-cuong';
  if (count >= thresholds.vang) return 'vang';
  if (count >= thresholds.bac) return 'bac';
  return 'dong';
}

/**
 * Computes individual category badges for reviewer, explorer, and curator contribution styles.
 */
export function computeCategoryBadges({
  reviews = 0,
  visits = 0,
  favorites = 0,
}: {
  reviews: number;
  visits: number;
  favorites: number;
}): CategoryBadge[] {
  return [
    {
      id: 'reviewer',
      label: 'Người Đánh Giá',
      tier: resolveCategoryTier(reviews, CATEGORY_THRESHOLDS.reviewer),
      count: Math.max(0, reviews),
    },
    {
      id: 'explorer',
      label: 'Nhà Khám Phá',
      tier: resolveCategoryTier(visits, CATEGORY_THRESHOLDS.explorer),
      count: Math.max(0, visits),
    },
    {
      id: 'curator',
      label: 'Người Tuyển Chọn',
      tier: resolveCategoryTier(favorites, CATEGORY_THRESHOLDS.curator),
      count: Math.max(0, favorites),
    },
  ];
}
