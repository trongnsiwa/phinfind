import { describe, it, expect } from 'vitest';
import {
  computeTier,
  computeCategoryBadges,
  computeTotalContributions,
  TIER_THRESHOLDS,
  CATEGORY_THRESHOLDS,
} from '../badges';

describe('Badges Utility (FEAT-05)', () => {
  describe('computeTier', () => {
    it('computes tier boundaries accurately', () => {
      // 0 points: dong
      const tier0 = computeTier(0);
      expect(tier0.tier).toBe('dong');
      expect(tier0.nextTier).toBe('bac');
      expect(tier0.nextThreshold).toBe(10);
      expect(tier0.progressPercent).toBe(0);
      expect(tier0.remaining).toBe(10);

      // 9 points: dong
      const tier9 = computeTier(9);
      expect(tier9.tier).toBe('dong');
      expect(tier9.nextTier).toBe('bac');
      expect(tier9.progressPercent).toBe(90);
      expect(tier9.remaining).toBe(1);

      // 10 points: bac
      const tier10 = computeTier(10);
      expect(tier10.tier).toBe('bac');
      expect(tier10.nextTier).toBe('vang');
      expect(tier10.nextThreshold).toBe(50);
      expect(tier10.progressPercent).toBe(0);
      expect(tier10.remaining).toBe(40);

      // 49 points: bac (progress rounded: 39/40 * 100 = 98%)
      const tier49 = computeTier(49);
      expect(tier49.tier).toBe('bac');
      expect(tier49.remaining).toBe(1);
      expect(tier49.progressPercent).toBe(98);

      // 50 points: vang
      const tier50 = computeTier(50);
      expect(tier50.tier).toBe('vang');
      expect(tier50.nextTier).toBe('kim-cuong');
      expect(tier50.nextThreshold).toBe(200);
      expect(tier50.progressPercent).toBe(0);
      expect(tier50.remaining).toBe(150);

      // 199 points: vang
      const tier199 = computeTier(199);
      expect(tier199.tier).toBe('vang');
      expect(tier199.remaining).toBe(1);

      // 200 points: kim-cuong
      const tier200 = computeTier(200);
      expect(tier200.tier).toBe('kim-cuong');
      expect(tier200.nextTier).toBeNull();
      expect(tier200.nextThreshold).toBeNull();
      expect(tier200.remaining).toBe(0);
      expect(tier200.progressPercent).toBe(100);

      // 500 points: kim-cuong (past threshold)
      const tier500 = computeTier(500);
      expect(tier500.tier).toBe('kim-cuong');
      expect(tier500.nextTier).toBeNull();
      expect(tier500.remaining).toBe(0);
      expect(tier500.progressPercent).toBe(100);
    });

    it('clamps progressPercent to 0-100', () => {
      expect(computeTier(-5).progressPercent).toBe(0);
      expect(computeTier(1000).progressPercent).toBe(100);
    });

    it('sets nextTier to null at the top tier', () => {
      const topTier = computeTier(TIER_THRESHOLDS['kim-cuong'].threshold);
      expect(topTier.nextTier).toBeNull();
      expect(topTier.nextThreshold).toBeNull();
      expect(topTier.remaining).toBe(0);
    });

    it('is a pure function (same input produces identical output)', () => {
      const run1 = computeTier(37);
      const run2 = computeTier(37);
      expect(run1).toEqual(run2);
    });
  });

  describe('computeTotalContributions', () => {
    it('weights reviews as 3, visits as 1, and favorites as 1', () => {
      expect(computeTotalContributions({ reviews: 2, visits: 3, favorites: 5 })).toBe(2 * 3 + 3 * 1 + 5 * 1);
      expect(computeTotalContributions({ reviews: 0, visits: 0, favorites: 0 })).toBe(0);
    });
  });

  describe('computeCategoryBadges', () => {
    it('returns all dong when counts are zero', () => {
      const badges = computeCategoryBadges({ reviews: 0, visits: 0, favorites: 0 });
      expect(badges).toHaveLength(3);
      expect(badges.every((b) => b.tier === 'dong')).toBe(true);
    });

    it('computes correct tiers per category with mixed counts', () => {
      const badges = computeCategoryBadges({
        reviews: CATEGORY_THRESHOLDS.reviewer.kimCuong,
        visits: CATEGORY_THRESHOLDS.explorer.vang,
        favorites: CATEGORY_THRESHOLDS.curator.bac,
      });

      const reviewer = badges.find((b) => b.id === 'reviewer');
      const explorer = badges.find((b) => b.id === 'explorer');
      const curator = badges.find((b) => b.id === 'curator');

      expect(reviewer?.tier).toBe('kim-cuong');
      expect(explorer?.tier).toBe('vang');
      expect(curator?.tier).toBe('bac');
    });
  });
});
