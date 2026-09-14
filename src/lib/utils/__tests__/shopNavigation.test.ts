import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clearShopQueryParam,
  closeActiveShop,
  markShopAsDeleted,
  isShopRecentlyDeleted,
} from '../shopNavigation';
import { useShopStore } from '@/stores/useShopStore';

describe('shopNavigation utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useShopStore.setState({
      selectedShop: {
        id: 'shop-123',
        place_id: 'place-123',
        name: 'Test Coffee',
        lat: 10.1,
        lon: 106.1,
      } as any,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('markShopAsDeleted and isShopRecentlyDeleted', () => {
    it('marks a shop id as recently deleted and expires after ttl', () => {
      expect(isShopRecentlyDeleted('shop-1')).toBe(false);

      markShopAsDeleted('shop-1', 1000);
      expect(isShopRecentlyDeleted('shop-1')).toBe(true);

      vi.advanceTimersByTime(999);
      expect(isShopRecentlyDeleted('shop-1')).toBe(true);

      vi.advanceTimersByTime(2);
      expect(isShopRecentlyDeleted('shop-1')).toBe(false);
    });

    it('handles multiple IDs passed as an array', () => {
      markShopAsDeleted(['shop-a', 'shop-b', null, undefined], 2000);
      expect(isShopRecentlyDeleted('shop-a')).toBe(true);
      expect(isShopRecentlyDeleted('shop-b')).toBe(true);
      expect(isShopRecentlyDeleted(undefined)).toBe(false);

      vi.advanceTimersByTime(2001);
      expect(isShopRecentlyDeleted('shop-a')).toBe(false);
      expect(isShopRecentlyDeleted('shop-b')).toBe(false);
    });
  });

  describe('clearShopQueryParam', () => {
    it('removes shop query param and preserves other search params using replaceState', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      // Setup window.location
      const url = new URL('https://test.com/discover?shop=shop-123&category=vintage');
      delete (window as any).location;
      (window as any).location = url;

      clearShopQueryParam();

      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/discover?category=vintage');
      replaceStateSpy.mockRestore();
    });

    it('clears trailing question mark when shop was the only parameter', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      const url = new URL('https://test.com/?shop=shop-123');
      delete (window as any).location;
      (window as any).location = url;

      clearShopQueryParam();

      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
      replaceStateSpy.mockRestore();
    });
  });

  describe('closeActiveShop', () => {
    it('sets selectedShop to null and clears URL by default', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      const url = new URL('https://test.com/?shop=shop-123');
      delete (window as any).location;
      (window as any).location = url;

      expect(useShopStore.getState().selectedShop).not.toBeNull();

      closeActiveShop();

      expect(useShopStore.getState().selectedShop).toBeNull();
      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
      replaceStateSpy.mockRestore();
    });

    it('skips URL clearing when clearUrl is false', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      closeActiveShop({ clearUrl: false });

      expect(useShopStore.getState().selectedShop).toBeNull();
      expect(replaceStateSpy).not.toHaveBeenCalled();
      replaceStateSpy.mockRestore();
    });
  });
});
