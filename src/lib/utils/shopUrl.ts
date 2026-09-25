export interface ShopUrlTarget {
  slug?: string | null;
  place_id?: string | null;
  id?: string | null;
}

/**
 * Returns the canonical shop path, preferring readable slug over internal place_id.
 * Falls back to /shop if neither is present.
 */
export function getShopPath(shop?: ShopUrlTarget | null): string {
  if (!shop) return '/shop';
  const identifier = shop.slug || shop.place_id || shop.id;
  if (!identifier) return '/shop';
  return `/shop/${identifier}`;
}
