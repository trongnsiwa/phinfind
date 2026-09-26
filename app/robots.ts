import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/favorites/',
          '/feed/',
          '/feed',
          '/recap/',
          '/recap',
          '/profile/',
          '/auth/',
          '/_next/',
          '/*?*shop=',
          '/*?*redirect='
        ]
      },
      {
        userAgent: 'GPTBot',
        disallow: '/'
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL
  };
}
