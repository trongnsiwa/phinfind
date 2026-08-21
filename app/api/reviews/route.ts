import { NextRequest, NextResponse } from 'next/server';
import { createClient, createPublicClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json({ error: 'placeId required' }, { status: 400 });
    }

    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, shop_place_id, user_id, rating, comment, created_at, profiles(full_name, avatar_url, username)')
      .eq('shop_place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ reviews: [] });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { shop_place_id, rating, comment } = body;

    if (!shop_place_id) {
      return NextResponse.json({ error: 'Shop identifier is required.' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Please provide a rating between 1 and 5 stars.' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return NextResponse.json({ error: 'Review comment must be at least 3 characters long.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          shop_place_id,
          user_id: user.id,
          rating: numericRating,
          comment: comment.trim(),
        },
      ])
      .select('id, shop_place_id, user_id, rating, comment, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to submit review.' }, { status: 500 });
  }
}
