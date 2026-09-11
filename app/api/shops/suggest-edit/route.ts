import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rateLimit';

const ALLOWED_FIELDS = new Set([
  'name',
  'address',
  'lat',
  'lon',
  'phone',
  'website',
  'price_range',
  'categories',
  'amenities',
  'custom_amenities',
  'opening_hours',
  'photos',
]);

const DISALLOWED_FIELDS = new Set([
  'place_id',
  'created_by',
  'verified',
  'rating',
  'total_ratings',
  'hidden',
  'created_at',
  'updated_at',
]);

const suggestEditSchema = z.object({
  shop_place_id: z.string().trim().min(1, 'Mã định danh quán không được để trống'),
  changes: z
    .record(
      z.string(),
      z.object({
        from: z.any(),
        to: z.any(),
      })
    )
    .refine((val) => Object.keys(val).length > 0, {
      message: 'Vui lòng đề xuất ít nhất một thay đổi',
    })
    .refine((val) => Object.keys(val).length <= 3, {
      message: 'Chỉ có thể đề xuất tối đa 3 thay đổi mỗi lần.',
    })
    .refine(
      (val) => {
        const keys = Object.keys(val);
        return keys.every((k) => ALLOWED_FIELDS.has(k) && !DISALLOWED_FIELDS.has(k));
      },
      {
        message: 'Chứa trường thông tin không được phép đề xuất chỉnh sửa',
      }
    ),
  reason: z.string().trim().max(500, 'Lý do thay đổi tối đa 500 ký tự').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    let rawBody: any;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ (JSON)' }, { status: 400 });
    }

    const parseResult = suggestEditSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { shop_place_id, changes, reason } = parseResult.data;

    // Rate limit: 3 suggestions per user per day (sliding 24h window)
    const rateLimit = checkRateLimit(`suggest_edit:${user.id}`, 3, 24 * 60 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Bạn đã vượt quá giới hạn 3 đề xuất mỗi ngày. Vui lòng thử lại sau.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset),
          },
        }
      );
    }

    // Verify shop existence and ownership
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('place_id, name, created_by')
      .eq('place_id', shop_place_id)
      .maybeSingle();

    if (shopError) {
      console.error('[API /api/shops/suggest-edit POST] Shop fetch error:', shopError);
      return NextResponse.json({ error: 'Lỗi khi kiểm tra thông tin quán' }, { status: 500 });
    }

    if (!shop) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin quán cà phê' },
        { status: 404 }
      );
    }

    // Reject if current user is the shop's creator
    if (shop.created_by && shop.created_by === user.id) {
      return NextResponse.json(
        { error: 'Bạn là người tạo quán này, hãy dùng tính năng Chỉnh sửa.' },
        { status: 400 }
      );
    }

    // Check for existing pending suggestion from this user for this shop
    const { data: existingPending, error: pendingCheckError } = await supabase
      .from('shop_edit_suggestions')
      .select('id')
      .eq('shop_place_id', shop_place_id)
      .eq('suggested_by', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (pendingCheckError) {
      console.error(
        '[API /api/shops/suggest-edit POST] Pending check error:',
        pendingCheckError
      );
      return NextResponse.json({ error: 'Lỗi kiểm tra đề xuất đang chờ' }, { status: 500 });
    }

    if (existingPending) {
      return NextResponse.json(
        { error: 'Bạn đã có một đề xuất đang chờ duyệt cho quán này.' },
        { status: 409 }
      );
    }

    // Insert suggestion record
    const { data: suggestion, error: insertError } = await supabase
      .from('shop_edit_suggestions')
      .insert({
        shop_place_id,
        suggested_by: user.id,
        changes,
        reason: reason || null,
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('[API /api/shops/suggest-edit POST] Insert error:', insertError);
      // Handle unique constraint conflict just in case of race condition
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Bạn đã có một đề xuất đang chờ duyệt cho quán này.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: insertError.message || 'Không thể tạo đề xuất chỉnh sửa' },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/shops/suggest-edit POST] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Lỗi hệ thống khi gửi đề xuất chỉnh sửa' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shopPlaceId = searchParams.get('shop_place_id');

    if (shopPlaceId) {
      const { data: pending, error } = await supabase
        .from('shop_edit_suggestions')
        .select('*')
        .eq('shop_place_id', shopPlaceId)
        .eq('suggested_by', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        hasPending: Boolean(pending),
        pending: pending || null,
      });
    }

    // Otherwise fetch all suggestions submitted by current user
    const { data: suggestions, error } = await supabase
      .from('shop_edit_suggestions')
      .select('*, shop:shops(place_id, name, address)')
      .eq('suggested_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestions: suggestions || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Lỗi hệ thống khi tải đề xuất của bạn' },
      { status: 500 }
    );
  }
}
