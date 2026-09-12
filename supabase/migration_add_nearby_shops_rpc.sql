-- ==============================================================================
-- Migration: Add nearby_shops & nearby_shops_count RPCs (PERF-02)
-- Purpose: Replace client-side O(n) fetch-all and JS sort with server-side
--          distance calculation and pagination leveraging Postgres earthdistance
--          and the GIST index on ll_to_earth(lat, lon).
-- ==============================================================================

-- 1. Ensure required extensions for earthdistance are enabled
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- 2. Create the nearby_shops function for spatial search and pagination
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

-- 3. Create companion count function for total matches within radius
CREATE OR REPLACE FUNCTION public.nearby_shops_count(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::BIGINT
  FROM public.shops s
  WHERE s.hidden = false
    AND (
      radius_km IS NULL
      OR earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(s.lat, s.lon)) <= radius_km * 1000
    );
$$;

-- 4. Grant execution permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.nearby_shops(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nearby_shops_count(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon, authenticated;

-- 5. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- Rollback Instructions
-- ==============================================================================
-- To roll back this migration, execute the following block:
-- DROP FUNCTION IF EXISTS public.nearby_shops(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INT, INT);
-- DROP FUNCTION IF EXISTS public.nearby_shops_count(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);
-- NOTIFY pgrst, 'reload schema';
