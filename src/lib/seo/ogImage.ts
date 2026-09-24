import type { CoffeeShop } from '@/types/shop';
import { cleanCategoryLabel } from '@/lib/utils/placeholders';

export interface OgPill {
  label: 'rating' | 'reviews' | 'price' | 'category';
  value: string;
}

const PLACEHOLDER_ADDRESSES = new Set([
  'address unavailable',
  'chưa có địa chỉ',
  'đang cập nhật',
  'unavailable',
  'n/a',
]);

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

/**
 * Strips HTML-breaking characters and control characters (\\x00-\\x1F, \\x7F).
 */
export function sanitizeText(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Truncates text at word boundary with an ellipsis when exceeding maxLen.
 * Preserves text under or at the limit.
 */
export function truncateForOg(text: string, maxLen = 100): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const sub = trimmed.slice(0, maxLen - 3);
  const lastSpace = sub.lastIndexOf(' ');
  const truncated = lastSpace > 0 ? sub.slice(0, lastSpace) : sub;
  return `${truncated.replace(/[\s,.;:–—\-]+$/, '')}...`;
}

/**
 * Cleans shop address by stripping duplicate shop name, postal codes, and punctuation artifacts.
 */
export function cleanAddressForOg(address?: string | null, shopName?: string): string {
  if (!address || typeof address !== 'string') return '';
  let cleaned = sanitizeText(address);

  if (!cleaned || PLACEHOLDER_ADDRESSES.has(cleaned.toLowerCase())) {
    return '';
  }

  if (shopName && shopName.trim()) {
    const trimmedName = shopName.trim();
    if (cleaned.toLowerCase().startsWith(trimmedName.toLowerCase())) {
      cleaned = cleaned.slice(trimmedName.length);
      cleaned = cleaned.replace(/^[\s,–—\-]+/, '');
    }
  }

  cleaned = cleaned.replace(/\b00084\b/gi, '');
  cleaned = cleaned.replace(/\b\d{5,6}\b/g, '');
  cleaned = cleaned.replace(/,\s*(Việt Nam|Vietnam|VN)\s*$/i, '');
  cleaned = cleaned.replace(/\b(Việt Nam|Vietnam)\b/gi, '');
  cleaned = cleaned
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/,\s*-\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,–—\-]+/, '')
    .replace(/[\s,–—\-]+$/, '')
    .trim();

  return cleaned;
}

/**
 * Builds clamped, sanitized shop name for the Open Graph image.
 */
export function buildOgTitle(shop?: Partial<CoffeeShop> | null, maxLen = 65): string {
  const rawName = shop?.name || '';
  const sanitized = sanitizeText(rawName);
  if (!sanitized) return 'PhinFind';
  return truncateForOg(sanitized, maxLen);
}

/**
 * Builds single-line clamped, sanitized address for the Open Graph image.
 * Returns an empty string when address is missing or a placeholder.
 */
export function buildOgSubtitle(shop?: Partial<CoffeeShop> | null, maxLen = 85): string {
  const rawAddress = shop?.address;
  if (!rawAddress || typeof rawAddress !== 'string') return '';
  const cleaned = cleanAddressForOg(rawAddress, shop?.name || undefined);
  if (!cleaned || PLACEHOLDER_ADDRESSES.has(cleaned.toLowerCase())) return '';
  return truncateForOg(cleaned, maxLen);
}

/**
 * Builds pill definitions for rating, review count, price range, and primary category.
 * Filters out empty or zero values.
 */
export function buildOgPills(shop?: Partial<CoffeeShop> | null): OgPill[] {
  if (!shop) return [];
  const pills: OgPill[] = [];

  // Rating: omit if rating is 0, null, or undefined
  if (typeof shop.rating === 'number' && shop.rating > 0) {
    pills.push({
      label: 'rating',
      value: `★ ${shop.rating.toFixed(1)}`,
    });
  }

  // Total ratings: omit if 0, null, or undefined
  if (typeof shop.total_ratings === 'number' && shop.total_ratings > 0) {
    pills.push({
      label: 'reviews',
      value: `${shop.total_ratings} đánh giá`,
    });
  }

  // Price range: omit if null or empty
  if (shop.price_range && typeof shop.price_range === 'string' && shop.price_range.trim()) {
    pills.push({
      label: 'price',
      value: sanitizeText(shop.price_range),
    });
  }

  // Primary category: omit if not present
  if (Array.isArray(shop.categories) && shop.categories.length > 0) {
    for (const cat of shop.categories) {
      if (!cat || typeof cat !== 'string') continue;
      const label = cleanCategoryLabel(cat).trim();
      if (!label || label.includes('.') || label.includes('_')) continue;
      if (GENERIC_CATEGORY_TOKENS.has(label.toLowerCase())) continue;
      pills.push({
        label: 'category',
        value: label,
      });
      break;
    }
  }

  return pills;
}
