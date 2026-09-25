import { describe, it, expect } from 'vitest';
import { getShopPath } from '../shopUrl';

describe('getShopPath', () => {
  it('prefers slug when both slug and place_id are present', () => {
    const shop = {
      slug: 'so-siph-old-bar',
      place_id: 'custom_m1abc_xyz123',
      id: 'custom_m1abc_xyz123',
    };
    expect(getShopPath(shop)).toBe('/shop/so-siph-old-bar');
  });

  it('falls back to place_id when slug is missing or null', () => {
    const shopWithNullSlug = {
      slug: null,
      place_id: 'custom_m1abc_xyz123',
    };
    expect(getShopPath(shopWithNullSlug)).toBe('/shop/custom_m1abc_xyz123');

    const shopWithoutSlug = {
      place_id: 'geo_hash_51a2c1f3',
    };
    expect(getShopPath(shopWithoutSlug)).toBe('/shop/geo_hash_51a2c1f3');
  });

  it('falls back to id when slug and place_id are not provided', () => {
    const shopWithIdOnly = {
      id: 'shop_test_id',
    };
    expect(getShopPath(shopWithIdOnly)).toBe('/shop/shop_test_id');
  });

  it('handles missing both slug and place_id gracefully', () => {
    expect(getShopPath({})).toBe('/shop');
    expect(getShopPath(null)).toBe('/shop');
    expect(getShopPath(undefined)).toBe('/shop');
  });
});
