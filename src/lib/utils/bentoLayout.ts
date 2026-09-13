export type CardSize = 'small' | 'medium' | 'large' | 'featured';

/**
 * Generates a deterministic pseudo-random number in [0, 1) from a string seed.
 * Uses a Mulberry32-inspired 32-bit integer hash for uniform distribution.
 */
function getDeterministicRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  let t = (hash + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Assigns card sizes based on weighted probabilities:
 * - Small (1×1): ~50%
 * - Medium (2×1): ~25%
 * - Large (2×2): ~15%
 * - Featured (3×2): ~10%
 *
 * Enforces layout balancing to prevent two large or featured cards from appearing adjacent.
 */
export function generateCardSizes(shops: { id: string; place_id?: string }[]): CardSize[] {
  const sizes: CardSize[] = [];

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    const seed = `${shop.id || shop.place_id || i}_seed_${i * 37 + 13}`;
    const rand = getDeterministicRandom(seed);

    let candidate: CardSize;
    if (rand < 0.50) {
      candidate = 'small';
    } else if (rand < 0.75) {
      candidate = 'medium';
    } else if (rand < 0.90) {
      candidate = 'large';
    } else {
      candidate = 'featured';
    }

    // Layout Balancing Constraint:
    // Prevent consecutive large/featured cards to avoid visual crowding and grid gaps
    const prev = sizes[i - 1];
    if ((prev === 'large' || prev === 'featured') && (candidate === 'large' || candidate === 'featured')) {
      candidate = rand < 0.82 ? 'medium' : 'small';
    }

    sizes.push(candidate);
  }

  return sizes;
}

export type MobileCardSize = 'standard' | 'featured';

/**
 * Assigns mobile-only card sizes ('standard' | 'featured') based on deterministic hash:
 * - Standard (1×1): ~84%
 * - Featured (1×2): ~16% (target ~1 in 6 visible cards, hard-capped at 25% of list)
 *
 * RESPONSIVE: Enforces layout rules for mobile single-column feed:
 * 1. First card is never featured to let the header and controls breathe.
 * 2. No two featured cards can appear consecutively (no adjacent featured heroes).
 * 3. Hard-capped at 25% of the total loaded list.
 */
export function generateMobileCardSizes(
  shops: { id: string; place_id?: string }[]
): MobileCardSize[] {
  const sizes: MobileCardSize[] = [];
  let featuredCount = 0;
  // RESPONSIVE: Hard-cap featured hero cards at 25% of the loaded list
  const maxFeatured = Math.floor(shops.length * 0.25);

  for (let i = 0; i < shops.length; i++) {
    // Rule 1: First card is never featured (lets the header breathe)
    if (i === 0) {
      sizes.push('standard');
      continue;
    }

    // Rule 2: No two featured cards adjacent
    if (sizes[i - 1] === 'featured') {
      sizes.push('standard');
      continue;
    }

    // Rule 3: Hard-cap at 25% of loaded list
    if (featuredCount >= maxFeatured) {
      sizes.push('standard');
      continue;
    }

    const shop = shops[i];
    const seed = `${shop.id || shop.place_id || i}_mobile_seed_${i * 31 + 17}`;
    const rand = getDeterministicRandom(seed);

    // Target ~16% featured (~1 in 6 cards)
    if (rand < 0.16) {
      sizes.push('featured');
      featuredCount++;
    } else {
      sizes.push('standard');
    }
  }

  return sizes;
}
