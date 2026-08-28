import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY! // Use SECRET_KEY instead of SERVICE_ROLE_KEY
);

const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v2/places';
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

const SEED_LAT = process.env.SEED_LAT ? parseFloat(process.env.SEED_LAT) : 21.0285;
const SEED_LNG = process.env.SEED_LNG ? parseFloat(process.env.SEED_LNG) : 105.8542;
const SEED_RADIUS = process.env.SEED_RADIUS ? parseInt(process.env.SEED_RADIUS, 10) : 5000;
const SEED_LIMIT = process.env.SEED_LIMIT ? parseInt(process.env.SEED_LIMIT, 10) : 100;

async function seedShops() {
  if (!GEOAPIFY_API_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_GEOAPIFY_API_KEY in .env.local');
    process.exit(1);
  }

  console.log(`📍 Fetching coffee shops from Geoapify (Center: [${SEED_LAT}, ${SEED_LNG}], ${SEED_RADIUS}m radius, limit: ${SEED_LIMIT})...`);

  try {
    const response = await axios.get(GEOAPIFY_BASE_URL, {
      params: {
        categories: 'catering.cafe', // ✅ Fixed: removed "catering.coffee_shop"
        filter: `circle:${SEED_LNG},${SEED_LAT},${SEED_RADIUS}`,
        bias: `proximity:${SEED_LNG},${SEED_LAT}`,
        limit: SEED_LIMIT,
        apiKey: GEOAPIFY_API_KEY
      }
    });

    const features = response.data.features || [];

    if (features.length === 0) {
      console.warn('⚠️ No shops found. Check your Geoapify API key and location.');
      return;
    }

    const shops = features.map((feature: any) => {
      const props = feature.properties;
      return {
        place_id: props.place_id,
        name: props.name || 'Unnamed Coffee Shop',
        address: props.formatted || props.address_line1 || '',
        lat: props.lat,
        lon: props.lon,
        rating: props.datasource?.raw?.rating || 0,
        total_ratings: props.datasource?.raw?.rating_count || 0,
        price_range: props.datasource?.raw?.price_level || null,
        photos: props.datasource?.raw?.photo_urls || [],
        website: props.datasource?.raw?.website || null,
        phone: props.datasource?.raw?.phone || null,
        categories: props.categories || ['catering.cafe'],
        opening_hours: {
          open_now: props.opening_hours?.open_now ?? false
        },
        verified: true,
        created_by: null
      };
    });


    console.log(`✅ Fetched ${shops.length} shops. Upserting into Supabase...`);

    const { data, error } = await supabaseAdmin
      .from('shops')
      .upsert(shops, { onConflict: 'place_id' })
      .select();

    if (error) {
      console.error('❌ Error inserting shops:', error.message);
    } else {
      console.log(`🎉 Successfully upserted ${data?.length || 0} shops.`);
    }
  } catch (error: any) {
    console.error('❌ Error fetching from Geoapify:', error.response?.data || error.message);
  }
}

seedShops();
