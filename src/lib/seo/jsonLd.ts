import type { CoffeeShop } from '@/types/shop';
import { getShopPath } from '@/lib/utils/shopUrl';

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
  const url = `${baseUrl}${getShopPath(shop)}`;
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

export function buildWebSiteJsonLd(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'PhinFind',
    alternateName: 'PhinFind - Bản đồ Cà phê Việt',
    url: baseUrl,
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationJsonLd(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'PhinFind',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo-512.png`,
      width: 512,
      height: 512,
    },
    description:
      'Nền tảng bản đồ cà phê Việt, giúp khám phá các quán cà phê chuẩn gu, xem đánh giá thực tế và chia sẻ trải nghiệm.',
    areaServed: 'VN',
  };
}

