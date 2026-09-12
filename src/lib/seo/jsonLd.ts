import type { CoffeeShop } from '@/types/shop';

function mapDayToSchema(day: number): string {
  const map: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  return map[day] || 'Monday';
}

export function buildShopJsonLd(shop: CoffeeShop, baseUrl: string): Record<string, unknown> {
  const url = `${baseUrl}/shop/${shop.place_id || shop.id}`;
  const images = (shop.photos || []).slice(0, 5);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': url,
    name: shop.name,
    url,
    address: shop.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: shop.address,
          addressCountry: 'VN',
        }
      : undefined,
    geo:
      typeof shop.lat === 'number' && typeof shop.lon === 'number'
        ? {
            '@type': 'GeoCoordinates',
            latitude: shop.lat,
            longitude: shop.lon,
          }
        : undefined,
    telephone: shop.phone || undefined,
    sameAs: shop.website ? [shop.website] : undefined,
    image: images.length > 0 ? images : undefined,
    priceRange: shop.price_range || undefined,
    servesCuisine: 'Coffee',
    openingHoursSpecification: shop.opening_hours?.periods?.map((p) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: mapDayToSchema(p.open.day),
      opens: p.open.time,
      closes: p.close.time,
    })),
    aggregateRating:
      shop.rating && shop.total_ratings && shop.total_ratings > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: shop.rating.toFixed(1),
            reviewCount: shop.total_ratings,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return JSON.parse(JSON.stringify(jsonLd)) as Record<string, unknown>;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
