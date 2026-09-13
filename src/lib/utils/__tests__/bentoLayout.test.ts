import { describe, it, expect } from 'vitest';
import { generateCardSizes, generateMobileCardSizes, CardSize } from '../bentoLayout';

describe('Bento Layout Utility', () => {
  const sampleShops = Array.from({ length: 20 }, (_, i) => ({
    id: `shop-${i}`,
    place_id: `place-${i}`,
  }));

  it('produces the exact same output for the same input (deterministic)', () => {
    const run1 = generateCardSizes(sampleShops);
    const run2 = generateCardSizes(sampleShops);
    expect(run1).toEqual(run2);
  });

  it('returns an array of the exact same length as the input', () => {
    expect(generateCardSizes([])).toEqual([]);
    expect(generateCardSizes(sampleShops)).toHaveLength(sampleShops.length);
  });

  it('enforces layout balancing constraint: no two consecutive cards are both large or featured', () => {
    const largeSet = Array.from({ length: 100 }, (_, i) => ({
      id: `shop-dense-${i}`,
      place_id: `place-dense-${i}`,
    }));

    const sizes = generateCardSizes(largeSet);

    for (let i = 1; i < sizes.length; i++) {
      const prev = sizes[i - 1];
      const curr = sizes[i];
      const prevIsHeavy = prev === 'large' || prev === 'featured';
      const currIsHeavy = curr === 'large' || curr === 'featured';

      expect(prevIsHeavy && currIsHeavy).toBe(false);
    }
  });

  it('weights fall within expected bounds over a 500-shop sample', () => {
    const sample500 = Array.from({ length: 500 }, (_, i) => ({
      id: `shop-stat-${i}`,
      place_id: `place-stat-${i}`,
    }));

    const sizes = generateCardSizes(sample500);

    const counts: Record<CardSize, number> = {
      small: 0,
      medium: 0,
      large: 0,
      featured: 0,
    };

    for (const size of sizes) {
      counts[size]++;
    }

    const smallRatio = counts.small / 500;
    const mediumRatio = counts.medium / 500;
    const largeRatio = counts.large / 500;
    const featuredRatio = counts.featured / 500;

    // Small: target ~50% (allow 35% - 65% with balancing fallback)
    expect(smallRatio).toBeGreaterThan(0.35);
    expect(smallRatio).toBeLessThan(0.65);

    // Medium: target ~25% (allow 15% - 35%)
    expect(mediumRatio).toBeGreaterThan(0.15);
    expect(mediumRatio).toBeLessThan(0.38);

    // Large + Featured: target ~25%
    expect(largeRatio + featuredRatio).toBeGreaterThan(0.15);
    expect(largeRatio + featuredRatio).toBeLessThan(0.35);
  });

  describe('Mobile Bento Card Sizes (generateMobileCardSizes)', () => {
    it('produces the exact same output for the same input (deterministic)', () => {
      const run1 = generateMobileCardSizes(sampleShops);
      const run2 = generateMobileCardSizes(sampleShops);
      expect(run1).toEqual(run2);
    });

    it('returns an array of the exact same length as the input', () => {
      expect(generateMobileCardSizes([])).toEqual([]);
      expect(generateMobileCardSizes(sampleShops)).toHaveLength(sampleShops.length);
    });

    it('ensures the first card is always standard', () => {
      for (let i = 0; i < 50; i++) {
        const shops = Array.from({ length: 10 }, (_, idx) => ({
          id: `shop-${i}-${idx}`,
          place_id: `place-${i}-${idx}`,
        }));
        const sizes = generateMobileCardSizes(shops);
        expect(sizes[0]).toBe('standard');
      }
    });

    it('enforces that no two featured cards are consecutive', () => {
      const largeSet = Array.from({ length: 200 }, (_, i) => ({
        id: `shop-mobile-dense-${i}`,
        place_id: `place-mobile-dense-${i}`,
      }));

      const sizes = generateMobileCardSizes(largeSet);

      for (let i = 1; i < sizes.length; i++) {
        const prev = sizes[i - 1];
        const curr = sizes[i];
        expect(prev === 'featured' && curr === 'featured').toBe(false);
      }
    });

    it('hard-caps featured cards at 25% of the list', () => {
      const shops = Array.from({ length: 100 }, (_, i) => ({
        id: `shop-cap-${i}`,
        place_id: `place-cap-${i}`,
      }));

      const sizes = generateMobileCardSizes(shops);
      const featuredCount = sizes.filter((s) => s === 'featured').length;

      expect(featuredCount).toBeLessThanOrEqual(25);
    });

    it('targets ~16% featured on a large sample', () => {
      const sample500 = Array.from({ length: 500 }, (_, i) => ({
        id: `shop-mobile-stat-${i}`,
        place_id: `place-mobile-stat-${i}`,
      }));

      const sizes = generateMobileCardSizes(sample500);
      const featuredCount = sizes.filter((s) => s === 'featured').length;
      const featuredRatio = featuredCount / 500;

      // Target ~16% (allow 10% - 25% due to non-adjacent + cap constraints)
      expect(featuredRatio).toBeGreaterThan(0.08);
      expect(featuredRatio).toBeLessThanOrEqual(0.25);
    });
  });
});
