import { cleanCategoryLabel } from '@/lib/utils/placeholders';
import type { VisitedShopItem, SavedShopItem, ReviewData } from '@/hooks/useShops';

export interface RecapTopCategory {
  category: string;
  count: number;
}

export interface RecapBusiestMonth {
  month: number;
  name: string;
  count: number;
}

export interface RecapFirstVisit {
  shop_name: string;
  visited_at: string;
  place_id: string;
  slug?: string | null;
}

export interface RecapTopShop {
  shop_name: string;
  count: number;
  place_id: string;
  slug?: string | null;
  address?: string | null;
  photo?: string | null;
}

export interface RecapTopReviewedShop {
  shop_name: string;
  rating: number;
  place_id: string;
  slug?: string | null;
}

export interface RecapStats {
  year: number;
  total_visits: number;
  total_reviews: number;
  total_favorites: number;
  unique_shops_visited: number;
  top_category: RecapTopCategory | null;
  top_price_range: string | null;
  longest_streak_days: number;
  busiest_month: RecapBusiestMonth | null;
  first_visit: RecapFirstVisit | null;
  top_shop: RecapTopShop | null;
  top_reviewed_shop: RecapTopReviewedShop | null;
  tier_label: string;
}

export interface ComputeRecapInput {
  year: number;
  visits?: VisitedShopItem[];
  reviews?: ReviewData[];
  favorites?: SavedShopItem[];
  tier_label?: string;
}

function parseYear(dateString?: string | null): number | null {
  if (!dateString) return null;
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d.getFullYear();
}

function getUtcMidnight(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Pure calculation function that derives yearly PhinFind Recap metrics
 * from visits, reviews, and saved shops collections.
 */
export function computeRecap({
  year,
  visits = [],
  reviews = [],
  favorites = [],
  tier_label = 'Đồng',
}: ComputeRecapInput): RecapStats {
  // 1. Filter collections by target year
  const yearVisits = visits.filter((v) => {
    const y = parseYear(v.visited_at || v.created_at);
    return y === year;
  });

  const yearReviews = reviews.filter((r) => {
    const y = parseYear(r.created_at);
    return y === year;
  });

  const yearFavorites = favorites.filter((f) => {
    const y = parseYear(f.created_at);
    return y === year;
  });

  const total_visits = yearVisits.length;
  const total_reviews = yearReviews.length;
  const total_favorites = yearFavorites.length;

  // 2. Unique shops visited
  const uniquePlaceIds = new Set(
    yearVisits.map((v) => v.shop_place_id).filter(Boolean)
  );
  const unique_shops_visited = uniquePlaceIds.size;

  // 3. Longest visit streak in calendar days
  let longest_streak_days = 0;
  if (yearVisits.length > 0) {
    const uniqueDayTimestamps = Array.from(
      new Set(
        yearVisits
          .map((v) => {
            const d = new Date(v.visited_at || v.created_at);
            return isNaN(d.getTime()) ? null : getUtcMidnight(d);
          })
          .filter((t): t is number => t !== null)
      )
    ).sort((a, b) => a - b);

    if (uniqueDayTimestamps.length > 0) {
      longest_streak_days = 1;
      let currentStreak = 1;
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      for (let i = 1; i < uniqueDayTimestamps.length; i++) {
        const diff = uniqueDayTimestamps[i] - uniqueDayTimestamps[i - 1];
        if (diff === ONE_DAY_MS) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        if (currentStreak > longest_streak_days) {
          longest_streak_days = currentStreak;
        }
      }
    }
  }

  // 4. Busiest month (visits preferred, fallback to reviews if 0 visits)
  let busiest_month: RecapBusiestMonth | null = null;
  const monthCounts = new Map<number, number>();

  const primaryMonthSource = yearVisits.length > 0
    ? yearVisits.map((v) => new Date(v.visited_at || v.created_at))
    : yearReviews.map((r) => new Date(r.created_at));

  for (const date of primaryMonthSource) {
    if (!isNaN(date.getTime())) {
      const month = date.getMonth() + 1; // 1-12
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    }
  }

  if (monthCounts.size > 0) {
    let bestMonth = 1;
    let maxCount = -1;

    // Ordered 1 to 12 for deterministic tie-breaker (earliest month wins)
    for (let m = 1; m <= 12; m++) {
      const count = monthCounts.get(m) || 0;
      if (count > maxCount && count > 0) {
        maxCount = count;
        bestMonth = m;
      }
    }

    if (maxCount > 0) {
      busiest_month = {
        month: bestMonth,
        name: `Tháng ${bestMonth}`,
        count: maxCount,
      };
    }
  }

  // 5. Top category across visited shops
  let top_category: RecapTopCategory | null = null;
  const categoryCounts = new Map<string, number>();

  for (const v of yearVisits) {
    const rawCategories = v.shop?.categories;
    if (Array.isArray(rawCategories)) {
      for (const cat of rawCategories) {
        if (typeof cat === 'string' && cat.trim()) {
          const cleaned = cleanCategoryLabel(cat);
          if (cleaned) {
            categoryCounts.set(cleaned, (categoryCounts.get(cleaned) || 0) + 1);
          }
        }
      }
    }
  }

  if (categoryCounts.size > 0) {
    let topCatName = '';
    let topCatCount = -1;
    for (const [name, count] of categoryCounts.entries()) {
      if (count > topCatCount) {
        topCatCount = count;
        topCatName = name;
      }
    }
    if (topCatCount > 0) {
      top_category = { category: topCatName, count: topCatCount };
    }
  }

  // 6. Top price range across visited shops
  let top_price_range: string | null = null;
  const priceRangeCounts = new Map<string, number>();

  for (const v of yearVisits) {
    const pr = v.shop?.price_range;
    if (typeof pr === 'string' && pr.trim()) {
      const cleanPr = pr.trim();
      priceRangeCounts.set(cleanPr, (priceRangeCounts.get(cleanPr) || 0) + 1);
    }
  }

  if (priceRangeCounts.size > 0) {
    let topRange = '';
    let topRangeCount = -1;
    for (const [range, count] of priceRangeCounts.entries()) {
      if (count > topRangeCount) {
        topRangeCount = count;
        topRange = range;
      }
    }
    if (topRangeCount > 0) {
      top_price_range = topRange;
    }
  }

  // 7. First visit of the year (chronological earliest)
  let first_visit: RecapFirstVisit | null = null;
  if (yearVisits.length > 0) {
    const sortedVisits = [...yearVisits].sort((a, b) => {
      const timeA = new Date(a.visited_at || a.created_at).getTime();
      const timeB = new Date(b.visited_at || b.created_at).getTime();
      return timeA - timeB;
    });

    const first = sortedVisits[0];
    first_visit = {
      shop_name: first.shop_name || first.shop?.name || 'Quán Cà Phê',
      visited_at: first.visited_at || first.created_at,
      place_id: first.shop_place_id,
      slug: first.shop?.slug || null,
    };
  }

  // 8. Top shop (most visits, tie-breaker: earliest visit in year)
  let top_shop: RecapTopShop | null = null;
  if (yearVisits.length > 0) {
    interface ShopAggregate {
      shop_name: string;
      count: number;
      place_id: string;
      slug?: string | null;
      address?: string | null;
      photo?: string | null;
      firstVisitedAt: number;
    }

    const shopMap = new Map<string, ShopAggregate>();

    for (const v of yearVisits) {
      const placeId = v.shop_place_id;
      if (!placeId) continue;

      const visitTime = new Date(v.visited_at || v.created_at).getTime();
      const existing = shopMap.get(placeId);

      if (existing) {
        existing.count++;
        if (visitTime < existing.firstVisitedAt) {
          existing.firstVisitedAt = visitTime;
        }
      } else {
        shopMap.set(placeId, {
          shop_name: v.shop_name || v.shop?.name || 'Quán Cà Phê',
          count: 1,
          place_id: placeId,
          slug: v.shop?.slug || null,
          address: v.shop_address || v.shop?.address || null,
          photo: v.shop?.photos?.[0] || null,
          firstVisitedAt: visitTime,
        });
      }
    }

    const aggregates = Array.from(shopMap.values());
    if (aggregates.length > 0) {
      aggregates.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count; // Most visits first
        }
        return a.firstVisitedAt - b.firstVisitedAt; // Earliest visit wins ties
      });

      const best = aggregates[0];
      top_shop = {
        shop_name: best.shop_name,
        count: best.count,
        place_id: best.place_id,
        slug: best.slug,
        address: best.address,
        photo: best.photo,
      };
    }
  }

  // 9. Top reviewed shop (highest rating, tie-breaker: most recent)
  let top_reviewed_shop: RecapTopReviewedShop | null = null;
  if (yearReviews.length > 0) {
    const sortedReviews = [...yearReviews].sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating; // Highest rating first
      }
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA; // Most recent review wins ties
    });

    const bestReview = sortedReviews[0];
    top_reviewed_shop = {
      shop_name: bestReview.shop_name || 'Quán Cà Phê',
      rating: bestReview.rating,
      place_id: bestReview.shop_place_id,
      slug: bestReview.shop_slug || null,
    };
  }

  return {
    year,
    total_visits,
    total_reviews,
    total_favorites,
    unique_shops_visited,
    top_category,
    top_price_range,
    longest_streak_days,
    busiest_month,
    first_visit,
    top_shop,
    top_reviewed_shop,
    tier_label,
  };
}
