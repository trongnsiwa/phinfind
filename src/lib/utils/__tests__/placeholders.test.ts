import { describe, it, expect } from 'vitest';
import {
  cleanCategoryLabel,
  getShopPlaceholderIllustration,
  formatShopCategoryTagline,
  SHOP_PLACEHOLDER_ILLUSTRATIONS,
} from '../placeholders';

describe('Placeholders Utility', () => {
  describe('cleanCategoryLabel', () => {
    it('returns the Vietnamese translation for known category IDs', () => {
      expect(cleanCategoryLabel('catering.cafe')).toBe('Cà phê phin');
      expect(cleanCategoryLabel('specialty_coffee')).toBe('Cà phê đặc sản');
      expect(cleanCategoryLabel('air_conditioned')).toBe('Máy lạnh');
      expect(cleanCategoryLabel('high_speed_wifi')).toBe('Wi-Fi tốc độ cao');
      expect(cleanCategoryLabel('pet_friendly')).toBe('Thú cưng');
    });

    it('strips prefixes and title-cases unknown categories', () => {
      expect(cleanCategoryLabel('catering.roastery_boutique')).toBe('Roastery boutique');
      expect(cleanCategoryLabel('roastery_corner')).toBe('Roastery corner');
    });

    it('returns empty string for generic cafe/coffee category IDs', () => {
      expect(cleanCategoryLabel('cafe')).toBe('');
      expect(cleanCategoryLabel('coffee')).toBe('');
      expect(cleanCategoryLabel('catering')).toBe('');
      expect(cleanCategoryLabel('coffee shop')).toBe('');
    });
  });

  describe('getShopPlaceholderIllustration', () => {
    it('returns default illustration when seed is omitted', () => {
      expect(getShopPlaceholderIllustration()).toBe(SHOP_PLACEHOLDER_ILLUSTRATIONS[0]);
    });

    it('returns the identical deterministic illustration for the same seed across calls', () => {
      const seed = 'place-hanoi-001';
      const illustration1 = getShopPlaceholderIllustration(seed);
      const illustration2 = getShopPlaceholderIllustration(seed);
      expect(illustration1).toBe(illustration2);
      expect(SHOP_PLACEHOLDER_ILLUSTRATIONS).toContain(illustration1);
    });
  });

  describe('formatShopCategoryTagline', () => {
    it('returns default tagline when categories array is empty or undefined', () => {
      const defaultTagline = 'Quán cà phê được yêu thích với hương vị nguyên bản & không gian ấm cúng.';
      expect(formatShopCategoryTagline()).toBe(defaultTagline);
      expect(formatShopCategoryTagline([])).toBe(defaultTagline);
    });

    it('returns default tagline when all categories are generic', () => {
      const defaultTagline = 'Quán cà phê được yêu thích với hương vị nguyên bản & không gian ấm cúng.';
      expect(formatShopCategoryTagline(['cafe', 'coffee'])).toBe(defaultTagline);
    });

    it('formats a custom tagline when descriptive categories are provided', () => {
      const tagline = formatShopCategoryTagline(['air_conditioned', 'high_speed_wifi']);
      expect(tagline).toContain('Máy lạnh');
      expect(tagline).toContain('Wi-Fi tốc độ cao');
    });
  });
});
