import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/auth-helpers';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = await requireAdmin();
    if (!adminAuth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [pendingRes, rejectedRes] = await Promise.all([
      supabase
        .from('shops')
        .select('*, creator:profiles(id, full_name, username, email, avatar_url)')
        .eq('verified', false)
        .eq('hidden', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('shops')
        .select('*, creator:profiles(id, full_name, username, email, avatar_url)')
        .eq('hidden', true)
        .order('created_at', { ascending: false }),
    ]);

    if (pendingRes.error) {
      console.error('[API /api/admin/shops GET] Pending fetch error:', pendingRes.error);
      return NextResponse.json({ error: pendingRes.error.message }, { status: 500 });
    }

    if (rejectedRes.error) {
      console.error('[API /api/admin/shops GET] Rejected fetch error:', rejectedRes.error);
      return NextResponse.json({ error: rejectedRes.error.message }, { status: 500 });
    }

    const mapShop = (row: any) => {
      const creator = Array.isArray(row.creator) ? row.creator[0] : (row.creator || null);
      return {
        ...mapDbShopToCoffeeShop(row),
        creator,
      };
    };

    return NextResponse.json({
      pending: (pendingRes.data || []).map(mapShop),
      rejected: (rejectedRes.data || []).map(mapShop),
    });
  } catch (error: any) {
    console.error('[API /api/admin/shops GET] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = await requireAdmin();
    if (!adminAuth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { placeId, action } = body;

    if (!placeId || typeof placeId !== 'string' || !placeId.trim()) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    if (!action || !['approve', 'reject', 'unhide'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve', 'reject', or 'unhide'" },
        { status: 400 }
      );
    }

    const cleanPlaceId = placeId.trim();

    // Check if shop exists
    const { data: existingShop, error: fetchError } = await supabase
      .from('shops')
      .select('place_id')
      .eq('place_id', cleanPlaceId)
      .maybeSingle();

    if (fetchError) {
      console.error('[API /api/admin/shops PATCH] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!existingShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    let updateFields: Record<string, any> = {};

    if (action === 'approve') {
      updateFields = {
        verified: true,
        hidden: false,
        updated_at: now,
      };
    } else if (action === 'reject') {
      updateFields = {
        verified: false,
        hidden: true,
        updated_at: now,
      };
    } else if (action === 'unhide') {
      updateFields = {
        hidden: false,
        updated_at: now,
      };
    }

    const { data: updatedShop, error: updateError } = await supabase
      .from('shops')
      .update(updateFields)
      .eq('place_id', cleanPlaceId)
      .select('*, creator:profiles(id, full_name, username, email, avatar_url)')
      .single();

    if (updateError) {
      console.error('[API /api/admin/shops PATCH] Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const creator = Array.isArray(updatedShop.creator) ? updatedShop.creator[0] : (updatedShop.creator || null);

    // Dispatch notification to shop creator if not an orphaned shop.
    // NOTE: These notification inserts happen in the API layer instead of a DB trigger
    // because administrators perform the verification decision explicitly, and there is
    // no natural row-level event on shops that maps 1:1 to a user notification.
    if (updatedShop.created_by) {
      if (action === 'approve') {
        await supabase.from('notifications').insert({
          user_id: updatedShop.created_by,
          type: 'shop_approved',
          actor_id: user.id,
          shop_place_id: cleanPlaceId,
          payload: { shop_name: updatedShop.name },
        });
      } else if (action === 'reject') {
        await supabase.from('notifications').insert({
          user_id: updatedShop.created_by,
          type: 'shop_rejected',
          actor_id: user.id,
          shop_place_id: cleanPlaceId,
          payload: {
            shop_name: updatedShop.name,
            reason: body.reason || undefined,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      action,
      shop: {
        ...mapDbShopToCoffeeShop(updatedShop),
        creator,
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/shops PATCH] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
