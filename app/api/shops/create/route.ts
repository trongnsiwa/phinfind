import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';
import { createShopSchema, CreateShopInput } from '@/lib/validations/shop';

export type { CreateShopInput };

function generateUniquePlaceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `custom_${timestamp}_${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yêu cầu xác thực. Vui lòng đăng nhập để thêm quán cà phê.' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Dữ liệu yêu cầu không hợp lệ (Invalid JSON format).' },
        { status: 400 }
      );
    }

    const validationResult = createShopSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstMessage = issues[0]?.message || 'Dữ liệu không hợp lệ.';
      return NextResponse.json(
        {
          error: firstMessage,
          details: issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const placeId = generateUniquePlaceId();

    // Generate readable slug
    let slug: string | null = null;
    try {
      const { data: slugData, error: slugRpcError } = await supabase.rpc('generate_shop_slug', {
        p_name: data.name,
        p_place_id: placeId
      });
      if (!slugRpcError && slugData) {
        slug = slugData;
      }
    } catch (slugErr) {
      console.warn('[API /api/shops/create] Slug generation warning:', slugErr);
    }

    // Derive amenities if only categories or custom_amenities are sent (backward compatibility)
    let finalAmenities = data.amenities || [];
    let finalCategories = data.categories || [];

    if (
      finalAmenities.length === 0 &&
      (finalCategories.length > 0 || (data.custom_amenities && data.custom_amenities.length > 0))
    ) {
      finalAmenities = [
        ...finalCategories.map((c) => ({
          id: c,
          name: c,
          type: 'predefined' as const,
          description: ''
        })),
        ...(data.custom_amenities || []).map((ca, idx) => ({
          id: `custom_${idx}_${Date.now()}`,
          name: ca.name,
          type: 'custom' as const,
          description: ca.description || ''
        }))
      ];
    } else if (finalCategories.length === 0 && finalAmenities.length > 0) {
      finalCategories = finalAmenities.map((a) => a.id);
    }

    const finalCustomAmenities =
      data.custom_amenities && data.custom_amenities.length > 0
        ? data.custom_amenities
        : finalAmenities
            .filter((a) => a.type === 'custom')
            .map((a) => ({ name: a.name, description: a.description }));

    const insertPayload: Record<string, any> = {
      place_id: placeId,
      slug,
      name: data.name,
      address: data.address,
      lat: data.lat,
      lon: data.lon,
      phone: data.phone,
      website: data.website,
      facebook_url: data.facebook_url,
      instagram_url: data.instagram_url,
      tiktok_url: data.tiktok_url,
      youtube_url: data.youtube_url,
      zalo_url: data.zalo_url,
      price_range: data.price_range,
      categories: finalCategories,
      custom_amenities: finalCustomAmenities,
      amenities: finalAmenities,
      photos: data.photos,
      videos: data.videos ?? [],
      opening_hours: data.opening_hours,
      created_by: user.id,
      verified: false,
      rating: 0,
      total_ratings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };


    let { data: createdRow, error: insertError } = await supabase
      .from('shops')
      .insert([insertPayload])
      .select('*')
      .single();

    // On unique violation (error code 23505) for the slug column, retry the RPC once
    if (
      insertError &&
      insertError.code === '23505' &&
      (insertError.message?.includes('slug') || insertError.details?.includes('slug'))
    ) {
      console.warn('[API /api/shops/create] Slug collision encountered, retrying once...');
      const { data: retrySlugData } = await supabase.rpc('generate_shop_slug', {
        p_name: data.name,
        p_place_id: placeId
      });
      if (retrySlugData) {
        insertPayload.slug = retrySlugData;
        const retryResult = await supabase
          .from('shops')
          .insert([insertPayload])
          .select('*')
          .single();
        createdRow = retryResult.data;
        insertError = retryResult.error;
      }
    }

    if (insertError) {
      console.error('[API /api/shops/create] Supabase insert error:', insertError);

      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Quán cà phê với định danh này đã tồn tại trên hệ thống.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: `Không thể thêm quán: ${insertError.message}` },
        { status: 500 }
      );
    }

    const coffeeShop = mapDbShopToCoffeeShop(createdRow, data.lat, data.lon);

    return NextResponse.json(
      {
        success: true,
        message: 'Thêm quán cà phê thành công! Quán đang chờ ban quản trị xác minh.',
        shop: coffeeShop
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/shops/create] Unhandled error:', error);
    return NextResponse.json(
      { error: error?.message || 'Đã xảy ra lỗi máy chủ trong quá trình thêm quán.' },
      { status: 500 }
    );
  }
}
