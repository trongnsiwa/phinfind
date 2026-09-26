'use client';

import { useMemo, useState } from 'react';
import { useUserVisits, useUserReviews, useUserFavorites } from '@/hooks/useShops';
import { useUserBadges } from '@/hooks/useUserBadges';
import { computeRecap, type RecapStats } from '@/lib/recap/computeRecap';

export interface UseRecapReturn {
  data: RecapStats | null;
  isLoading: boolean;
  error: Error | null;
  availableYears: number[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

export function useRecap(initialYear?: number): UseRecapReturn {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear ?? currentYear);

  const visitsQuery = useUserVisits();
  const reviewsQuery = useUserReviews();
  const favoritesQuery = useUserFavorites();
  const badgeData = useUserBadges();

  const visits = visitsQuery.data;
  const reviews = reviewsQuery.data;
  const favorites = favoritesQuery.data;

  // Extract all distinct years from the user's history
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);

    if (visits) {
      for (const v of visits) {
        const d = new Date(v.visited_at || v.created_at);
        if (!isNaN(d.getTime())) {
          yearsSet.add(d.getFullYear());
        }
      }
    }

    if (reviews) {
      for (const r of reviews) {
        const d = new Date(r.created_at);
        if (!isNaN(d.getTime())) {
          yearsSet.add(d.getFullYear());
        }
      }
    }

    if (favorites) {
      for (const f of favorites) {
        if (f.created_at) {
          const d = new Date(f.created_at);
          if (!isNaN(d.getTime())) {
            yearsSet.add(d.getFullYear());
          }
        }
      }
    }

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [visits, reviews, favorites, currentYear]);

  // Derive recap statistics for the currently selected year
  const data = useMemo(() => {
    return computeRecap({
      year: selectedYear,
      visits: visits || [],
      reviews: reviews || [],
      favorites: favorites || [],
      tier_label: badgeData.label || 'Đồng',
    });
  }, [selectedYear, visits, reviews, favorites, badgeData.label]);

  const isLoading =
    (!visits && !visitsQuery.error) ||
    (!reviews && !reviewsQuery.error) ||
    (!favorites && !favoritesQuery.error) ||
    Boolean(badgeData.isLoading) ||
    visitsQuery.isLoading ||
    reviewsQuery.isLoading ||
    favoritesQuery.isLoading;

  const error = (visitsQuery.error || reviewsQuery.error || favoritesQuery.error) as Error | null;

  return {
    data,
    isLoading,
    error,
    availableYears,
    selectedYear,
    setSelectedYear,
  };
}
