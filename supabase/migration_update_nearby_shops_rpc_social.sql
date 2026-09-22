-- ============================================================================
-- Migration: Update nearby_shops RPC to return shop social media links
-- Feature:   Social presence (Facebook, Instagram, TikTok, YouTube, Zalo)
-- Date:      2026-09-22
-- ============================================================================

CREATE OR REPLACE FUNCTION public.nearby_shops(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT NULL,
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  place_id TEXT,
  name TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  rating NUMERIC,
  total_ratings INT,
  price_range TEXT,
  photos TEXT[],
  website TEXT,
  phone TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  zalo_url TEXT,
  categories TEXT[],
  amenities JSONB,
  custom_amenities JSONB,
  opening_hours JSONB,
  created_by UUID,
  verified BOOLEAN,
  hidden BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.place_id,
    s.name,
    s.address,
    s.lat,
    s.lon,
    s.rating,
    s.total_ratings,
    s.price_range,
    s.photos,
    s.website,
    s.phone,
    s.facebook_url,
    s.instagram_url,
    s.tiktok_url,
    s.youtube_url,
    s.zalo_url,
    s.categories,
    s.amenities,
    s.custom_amenities,
    s.opening_hours,
    s.created_by,
    s.verified,
    s.hidden,
    s.created_at,
    s.updated_at,
    earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(s.lat, s.lon)) AS distance_meters
  FROM public.shops s
  WHERE s.hidden = false
    AND (
      radius_km IS NULL
      OR earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(s.lat, s.lon)) <= radius_km * 1000
    )
  ORDER BY distance_meters ASC
  LIMIT page_limit
  OFFSET page_offset;
$$;

GRANT EXECUTE ON FUNCTION public.nearby_shops(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INT, INT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
