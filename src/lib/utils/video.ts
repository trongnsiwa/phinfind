import type { ShopVideo, VideoPlatform } from '@/types/shop';

interface VideoPattern {
  platform: VideoPlatform;
  regex: RegExp;
  idIndex: number;
}

const VIDEO_PATTERNS: VideoPattern[] = [
  // TikTok long-form: tiktok.com/@user/video/<id>
  {
    platform: 'tiktok',
    regex: /(?:www\.|m\.)?tiktok\.com\/@[^/?#\s]+\/video\/(\d+)/i,
    idIndex: 1
  },
  // TikTok short-form: tiktok.com/t/<code> or vt.tiktok.com/<code> or vm.tiktok.com/<code>
  {
    platform: 'tiktok',
    regex: /(?:www\.|m\.|vt\.|vm\.)?tiktok\.com\/(?:t\/)?([\w-]+)/i,
    idIndex: 1
  },
  // YouTube watch, youtu.be, shorts, and embed URLs
  {
    platform: 'youtube',
    regex: /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/i,
    idIndex: 1
  },
  // Instagram reels, posts, and IGTV
  {
    platform: 'instagram',
    regex: /(?:www\.)?instagram\.com\/(?:reel|p|tv)\/([\w-]+)/i,
    idIndex: 1
  },
  // Facebook video URLs (standard, reels)
  {
    platform: 'facebook',
    regex: /(?:www\.|m\.|web\.)?facebook\.com\/(?:[^/?#\s]+\/videos|reel)\/(\d+)/i,
    idIndex: 1
  },
  // Facebook watch query URLs (?v=...)
  {
    platform: 'facebook',
    regex: /(?:www\.|m\.|web\.)?facebook\.com\/watch\/?\?(?:.*&)?v=(\d+)/i,
    idIndex: 1
  },
  {
    platform: 'facebook',
    regex: /(?:www\.)?fb\.watch\/([\w-]+)/i,
    idIndex: 1
  },
  {
    platform: 'facebook',
    regex: /(?:www\.|m\.|web\.)?facebook\.com\/share\/(?:v|r)\/([\w-]+)/i,
    idIndex: 1
  }
];

/**
 * Parses and validates a video URL from TikTok, YouTube, Instagram, or Facebook.
 * Trims input and requires http or https scheme.
 * Returns null when no pattern matches or input is invalid.
 */
export function parseVideoUrl(url?: string | null): ShopVideo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;

  for (const { platform, regex, idIndex } of VIDEO_PATTERNS) {
    const match = trimmed.match(regex);
    if (match && match[idIndex]) {
      return {
        url: trimmed,
        platform,
        video_id: match[idIndex]
      };
    }
  }

  return null;
}

/**
 * Generates the deterministic YouTube thumbnail URL (hqdefault) from video ID.
 */
export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
