import { cache } from 'react';
import { createPublicClient } from '@/lib/supabase/server';

export interface PublicProfileData {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  website_url?: string | null;
  created_at: string;
}

export const fetchPublicProfileForServer = cache(
  async (username: string): Promise<PublicProfileData | null> => {
    const trimmed = username?.trim();
    if (!trimmed) return null;

    try {
      const supabase = await createPublicClient();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, facebook_url, instagram_url, tiktok_url, website_url, created_at')
        .ilike('username', trimmed)
        .maybeSingle();

      if (error) {
        console.error('[fetchPublicProfileForServer] Error fetching profile:', error);
        return null;
      }

      if (!profile || !profile.username) {
        return null;
      }

      return {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        facebook_url: profile.facebook_url ?? null,
        instagram_url: profile.instagram_url ?? null,
        tiktok_url: profile.tiktok_url ?? null,
        website_url: profile.website_url ?? null,
        created_at: profile.created_at,
      };
    } catch (err) {
      console.error('[fetchPublicProfileForServer] Unexpected error:', err);
      return null;
    }
  }
);
