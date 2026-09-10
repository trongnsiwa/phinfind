import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yêu cầu xác thực. Vui lòng đăng nhập để xóa quán cà phê.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { error: 'Thiếu mã định danh quán cà phê (placeId).' },
        { status: 400 }
      );
    }

    // Verify shop existence and ownership
    const { data: existingShop, error: fetchError } = await supabase
      .from('shops')
      .select('place_id, created_by')
      .eq('place_id', placeId)
      .single();

    if (fetchError || !existingShop) {
      return NextResponse.json(
        { error: 'Không tìm thấy quán cà phê cần xóa.' },
        { status: 404 }
      );
    }

    if (existingShop.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xóa quán cà phê này.' },
        { status: 403 }
      );
    }

    // Clean up associated rows in saved_shops and visits since they lack FK cascades
    await supabase.from('saved_shops').delete().eq('place_id', placeId);
    await supabase.from('visits').delete().eq('shop_place_id', placeId);
    await supabase.from('reviews').delete().eq('shop_place_id', placeId);

    // Hard delete the shop
    const { error: deleteError } = await supabase
      .from('shops')
      .delete()
      .eq('place_id', placeId);

    if (deleteError) {
      console.error('[API /api/shops/delete] Supabase delete error:', deleteError);
      return NextResponse.json(
        { error: `Không thể xóa quán: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa quán cà phê thành công.'
    });
  } catch (error: any) {
    console.error('[API /api/shops/delete] Unhandled error:', error);
    return NextResponse.json(
      { error: error?.message || 'Đã xảy ra lỗi máy chủ trong quá trình xóa quán.' },
      { status: 500 }
    );
  }
}
