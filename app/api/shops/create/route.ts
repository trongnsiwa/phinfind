import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

const openingPeriodSchema = z.object({
  open: z.object({
    day: z.number().int().min(0).max(6),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Định dạng giờ phải là HH:MM')
  }),
  close: z.object({
    day: z.number().int().min(0).max(6),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Định dạng giờ phải là HH:MM')
  })
});

const openingHoursSchema = z.object({
  open_now: z.boolean().default(true),
  periods: z.array(openingPeriodSchema).optional()
});

const customAmenitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên tiện ích không được để trống')
    .max(100, 'Tên tiện ích tối đa 100 ký tự'),
  description: z.string().trim().max(300, 'Mô tả tiện ích tối đa 300 ký tự').optional().default('')
});

const amenitySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1, 'Tên tiện ích không được để trống').max(100),
  type: z.enum(['predefined', 'custom']).default('custom'),
  description: z.string().trim().max(500).default('')
});

const createShopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên quán không được để trống')
    .max(200, 'Tên quán tối đa 200 ký tự'),
  address: z
    .string()
    .trim()
    .min(1, 'Địa chỉ không được để trống')
    .max(500, 'Địa chỉ tối đa 500 ký tự'),
  lat: z.number().min(-90, 'Vĩ độ phải từ -90 đến 90').max(90, 'Vĩ độ phải từ -90 đến 90'),
  lon: z
    .number()
    .min(-180, 'Kinh độ phải từ -180 đến 180')
    .max(180, 'Kinh độ phải từ -180 đến 180'),

  phone: z
    .string()
    .trim()
    .max(50, 'Số điện thoại tối đa 50 ký tự')
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  website: z
    .string()
    .trim()
    .url('Đường dẫn website không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  price_range: z
    .enum(['₫', '₫₫', '₫₫₫', '₫₫₫₫'])
    .optional()
    .nullable()
    .transform((val) => val || null),
  categories: z.array(z.string().trim().min(1)).optional().default([]),
  custom_amenities: z.array(customAmenitySchema).optional().default([]),
  amenities: z.array(amenitySchema).optional().default([]),
  photos: z.array(z.string().trim().url('Đường dẫn ảnh không hợp lệ')).optional().default([]),
  opening_hours: openingHoursSchema.optional().default({ open_now: true })
});

export type CreateShopInput = z.infer<typeof createShopSchema>;

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

    const insertPayload = {
      place_id: placeId,
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
      created_by: user.id,
      verified: false,
      rating: 0,
      total_ratings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };


    const { data: createdRow, error: insertError } = await supabase
      .from('shops')
      .insert([insertPayload])
      .select('*')
      .single();

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
