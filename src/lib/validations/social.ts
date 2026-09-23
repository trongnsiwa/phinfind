import { z } from 'zod';

/** Optional URL restricted to a specific domain (rejects typos & phishing). */
export function socialUrl(domain: RegExp, label: string) {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (u) => !u || u.startsWith('http://') || u.startsWith('https://'),
      `Link ${label} không hợp lệ`
    )
    .refine(
      (u) => {
        if (!u) return true;
        try {
          new URL(u);
          return true;
        } catch {
          return false;
        }
      },
      `Link ${label} không hợp lệ`
    )
    .refine((u) => !u || domain.test(u), `Link ${label} phải thuộc ${domain.source}`)
    .transform((val) => (val && val.trim() ? val.trim() : null));
}

export const facebookUrl = socialUrl(/^https?:\/\/(www\.|m\.|web\.)?(facebook|fb)\.com\//i, 'Facebook');
export const instagramUrl = socialUrl(/^https?:\/\/(www\.)?instagram\.com\//i, 'Instagram');
export const tiktokUrl = socialUrl(/^https?:\/\/(www\.|m\.)?tiktok\.com\//i, 'TikTok');
export const youtubeUrl = socialUrl(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i, 'YouTube');
export const zaloUrl = socialUrl(/^https?:\/\/(www\.)?(zalo\.me|zalo\.com)\//i, 'Zalo');

/** Optional website URL accepting any valid https URL without a domain restriction. */
export const websiteUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (u) => !u || u.startsWith('https://'),
    'Đường dẫn website phải bắt đầu bằng https://'
  )
  .refine(
    (u) => {
      if (!u) return true;
      try {
        const parsed = new URL(u);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    'Đường dẫn website không hợp lệ'
  )
  .transform((val) => (val && val.trim() ? val.trim() : null));
