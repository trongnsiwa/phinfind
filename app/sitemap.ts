import { createPublicClient } from '@/lib/supabase/server';

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.vercel.app';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    }
  ];

  let shopRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createPublicClient();
    const { data: shops, error } = await supabase
      .from('shops')
      .select('place_id, updated_at, created_at')
      .neq('hidden', true)
      .order('updated_at', { ascending: false })
      .limit(50000);

    if (error) {
      console.error('[sitemap] Failed to fetch shops:', error);
    } else if (shops) {
      shopRoutes = shops
        .filter((shop): shop is typeof shop & { place_id: string } => Boolean(shop.place_id))
        .map((shop) => ({
          url: `${BASE_URL}/shop/${shop.place_id}`,
          lastModified: new Date(shop.updated_at || shop.created_at || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.8
        }));
    }
  } catch (err) {
    console.error('[sitemap] Unexpected error fetching shops:', err);
  }

  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createPublicClient();
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10000);

    if (error) {
      console.error('[sitemap] Failed to fetch profiles:', error);
    } else if (profiles) {
      profileRoutes = profiles
        .filter((p): p is typeof p & { username: string } => Boolean(p.username))
        .map((p) => ({
          url: `${BASE_URL}/u/${encodeURIComponent(p.username)}`,
          lastModified: new Date(p.updated_at || Date.now()),
          changeFrequency: 'monthly' as const,
          priority: 0.5
        }));
    }
  } catch (err) {
    console.error('[sitemap] Unexpected error fetching profiles:', err);
  }

  return [...staticRoutes, ...shopRoutes, ...profileRoutes];
}
