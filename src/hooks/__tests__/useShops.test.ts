import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrendingShops, useNewShops } from '../useShops';

const mockUseQuery = vi.fn();

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: (...args: any[]) => mockUseQuery(...args),
  };
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/supabase/shops', () => ({
  fetchTrendingShops: vi.fn(),
  fetchNewShops: vi.fn(),
}));

describe('useTrendingShops and useNewShops hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTrendingShops', () => {
    it('fires useQuery with default query key, 5min staleTime, and refetchOnWindowFocus false', () => {
      renderHook(() => useTrendingShops());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['shops', 'trending', 7, 10],
          staleTime: 5 * 60 * 1000,
          enabled: true,
          refetchOnWindowFocus: false,
        })
      );
    });

    it('fires useQuery with custom daysBack, limit, and coordinates in query key', () => {
      renderHook(() => useTrendingShops(14, 5, 21.03, 105.85));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['shops', 'trending', 14, 5, 21.03, 105.85],
          staleTime: 5 * 60 * 1000,
          enabled: true,
          refetchOnWindowFocus: false,
        })
      );
    });
  });

  describe('useNewShops', () => {
    it('fires useQuery with default query key, 5min staleTime, and refetchOnWindowFocus false', () => {
      renderHook(() => useNewShops());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['shops', 'new', 10],
          staleTime: 5 * 60 * 1000,
          enabled: true,
          refetchOnWindowFocus: false,
        })
      );
    });

    it('fires useQuery with custom limit and coordinates in query key', () => {
      renderHook(() => useNewShops(8, 10.82, 106.63));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['shops', 'new', 8, 10.82, 106.63],
          staleTime: 5 * 60 * 1000,
          enabled: true,
          refetchOnWindowFocus: false,
        })
      );
    });
  });
});
