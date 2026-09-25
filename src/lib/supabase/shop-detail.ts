import { cache } from 'react';
import { createPublicClient } from '@/lib/supabase/server';
import { fetchCommunityCoverPhotos, mapDbShopToCoffeeShop } from '@/lib/supabase/shops';
import type { CoffeeShop } from '@/types/shop';

export const fetchShopForServer = cache(async (identifier: string): Promise<CoffeeShop | null> => {
  if (!identifier) return null;

  try {
    const supabase = await createPublicClient();

    // 1. Try matching slug first
    let { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', identifier)
      .neq('hidden', true)
      .maybeSingle();

    if (error) {
      console.error('[fetchShopForServer] Error fetching shop by slug:', error);
      return null;
    }

    // 2. Fall back to place_id when no slug match is found
    if (!data) {
      const fallbackResult = await supabase
        .from('shops')
        .select('*')
        .eq('place_id', identifier)
        .neq('hidden', true)
        .maybeSingle();

      if (fallbackResult.error) {
        console.error('[fetchShopForServer] Error fetching shop by place_id:', fallbackResult.error);
        return null;
      }

      data = fallbackResult.data;
    }

    if (!data || data.hidden) return null;

    let communityCover = null;
    if (!Array.isArray(data.photos) || data.photos.length === 0) {
      const covers = await fetchCommunityCoverPhotos(supabase, [data.place_id]);
      communityCover = covers[data.place_id] ?? null;
    }

    return mapDbShopToCoffeeShop(data, undefined, undefined, communityCover);
  } catch (err) {
    console.error('[fetchShopForServer] Unexpected error:', err);
    return null;
  }
});
