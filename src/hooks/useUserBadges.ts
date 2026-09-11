'use client';

import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUserReviews, useUserVisits, useUserFavorites } from '@/hooks/useShops';
import {
  BadgeTier,
  CategoryBadge,
  computeTier,
  computeCategoryBadges,
  computeTotalContributions,
  TIER_THRESHOLDS,
} from '@/lib/utils/badges';

const TIER_ORDER: Record<BadgeTier, number> = {
  dong: 0,
  bac: 1,
  vang: 2,
  'kim-cuong': 3,
};

export interface UseUserBadgesReturn {
  totalContributions: number;
  tier: BadgeTier;
  label: string;
  nextTier: BadgeTier | null;
  nextTierLabel: string | null;
  nextThreshold: number | null;
  progressPercent: number;
  remaining: number;
  categoryBadges: CategoryBadge[];
  isLoading: boolean;
}

export function useUserBadges(): UseUserBadgesReturn {
  const { isAuthenticated } = useAuth();
  const reviewsQuery = useUserReviews();
  const visitsQuery = useUserVisits();
  const favoritesQuery = useUserFavorites();

  const reviewCount = reviewsQuery.data?.length ?? 0;
  const visitCount = visitsQuery.data?.length ?? 0;
  const favoriteCount = favoritesQuery.data?.length ?? 0;

  const totalContributions = useMemo(() => {
    return computeTotalContributions({
      reviews: reviewCount,
      visits: visitCount,
      favorites: favoriteCount,
    });
  }, [reviewCount, visitCount, favoriteCount]);

  const computedTier = useMemo(() => {
    return computeTier(totalContributions);
  }, [totalContributions]);

  const categoryBadges = useMemo(() => {
    return computeCategoryBadges({
      reviews: reviewCount,
      visits: visitCount,
      favorites: favoriteCount,
    });
  }, [reviewCount, visitCount, favoriteCount]);

  // Loading flag: true if any query is loading and lacks cached data
  const isLoading =
    (reviewsQuery.isLoading && !reviewsQuery.data) ||
    (visitsQuery.isLoading && !visitsQuery.data) ||
    (favoritesQuery.isLoading && !favoritesQuery.data);

  // Milestone unlock celebration toast
  useEffect(() => {
    if (isLoading || !isAuthenticated || typeof window === 'undefined') return;

    // PERSISTENCE KEY RATIONALE:
    // 'phinfind:last-badge-tier' is stored in localStorage instead of a database column
    // because badge celebrations are client-side UX micro-delights tied to the user's
    // active browser session. Storing it in localStorage avoids unnecessary DB schema
    // migrations and write mutations simply for UI toast celebration flags.
    const STORAGE_KEY = 'phinfind:last-badge-tier';
    const storedTier = localStorage.getItem(STORAGE_KEY) as BadgeTier | null;

    if (!storedTier) {
      // First visit: initialize stored tier silently without firing toast
      localStorage.setItem(STORAGE_KEY, computedTier.tier);
      return;
    }

    const currentRank = TIER_ORDER[computedTier.tier] ?? 0;
    const storedRank = TIER_ORDER[storedTier] ?? 0;

    if (currentRank > storedRank) {
      toast.success('Chúc mừng! Bạn đã lên hạng', {
        description: `Bạn đã xuất sắc đạt hạng ${computedTier.label}!`,
        duration: 5000,
      });
      localStorage.setItem(STORAGE_KEY, computedTier.tier);
    } else if (currentRank < storedRank) {
      // Reset silently if contributions decreased
      localStorage.setItem(STORAGE_KEY, computedTier.tier);
    }
  }, [computedTier.tier, computedTier.label, isLoading, isAuthenticated]);

  const nextTierLabel = computedTier.nextTier
    ? TIER_THRESHOLDS[computedTier.nextTier]?.label ?? null
    : null;

  return {
    totalContributions,
    tier: computedTier.tier,
    label: computedTier.label,
    nextTier: computedTier.nextTier,
    nextTierLabel,
    nextThreshold: computedTier.nextThreshold,
    progressPercent: computedTier.progressPercent,
    remaining: computedTier.remaining,
    categoryBadges,
    isLoading,
  };
}
