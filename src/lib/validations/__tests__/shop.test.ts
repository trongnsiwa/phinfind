import { describe, it, expect } from 'vitest';
import {
  createShopSchema,
  updateShopSchema,
  socialUrl,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  youtubeUrl,
  zaloUrl,
} from '../shop';
import {
  ALLOWED_FIELDS as SUGGEST_ALLOWED_FIELDS,
  DISALLOWED_FIELDS as SUGGEST_DISALLOWED_FIELDS,
} from '../../../../app/api/shops/suggest-edit/route';
import {
  ALLOWED_FIELDS as ADMIN_ALLOWED_FIELDS,
  DISALLOWED_FIELDS as ADMIN_DISALLOWED_FIELDS,
} from '../../../../app/api/admin/suggestions/route';

describe('Shop Validations', () => {
  describe('socialUrl helper', () => {
    const customSocial = socialUrl(/^https?:\/\/(www\.)?custom\.com\//i, 'Custom');

    it('transforms null, undefined, empty string, and whitespace-only string to null', () => {
      expect(customSocial.parse(null)).toBeNull();
      expect(customSocial.parse(undefined)).toBeNull();
      expect(customSocial.parse('')).toBeNull();
      expect(customSocial.parse('   ')).toBeNull();
    });

    it('trims whitespace around valid URLs', () => {
      expect(customSocial.parse('  https://custom.com/page  ')).toBe('https://custom.com/page');
    });

    it('rejects invalid schemes or malformed URLs', () => {
      expect(() => customSocial.parse('ftp://custom.com/test')).toThrow();
      expect(() => customSocial.parse('not-a-valid-url')).toThrow();
      expect(() => customSocial.parse('javascript:alert(1)')).toThrow();
    });

    it('rejects URLs from different domains', () => {
      expect(() => customSocial.parse('https://otherdomain.com/test')).toThrow();
      expect(() => customSocial.parse('https://custom.com.attacker.com/test')).toThrow();
    });
  });

  describe('Platform-specific social URL schemas', () => {
    describe('facebookUrl', () => {
      it('accepts valid Facebook links', () => {
        const validUrls = [
          'https://facebook.com/saigoncafe',
          'https://www.facebook.com/saigoncafe',
          'https://m.facebook.com/saigoncafe',
          'https://web.facebook.com/saigoncafe',
          'https://fb.com/saigoncafe',
          'http://facebook.com/saigoncafe',
        ];
        for (const url of validUrls) {
          expect(facebookUrl.parse(url)).toBe(url);
        }
      });

      it('rejects non-Facebook URLs', () => {
        expect(() => facebookUrl.parse('https://instagram.com/saigoncafe')).toThrow();
        expect(() => facebookUrl.parse('https://facebook.phishing.com/saigoncafe')).toThrow();
      });
    });

    describe('instagramUrl', () => {
      it('accepts valid Instagram links', () => {
        const validUrls = [
          'https://instagram.com/saigoncafe',
          'https://www.instagram.com/saigoncafe',
          'http://instagram.com/saigoncafe',
        ];
        for (const url of validUrls) {
          expect(instagramUrl.parse(url)).toBe(url);
        }
      });

      it('rejects non-Instagram URLs', () => {
        expect(() => instagramUrl.parse('https://facebook.com/saigoncafe')).toThrow();
        expect(() => instagramUrl.parse('https://notinstagram.com/saigoncafe')).toThrow();
      });
    });

    describe('tiktokUrl', () => {
      it('accepts valid TikTok links', () => {
        const validUrls = [
          'https://tiktok.com/@saigoncafe',
          'https://www.tiktok.com/@saigoncafe',
          'https://m.tiktok.com/@saigoncafe',
          'http://tiktok.com/@saigoncafe',
        ];
        for (const url of validUrls) {
          expect(tiktokUrl.parse(url)).toBe(url);
        }
      });

      it('rejects non-TikTok URLs', () => {
        expect(() => tiktokUrl.parse('https://youtube.com/@saigoncafe')).toThrow();
      });
    });

    describe('youtubeUrl', () => {
      it('accepts valid YouTube links', () => {
        const validUrls = [
          'https://youtube.com/@saigoncafe',
          'https://www.youtube.com/watch?v=abc123xyz',
          'https://youtu.be/abc123xyz',
          'https://www.youtu.be/abc123xyz',
          'http://youtube.com/channel/abc',
        ];
        for (const url of validUrls) {
          expect(youtubeUrl.parse(url)).toBe(url);
        }
      });

      it('rejects non-YouTube URLs', () => {
        expect(() => youtubeUrl.parse('https://vimeo.com/123456')).toThrow();
      });
    });

    describe('zaloUrl', () => {
      it('accepts valid Zalo links', () => {
        const validUrls = [
          'https://zalo.me/0901234567',
          'https://www.zalo.me/0901234567',
          'https://zalo.com/0901234567',
          'https://www.zalo.com/0901234567',
          'http://zalo.me/0901234567',
        ];
        for (const url of validUrls) {
          expect(zaloUrl.parse(url)).toBe(url);
        }
      });

      it('rejects non-Zalo URLs', () => {
        expect(() => zaloUrl.parse('https://facebook.com/0901234567')).toThrow();
      });
    });
  });

  describe('createShopSchema', () => {
    const validBaseShop = {
      name: 'Cà Phê Sài Gòn',
      address: '123 Đường Lê Lợi, Q.1',
      lat: 10.7769,
      lon: 106.7009,
    };

    it('parses minimal valid shop and sets social URLs to null', () => {
      const parsed = createShopSchema.parse(validBaseShop);
      expect(parsed.name).toBe('Cà Phê Sài Gòn');
      expect(parsed.facebook_url).toBeNull();
      expect(parsed.instagram_url).toBeNull();
      expect(parsed.tiktok_url).toBeNull();
      expect(parsed.youtube_url).toBeNull();
      expect(parsed.zalo_url).toBeNull();
    });

    it('parses full shop data with all social links correctly', () => {
      const parsed = createShopSchema.parse({
        ...validBaseShop,
        facebook_url: 'https://facebook.com/saigoncafe',
        instagram_url: 'https://instagram.com/saigoncafe',
        tiktok_url: 'https://tiktok.com/@saigoncafe',
        youtube_url: 'https://youtube.com/@saigoncafe',
        zalo_url: 'https://zalo.me/0901234567',
      });
      expect(parsed.facebook_url).toBe('https://facebook.com/saigoncafe');
      expect(parsed.instagram_url).toBe('https://instagram.com/saigoncafe');
      expect(parsed.tiktok_url).toBe('https://tiktok.com/@saigoncafe');
      expect(parsed.youtube_url).toBe('https://youtube.com/@saigoncafe');
      expect(parsed.zalo_url).toBe('https://zalo.me/0901234567');
    });

    it('fails when any social URL domain is invalid', () => {
      expect(() =>
        createShopSchema.parse({
          ...validBaseShop,
          facebook_url: 'https://twitter.com/saigoncafe',
        })
      ).toThrow();
    });
  });

  describe('updateShopSchema', () => {
    it('requires place_id and accepts social URLs', () => {
      expect(() =>
        updateShopSchema.parse({
          name: 'Cà Phê Sài Gòn',
          address: '123 Lê Lợi',
          lat: 10.7,
          lon: 106.7,
        })
      ).toThrow();

      const parsed = updateShopSchema.parse({
        place_id: 'shop-place-123',
        name: 'Cà Phê Sài Gòn',
        address: '123 Lê Lợi',
        lat: 10.7,
        lon: 106.7,
        facebook_url: 'https://facebook.com/saigoncafe',
      });
      expect(parsed.place_id).toBe('shop-place-123');
      expect(parsed.facebook_url).toBe('https://facebook.com/saigoncafe');
    });
  });

  describe('Suggestion Fields Safety', () => {
    const expectedSocialKeys = [
      'facebook_url',
      'instagram_url',
      'tiktok_url',
      'youtube_url',
      'zalo_url',
    ];

    it('suggest-edit ALLOWED_FIELDS contains all social keys and is disjoint from DISALLOWED_FIELDS', () => {
      for (const key of expectedSocialKeys) {
        expect(SUGGEST_ALLOWED_FIELDS.has(key)).toBe(true);
      }

      for (const key of SUGGEST_ALLOWED_FIELDS) {
        expect(SUGGEST_DISALLOWED_FIELDS.has(key)).toBe(false);
      }
    });

    it('admin suggestions ALLOWED_FIELDS contains all social keys and is disjoint from DISALLOWED_FIELDS', () => {
      for (const key of expectedSocialKeys) {
        expect(ADMIN_ALLOWED_FIELDS.has(key)).toBe(true);
      }

      for (const key of ADMIN_ALLOWED_FIELDS) {
        expect(ADMIN_DISALLOWED_FIELDS.has(key)).toBe(false);
      }
    });
  });
});
