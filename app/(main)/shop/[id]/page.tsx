import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchShopForServer } from '@/lib/supabase/shop-detail';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildShopJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonLd';
import { cleanCategoryLabel } from '@/lib/utils/placeholders';
import { ShopDetailClient } from './ShopDetailClient';
import type { CoffeeShop } from '@/types/shop';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function cleanAddress(address?: string | null, shopName?: string): string {
  if (!address || typeof address !== 'string') return '';
  let cleaned = address.trim();

  if (
    !cleaned ||
    cleaned.toLowerCase() === 'address unavailable' ||
    cleaned.toLowerCase() === 'chưa có địa chỉ'
  ) {
    return '';
  }

  // Strip shop name if address starts with it to prevent duplicate shop names
  if (shopName && shopName.trim()) {
    const trimmedName = shopName.trim();
    if (cleaned.toLowerCase().startsWith(trimmedName.toLowerCase())) {
      cleaned = cleaned.slice(trimmedName.length);
      cleaned = cleaned.replace(/^[\s,–—\-]+/, '');
    }
  }

  // Strip postal codes (e.g. 00084, 5-6 digit postal codes)
  cleaned = cleaned.replace(/\b00084\b/gi, '');
  cleaned = cleaned.replace(/\b\d{5,6}\b/g, '');

  // Strip country tokens like "Việt Nam", "Vietnam", "VN"
  cleaned = cleaned.replace(/,\s*(Việt Nam|Vietnam|VN)\s*$/i, '');
  cleaned = cleaned.replace(/\b(Việt Nam|Vietnam)\b/gi, '');

  // Clean up punctuation artifacts: multiple commas, spaces, dangling commas/dashes
  cleaned = cleaned
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/,\s*-\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,–—\-]+/, '')
    .replace(/[\s,–—\-]+$/, '')
    .trim();

  return cleaned;
}

export function truncateToLimit(text: string, maxLen = 155): string {
  if (text.length <= maxLen) return text;
  const sub = text.slice(0, maxLen - 3);
  const lastSpace = sub.lastIndexOf(' ');
  const truncated = lastSpace > 0 ? sub.slice(0, lastSpace) : sub;
  return `${truncated.replace(/[\s,.;:–—\-]+$/, '')}...`;
}

const GENERIC_CATEGORY_TOKENS = new Set([
  'building',
  'catering',
  'coffee',
  'cafe',
  'commercial',
  'amenity',
  'restaurant',
  'catering restaurant',
  'fast food',
  'food',
]);

export function cleanCategories(categories?: string[]): string[] {
  if (!Array.isArray(categories)) return [];
  const cleaned: string[] = [];
  const seen = new Set<string>();

  for (const cat of categories) {
    if (!cat || typeof cat !== 'string') continue;
    const label = cleanCategoryLabel(cat).trim();
    if (!label) continue;
    // Disallow leaked English slugs, dotted or snake_case tokens
    if (label.includes('.') || label.includes('_')) continue;
    const lower = label.toLowerCase();
    if (GENERIC_CATEGORY_TOKENS.has(lower)) {
      continue;
    }
    if (!seen.has(lower)) {
      seen.add(lower);
      cleaned.push(label);
    }
  }

  return cleaned;
}

export function buildShopDescription(shop: CoffeeShop): string {
  const shopName = shop.name?.trim() || '';
  const cleanedAddr = cleanAddress(shop.address, shopName);
  const cleanedCats = cleanCategories(shop.categories);
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const ratingStr = hasRating ? `${shop.rating!.toFixed(1)}/5★` : '';

  // Fall back to a generic Vietnamese description when data is sparse (e.g. no valid address)
  if (!cleanedAddr) {
    if (shopName) {
      return truncateToLimit(
        `Khám phá quán cà phê ${shopName} trên PhinFind - thông tin địa chỉ, đánh giá và không gian chuẩn gu.`,
        155
      );
    }
    return 'Khám phá các quán cà phê chất lượng và chuẩn gu trên PhinFind.';
  }

  const cta = 'Tìm quán chuẩn gu trên PhinFind.';
  const prefix = shopName
    ? `Khám phá ${shopName} tại ${cleanedAddr}.`
    : `Khám phá quán cà phê tại ${cleanedAddr}.`;

  // Try using 3 down to 0 categories to fit within the 155-character hard cap
  for (let count = Math.min(cleanedCats.length, 3); count >= 0; count--) {
    const catsToUse = cleanedCats.slice(0, count);
    const catText = catsToUse.length > 0 ? `đặc trưng: ${catsToUse.join(', ')}` : '';

    let middle = '';
    if (ratingStr && catText) {
      middle = `Đánh giá ${ratingStr}, ${catText}.`;
    } else if (ratingStr) {
      middle = `Đánh giá ${ratingStr}.`;
    } else if (catText) {
      middle = `Đặc trưng: ${catsToUse.join(', ')}.`;
    }

    const fullSentence = middle
      ? `${prefix} ${middle} ${cta}`
      : `${prefix} ${cta}`;

    if (fullSentence.length <= 155) {
      return fullSentence;
    }
  }

  // If even without categories and rating it exceeds 155, shorten address to retain the CTA
  const prefixIntro = shopName
    ? `Khám phá ${shopName} tại `
    : 'Khám phá quán cà phê tại ';
  const suffix = `. ${cta}`;
  const addressBudget = 155 - prefixIntro.length - suffix.length;

  if (addressBudget >= 15 && cleanedAddr.length > addressBudget) {
    const sub = cleanedAddr.slice(0, addressBudget - 3);
    const lastSpace = sub.lastIndexOf(' ');
    const cut = lastSpace > 0 ? sub.slice(0, lastSpace) : sub;
    const shortenedAddr = `${cut.replace(/[\s,.;:–—\-]+$/, '')}...`;
    return `${prefixIntro}${shortenedAddr}${suffix}`;
  }

  // Ultimate fallback safety net
  return truncateToLimit(`${prefix} ${cta}`, 155);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const shop = await fetchShopForServer(id);

  if (!shop) {
    return {
      title: 'Không tìm thấy quán cà phê | PhinFind',
    };
  }

  const description = buildShopDescription(shop);

  return {
    title: `${shop.name} | PhinFind`,
    description,
    openGraph: {
      title: shop.name,
      description,
      type: 'website',
      siteName: 'PhinFind',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: shop.name,
      description,
    },
    alternates: {
      canonical: `/shop/${shop.place_id || id}`,
    },
  };
}

export default async function ShopDetailPage({ params }: PageProps) {
  const { id } = await params;
  const shop = await fetchShopForServer(id);

  if (!shop) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';
  const shopJsonLd = buildShopJsonLd(shop, baseUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Bản đồ', url: `${baseUrl}/map` },
    { name: shop.name, url: `${baseUrl}/shop/${shop.place_id || id}` },
  ]);

  return (
    <>
      <JsonLd data={[shopJsonLd, breadcrumbJsonLd]} />
      <ShopDetailClient shop={shop} />
    </>
  );
}
