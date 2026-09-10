import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';
import { updateShopSchema } from '@/lib/validations/shop';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yêu cầu xác thực. Vui lòng đăng nhập để cập nhật quán cà phê.' },
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

    const validationResult = updateShopSchema.safeParse(body);
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

    // Verify ownership
    const { data: existingShop, error: fetchError } = await supabase
      .from('shops')
      .select('place_id, created_by')
      .eq('place_id', data.place_id)
      .single();

    if (fetchError || !existingShop) {
      return NextResponse.json(
        { error: 'Không tìm thấy quán cà phê này trên hệ thống.' },
        { status: 404 }
      );
    }

    if (existingShop.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền chỉnh sửa quán cà phê này.' },
        { status: 403 }
      );
    }

    // Derive amenities if only categories or custom_amenities are sent
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

    // Never allow client to change place_id, created_by, rating, total_ratings, created_at, or verified
    const updatePayload = {
      name: data.name,
      address: data.address,
      lat: data.lat,
      lon: data.lon,
      phone: data.phone,
      website: data.website,
      price_range: data.price_range,
      categories: finalCategories,
      custom_amenities: finalCustomAmenities,
      amenities: finalAmenities,
      photos: data.photos,
      opening_hours: data.opening_hours,
      verified: false,
      updated_at: new Date().toISOString()
    };

    const { data: updatedRow, error: updateError } = await supabase
      .from('shops')
      .update(updatePayload)
      .eq('place_id', data.place_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('[API /api/shops/update] Supabase update error:', updateError);
      return NextResponse.json(
        { error: `Không thể cập nhật quán: ${updateError.message}` },
        { status: 500 }
      );
    }

    const coffeeShop = mapDbShopToCoffeeShop(updatedRow, data.lat, data.lon);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật quán cà phê thành công! Quán đang chờ xác minh lại.',
      shop: coffeeShop
    });
  } catch (error: any) {
    console.error('[API /api/shops/update] Unhandled error:', error);
    return NextResponse.json(
      { error: error?.message || 'Đã xảy ra lỗi máy chủ trong quá trình cập nhật quán.' },
      { status: 500 }
    );
  }
}
