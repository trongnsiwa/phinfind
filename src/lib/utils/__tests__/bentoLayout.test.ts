import { describe, it, expect } from 'vitest';
import { generateCardSizes, CardSize } from '../bentoLayout';

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
});
