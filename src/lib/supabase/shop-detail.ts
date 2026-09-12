import { cache } from 'react';
import { createPublicClient } from '@/lib/supabase/server';
import { fetchCommunityCoverPhotos, mapDbShopToCoffeeShop } from '@/lib/supabase/shops';
import type { CoffeeShop } from '@/types/shop';

export const fetchShopForServer = cache(async (placeId: string): Promise<CoffeeShop | null> => {
  if (!placeId) return null;

  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('place_id', placeId)
      .neq('hidden', true)
      .maybeSingle();

    if (error) {
      console.error('[fetchShopForServer] Error fetching shop:', error);
      return null;
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
