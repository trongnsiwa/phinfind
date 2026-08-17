import { NextRequest, NextResponse } from 'next/server';
import { searchCoffeeShops } from '@/lib/geoapify/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

  if (!q.trim()) {
    return NextResponse.json({ shops: [] });
  }

  try {
    const shops = await searchCoffeeShops(q, lat, lng);
    return NextResponse.json({ shops });
  } catch (error) {
    console.error('API Error in /api/shops/search:', error);
    return NextResponse.json(
      { error: 'Failed to search coffee shops' },
      { status: 500 }
    );
  }
}
