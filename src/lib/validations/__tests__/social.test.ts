import { describe, it, expect } from 'vitest';
import {
  socialUrl,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  youtubeUrl,
  zaloUrl,
  websiteUrl,
} from '../social';

describe('Social Validations', () => {
  describe('socialUrl helper', () => {
    const testSchema = socialUrl(/^https?:\/\/(www\.)?example\.com\//i, 'Example');

    it('transforms null, undefined, empty string, and whitespace-only string to null', () => {
      expect(testSchema.parse(null)).toBeNull();
      expect(testSchema.parse(undefined)).toBeNull();
      expect(testSchema.parse('')).toBeNull();
      expect(testSchema.parse('   ')).toBeNull();
    });

    it('trims whitespace around valid URLs', () => {
      expect(testSchema.parse('  https://example.com/profile  ')).toBe('https://example.com/profile');
    });

    it('rejects invalid schemes or malformed URLs', () => {
      expect(() => testSchema.parse('ftp://example.com/test')).toThrow();
      expect(() => testSchema.parse('not-a-url')).toThrow();
      expect(() => testSchema.parse('javascript:alert(1)')).toThrow();
    });

    it('rejects URLs from mismatched domains', () => {
      expect(() => testSchema.parse('https://evil.com/test')).toThrow();
      expect(() => testSchema.parse('https://example.com.attacker.com/test')).toThrow();
    });
  });

  describe('Platform-specific domain enforcement', () => {
    it('facebookUrl enforces facebook/fb domains and coerces empty to null', () => {
      expect(facebookUrl.parse('')).toBeNull();
      expect(facebookUrl.parse('   ')).toBeNull();
      expect(facebookUrl.parse(null)).toBeNull();

      expect(facebookUrl.parse('https://facebook.com/user')).toBe('https://facebook.com/user');
      expect(facebookUrl.parse('https://www.facebook.com/user')).toBe('https://www.facebook.com/user');
      expect(facebookUrl.parse('https://m.facebook.com/user')).toBe('https://m.facebook.com/user');
      expect(facebookUrl.parse('https://fb.com/user')).toBe('https://fb.com/user');

      expect(() => facebookUrl.parse('https://twitter.com/user')).toThrow();
      expect(() => facebookUrl.parse('https://facebook.fake.com/user')).toThrow();
    });

    it('instagramUrl enforces instagram domain and coerces empty to null', () => {
      expect(instagramUrl.parse('')).toBeNull();
      expect(instagramUrl.parse(null)).toBeNull();

      expect(instagramUrl.parse('https://instagram.com/user')).toBe('https://instagram.com/user');
      expect(instagramUrl.parse('https://www.instagram.com/user')).toBe('https://www.instagram.com/user');

      expect(() => instagramUrl.parse('https://facebook.com/user')).toThrow();
      expect(() => instagramUrl.parse('https://instagram.com.phish.com/user')).toThrow();
    });

    it('tiktokUrl enforces tiktok domain and coerces empty to null', () => {
      expect(tiktokUrl.parse('')).toBeNull();
      expect(tiktokUrl.parse(null)).toBeNull();

      expect(tiktokUrl.parse('https://tiktok.com/@user')).toBe('https://tiktok.com/@user');
      expect(tiktokUrl.parse('https://www.tiktok.com/@user')).toBe('https://www.tiktok.com/@user');

      expect(() => tiktokUrl.parse('https://youtube.com/user')).toThrow();
    });

    it('youtubeUrl enforces youtube/youtu.be domains and coerces empty to null', () => {
      expect(youtubeUrl.parse('')).toBeNull();
      expect(youtubeUrl.parse(null)).toBeNull();

      expect(youtubeUrl.parse('https://youtube.com/@channel')).toBe('https://youtube.com/@channel');
      expect(youtubeUrl.parse('https://youtu.be/abc123xyz')).toBe('https://youtu.be/abc123xyz');

      expect(() => youtubeUrl.parse('https://vimeo.com/123')).toThrow();
    });

    it('zaloUrl enforces zalo.me/zalo.com domains and coerces empty to null', () => {
      expect(zaloUrl.parse('')).toBeNull();
      expect(zaloUrl.parse(null)).toBeNull();

      expect(zaloUrl.parse('https://zalo.me/0901234567')).toBe('https://zalo.me/0901234567');
      expect(zaloUrl.parse('https://zalo.com/chat')).toBe('https://zalo.com/chat');

      expect(() => zaloUrl.parse('https://telegram.org/user')).toThrow();
    });
  });

  describe('websiteUrl validation', () => {
    it('coerces null, undefined, empty string, and whitespace-only string to null', () => {
      expect(websiteUrl.parse(null)).toBeNull();
      expect(websiteUrl.parse(undefined)).toBeNull();
      expect(websiteUrl.parse('')).toBeNull();
      expect(websiteUrl.parse('    ')).toBeNull();
    });

    it('accepts valid https URLs from any domain without restriction', () => {
      expect(websiteUrl.parse('https://myblog.vn')).toBe('https://myblog.vn');
      expect(websiteUrl.parse('https://portfolio.dev/about')).toBe('https://portfolio.dev/about');
      expect(websiteUrl.parse('https://sub.domain.co.uk:8080/path?key=val#hash')).toBe(
        'https://sub.domain.co.uk:8080/path?key=val#hash'
      );
    });

    it('trims whitespace around valid https URLs', () => {
      expect(websiteUrl.parse('   https://myblog.vn/me   ')).toBe('https://myblog.vn/me');
    });

    it('rejects non-https schemes (http, ftp, etc.)', () => {
      expect(() => websiteUrl.parse('http://insecure-blog.com')).toThrow();
      expect(() => websiteUrl.parse('ftp://files.example.com')).toThrow();
    });

    it('rejects malformed URLs', () => {
      expect(() => websiteUrl.parse('not-a-valid-url')).toThrow();
      expect(() => websiteUrl.parse('https://')).toThrow();
      expect(() => websiteUrl.parse('javascript:alert(1)')).toThrow();
    });
  });
});
