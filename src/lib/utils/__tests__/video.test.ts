import { describe, expect, it } from 'vitest';
import { parseVideoUrl, youtubeThumbnail } from '../video';

describe('video utilities', () => {
  describe('parseVideoUrl', () => {
    it('parses YouTube standard watch URL', () => {
      const result = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toEqual({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        video_id: 'dQw4w9WgXcQ'
      });
    });

    it('parses YouTube short youtu.be URL', () => {
      const result = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
      expect(result).toEqual({
        url: 'https://youtu.be/dQw4w9WgXcQ',
        platform: 'youtube',
        video_id: 'dQw4w9WgXcQ'
      });
    });

    it('parses YouTube shorts and embed URLs', () => {
      const shortsResult = parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
      expect(shortsResult).toEqual({
        url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        platform: 'youtube',
        video_id: 'dQw4w9WgXcQ'
      });

      const embedResult = parseVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(embedResult).toEqual({
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        platform: 'youtube',
        video_id: 'dQw4w9WgXcQ'
      });
    });

    it('parses TikTok long-form video URL', () => {
      const result = parseVideoUrl('https://www.tiktok.com/@cafesaigon/video/7123456789012345678');
      expect(result).toEqual({
        url: 'https://www.tiktok.com/@cafesaigon/video/7123456789012345678',
        platform: 'tiktok',
        video_id: '7123456789012345678'
      });
    });

    it('parses TikTok short-form URLs (/t/ and vt.tiktok.com)', () => {
      const tResult = parseVideoUrl('https://www.tiktok.com/t/ZT8y7wXYZ/');
      expect(tResult).toEqual({
        url: 'https://www.tiktok.com/t/ZT8y7wXYZ/',
        platform: 'tiktok',
        video_id: 'ZT8y7wXYZ'
      });

      const vtResult = parseVideoUrl('https://vt.tiktok.com/ZS23abcd/');
      expect(vtResult).toEqual({
        url: 'https://vt.tiktok.com/ZS23abcd/',
        platform: 'tiktok',
        video_id: 'ZS23abcd'
      });
    });

    it('parses Instagram reels, posts, and IGTV URLs', () => {
      const reelResult = parseVideoUrl('https://www.instagram.com/reel/C3_abc123/');
      expect(reelResult).toEqual({
        url: 'https://www.instagram.com/reel/C3_abc123/',
        platform: 'instagram',
        video_id: 'C3_abc123'
      });

      const postResult = parseVideoUrl('https://www.instagram.com/p/C3_abc123/');
      expect(postResult).toEqual({
        url: 'https://www.instagram.com/p/C3_abc123/',
        platform: 'instagram',
        video_id: 'C3_abc123'
      });

      const tvResult = parseVideoUrl('https://www.instagram.com/tv/C3_abc123/');
      expect(tvResult).toEqual({
        url: 'https://www.instagram.com/tv/C3_abc123/',
        platform: 'instagram',
        video_id: 'C3_abc123'
      });
    });

    it('parses Facebook video, watch, and fb.watch URLs', () => {
      const fbVideoResult = parseVideoUrl('https://www.facebook.com/quan.cafe/videos/123456789012345/');
      expect(fbVideoResult).toEqual({
        url: 'https://www.facebook.com/quan.cafe/videos/123456789012345/',
        platform: 'facebook',
        video_id: '123456789012345'
      });

      const fbWatchResult = parseVideoUrl('https://www.facebook.com/watch/?v=123456789012345');
      expect(fbWatchResult).toEqual({
        url: 'https://www.facebook.com/watch/?v=123456789012345',
        platform: 'facebook',
        video_id: '123456789012345'
      });

      const fbShortResult = parseVideoUrl('https://fb.watch/abcd1234/');
      expect(fbShortResult).toEqual({
        url: 'https://fb.watch/abcd1234/',
        platform: 'facebook',
        video_id: 'abcd1234'
      });
    });

    it('trims input whitespace before parsing', () => {
      const result = parseVideoUrl('   https://youtu.be/dQw4w9WgXcQ   ');
      expect(result?.video_id).toBe('dQw4w9WgXcQ');
      expect(result?.url).toBe('https://youtu.be/dQw4w9WgXcQ');
    });

    it('returns null on invalid or malformed URLs', () => {
      expect(parseVideoUrl('')).toBeNull();
      expect(parseVideoUrl('   ')).toBeNull();
      expect(parseVideoUrl(null as any)).toBeNull();
      expect(parseVideoUrl(undefined as any)).toBeNull();
      expect(parseVideoUrl('ftp://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
      expect(parseVideoUrl('javascript:alert(1)')).toBeNull();
      expect(parseVideoUrl('https://google.com')).toBeNull();
      expect(parseVideoUrl('https://phinfind.vn/shop/123')).toBeNull();
    });
  });

  describe('youtubeThumbnail', () => {
    it('returns the deterministic hqdefault thumbnail URL', () => {
      expect(youtubeThumbnail('dQw4w9WgXcQ')).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });
  });
});
