import { describe, it, expect } from 'vitest';
import {
  truncateForOg,
  sanitizeText,
  buildOgTitle,
  buildOgSubtitle,
  buildOgPills,
} from '../ogImage';
import type { CoffeeShop } from '@/types/shop';

describe('ogImage SEO helpers', () => {
  describe('truncateForOg', () => {
    it('preserves text under the limit', () => {
      const text = 'Cà phê trứng Hà Nội';
      expect(truncateForOg(text, 50)).toBe('Cà phê trứng Hà Nội');
    });

    it('preserves text exactly at the limit', () => {
      const text = 'PhinFind Coffee';
      expect(truncateForOg(text, 15)).toBe('PhinFind Coffee');
    });

    it('truncates with ellipsis over the limit without cutting a word', () => {
      const text = 'Quán Cà Phê Trứng Đặc Sản Giảng Hà Nội Phố Cổ';
      const truncated = truncateForOg(text, 25);
      expect(truncated.endsWith('...')).toBe(true);
      expect(truncated.length).toBeLessThanOrEqual(25);
      // Ensure it cuts cleanly between words rather than mid-word ('Quán Cà Phê Trứng Đặc...' is 24 chars)
      expect(truncated).toBe('Quán Cà Phê Trứng Đặc...');
    });

    it('handles empty or whitespace-only strings gracefully', () => {
      expect(truncateForOg('')).toBe('');
      expect(truncateForOg('   ')).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('strips control characters and HTML tags', () => {
      const dirty = '<b>Quán Cà Phê</b>\x00\x1F Sài Gòn\x7F';
      expect(sanitizeText(dirty)).toBe('Quán Cà Phê Sài Gòn');
    });
  });

  describe('buildOgTitle', () => {
    it('returns "PhinFind" when shop or name is null or undefined', () => {
      expect(buildOgTitle(null)).toBe('PhinFind');
      expect(buildOgTitle(undefined)).toBe('PhinFind');
      expect(buildOgTitle({ name: '' })).toBe('PhinFind');
      expect(buildOgTitle({ name: '   ' })).toBe('PhinFind');
    });

    it('truncates long names at word boundaries and strips control characters', () => {
      const longName =
        'Quán Cà Phê Rang Xay Nguyên Chất\x07 Truyền Thống Đậm Đà Hương Vị Buôn Ma Thuột';
      const title = buildOgTitle({ name: longName }, 45);
      expect(title.includes('\x07')).toBe(false);
      expect(title.endsWith('...')).toBe(true);
      expect(title.length).toBeLessThanOrEqual(45);
      expect(title).toBe('Quán Cà Phê Rang Xay Nguyên Chất Truyền...');
    });
  });

  describe('buildOgSubtitle', () => {
    it('returns an empty string when address is missing or null', () => {
      expect(buildOgSubtitle(null)).toBe('');
      expect(buildOgSubtitle({})).toBe('');
      expect(buildOgSubtitle({ address: null as any })).toBe('');
      expect(buildOgSubtitle({ address: '' })).toBe('');
    });

    it('returns an empty string when address is a placeholder like "Address unavailable"', () => {
      expect(buildOgSubtitle({ address: 'Address unavailable' })).toBe('');
      expect(buildOgSubtitle({ address: 'address unavailable' })).toBe('');
      expect(buildOgSubtitle({ address: 'Chưa có địa chỉ' })).toBe('');
      expect(buildOgSubtitle({ address: 'Đang cập nhật' })).toBe('');
    });

    it('cleans and formats a valid address, truncating if over max length', () => {
      const shop: Partial<CoffeeShop> = {
        name: 'The Workshop',
        address: 'The Workshop, 27 Ngô Đức Kế, Bến Nghé, Quận 1, Hồ Chí Minh, Việt Nam',
      };
      const subtitle = buildOgSubtitle(shop, 40);
      expect(subtitle.includes('Việt Nam')).toBe(false);
      expect(subtitle.startsWith('The Workshop')).toBe(false);
      expect(subtitle.length).toBeLessThanOrEqual(40);
    });
  });

  describe('buildOgPills', () => {
    it('omits rating when rating is 0 or null', () => {
      const shop1: Partial<CoffeeShop> = { rating: 0, total_ratings: 15 };
      const pills1 = buildOgPills(shop1);
      expect(pills1.some((p) => p.label === 'rating')).toBe(false);

      const shop2: Partial<CoffeeShop> = { rating: null as any, total_ratings: 15 };
      const pills2 = buildOgPills(shop2);
      expect(pills2.some((p) => p.label === 'rating')).toBe(false);
    });

    it('omits total_ratings when 0 or null', () => {
      const shop1: Partial<CoffeeShop> = { rating: 4.5, total_ratings: 0 };
      const pills1 = buildOgPills(shop1);
      expect(pills1.some((p) => p.label === 'reviews')).toBe(false);

      const shop2: Partial<CoffeeShop> = { rating: 4.5, total_ratings: null as any };
      const pills2 = buildOgPills(shop2);
      expect(pills2.some((p) => p.label === 'reviews')).toBe(false);
    });

    it('omits price_range when null or empty', () => {
      const shop1: Partial<CoffeeShop> = { rating: 4.5, price_range: null as any };
      const pills1 = buildOgPills(shop1);
      expect(pills1.some((p) => p.label === 'price')).toBe(false);

      const shop2: Partial<CoffeeShop> = { rating: 4.5, price_range: '  ' as any };
      const pills2 = buildOgPills(shop2);
      expect(pills2.some((p) => p.label === 'price')).toBe(false);
    });

    it('populates pills with formatted values when present', () => {
      const shop: Partial<CoffeeShop> = {
        rating: 4.65,
        total_ratings: 120,
        price_range: '₫₫',
        categories: ['catering.cafe', 'wifi'],
      };
      const pills = buildOgPills(shop);

      expect(pills).toHaveLength(4);
      expect(pills[0]).toEqual({ label: 'rating', value: '★ 4.7' });
      expect(pills[1]).toEqual({ label: 'reviews', value: '120 đánh giá' });
      expect(pills[2]).toEqual({ label: 'price', value: '₫₫' });
      expect(pills[3]).toEqual({ label: 'category', value: 'Cà phê phin' });
    });
  });
});
