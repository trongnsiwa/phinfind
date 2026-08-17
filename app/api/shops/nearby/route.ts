import { NextRequest, NextResponse } from 'next/server';
import { fetchNearbyCoffeeShops } from '@/lib/geoapify/client';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || `${DEFAULT_LOCATION.lat}`);
  const lng = parseFloat(searchParams.get('lng') || `${DEFAULT_LOCATION.lng}`);
  const radius = parseInt(searchParams.get('radius') || '3000', 10);

  try {
    const shops = await fetchNearbyCoffeeShops(lat, lng, radius);
    return NextResponse.json({ shops });
  } catch (error) {
    console.error('API Error in /api/shops/nearby:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby coffee shops' },
      { status: 500 }
    );
  }
}
