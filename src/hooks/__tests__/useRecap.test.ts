import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecap } from '../useRecap';
import { useUserVisits, useUserReviews, useUserFavorites } from '@/hooks/useShops';
import { useUserBadges } from '@/hooks/useUserBadges';

vi.mock('@/hooks/useShops', () => ({
  useUserVisits: vi.fn(),
  useUserReviews: vi.fn(),
  useUserFavorites: vi.fn(),
}));

vi.mock('@/hooks/useUserBadges', () => ({
  useUserBadges: vi.fn(),
}));

describe('useRecap Hook (Tier 3.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUserBadges).mockReturnValue({
      totalContributions: 60,
      tier: 'vang',
      label: 'Vàng',
      nextTier: 'kim-cuong',
      nextTierLabel: 'Kim Cương',
      nextThreshold: 200,
      progressPercent: 6,
      remaining: 140,
      categoryBadges: [],
      isLoading: false,
    });

    vi.mocked(useUserVisits).mockReturnValue({
      data: [
        {
          id: 'v1',
          user_id: 'u1',
          shop_place_id: 's1',
          shop_name: 'Quán 2025',
          visited_at: '2025-06-15T00:00:00Z',
          created_at: '2025-06-15T00:00:00Z',
        },
        {
          id: 'v2',
          user_id: 'u1',
          shop_place_id: 's2',
          shop_name: 'Quán 2026',
          visited_at: '2026-02-10T00:00:00Z',
          created_at: '2026-02-10T00:00:00Z',
        },
      ],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUserReviews).mockReturnValue({
      data: [
        {
          id: 'r1',
          user_id: 'u1',
          shop_place_id: 's2',
          shop_name: 'Quán 2026',
          rating: 5,
          comment: 'Tuyệt vời',
          author: 'Me',
          created_at: '2026-02-11T00:00:00Z',
        },
      ],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUserFavorites).mockReturnValue({
      data: [
        {
          id: 'f1',
          user_id: 'u1',
          place_id: 's3',
          name: 'Quán Đã Lưu',
          created_at: '2024-11-05T00:00:00Z',
        },
      ],
      isLoading: false,
      error: null,
    } as any);
  });

  it('aggregates available years and defaults to current year', () => {
    const { result } = renderHook(() => useRecap());

    const currentYear = new Date().getFullYear();
    expect(result.current.selectedYear).toBe(currentYear);
    // Should include 2026, 2025, 2024 and currentYear
    expect(result.current.availableYears).toContain(2026);
    expect(result.current.availableYears).toContain(2025);
    expect(result.current.availableYears).toContain(2024);
    expect(result.current.availableYears[0]).toBeGreaterThanOrEqual(result.current.availableYears[1]);
  });

  it('computes recap for specified initialYear', () => {
    const { result } = renderHook(() => useRecap(2025));

    expect(result.current.selectedYear).toBe(2025);
    expect(result.current.data?.total_visits).toBe(1);
    expect(result.current.data?.first_visit?.shop_name).toBe('Quán 2025');
  });

  it('updates recap data when switching selectedYear', () => {
    const { result } = renderHook(() => useRecap(2026));

    expect(result.current.selectedYear).toBe(2026);
    expect(result.current.data?.total_visits).toBe(1);
    expect(result.current.data?.total_reviews).toBe(1);
    expect(result.current.data?.first_visit?.shop_name).toBe('Quán 2026');

    act(() => {
      result.current.setSelectedYear(2025);
    });

    expect(result.current.selectedYear).toBe(2025);
    expect(result.current.data?.total_visits).toBe(1);
    expect(result.current.data?.total_reviews).toBe(0);
    expect(result.current.data?.first_visit?.shop_name).toBe('Quán 2025');
  });

  it('reflects isLoading correctly when queries are pending', () => {
    vi.mocked(useUserVisits).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const { result } = renderHook(() => useRecap());
    expect(result.current.isLoading).toBe(true);
  });
});
