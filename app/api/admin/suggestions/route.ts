import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/auth-helpers';

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

export async function GET() {
  try {
    const adminAuth = await requireAdmin();
    if (!adminAuth) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    // 1. Fetch pending suggestions and recently reviewed suggestions
    const [pendingRes, reviewedRes] = await Promise.all([
      supabase
        .from('shop_edit_suggestions')
        .select(
          '*, shop:shops(place_id, name, address), suggester:profiles!shop_edit_suggestions_suggested_by_fkey(id, full_name, username, avatar_url)'
        )
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('shop_edit_suggestions')
        .select(
          '*, shop:shops(place_id, name, address), suggester:profiles!shop_edit_suggestions_suggested_by_fkey(id, full_name, username, avatar_url), reviewer:profiles!shop_edit_suggestions_reviewed_by_fkey(id, full_name, username, avatar_url)'
        )
        .neq('status', 'pending')
        .order('reviewed_at', { ascending: false })
        .limit(10),
    ]);

    if (pendingRes.error) {
      console.error('[API /api/admin/suggestions GET] Pending fetch error:', pendingRes.error);
      return NextResponse.json({ error: pendingRes.error.message }, { status: 500 });
    }

    if (reviewedRes.error) {
      console.error('[API /api/admin/suggestions GET] Reviewed fetch error:', reviewedRes.error);
      return NextResponse.json({ error: reviewedRes.error.message }, { status: 500 });
    }

    const pendingRows = pendingRes.data || [];
    const reviewedRows = reviewedRes.data || [];

    // 2. Compute trust score for pending suggesters (visits + reviews count)
    const suggesterIds = Array.from(
      new Set(pendingRows.map((r: any) => r.suggested_by).filter(Boolean))
    );

    const trustMap = new Map<string, { reviewsCount: number; visitsCount: number; score: number }>();
    suggesterIds.forEach((id) => {
      trustMap.set(id, { reviewsCount: 0, visitsCount: 0, score: 0 });
    });

    if (suggesterIds.length > 0) {
      const [reviewsRes, visitsRes] = await Promise.all([
        supabase.from('reviews').select('user_id').in('user_id', suggesterIds),
        supabase.from('visits').select('user_id').in('user_id', suggesterIds),
      ]);

      if (!reviewsRes.error && reviewsRes.data) {
        reviewsRes.data.forEach((r: any) => {
          const entry = trustMap.get(r.user_id);
          if (entry) entry.reviewsCount++;
        });
      }

      if (!visitsRes.error && visitsRes.data) {
        visitsRes.data.forEach((v: any) => {
          const entry = trustMap.get(v.user_id);
          if (entry) entry.visitsCount++;
        });
      }

      // Calculate total trust score
      for (const entry of trustMap.values()) {
        entry.score = entry.reviewsCount + entry.visitsCount;
      }
    }

    // Format pending suggestions with trust and sort by trust score DESC, then created_at DESC
    const enrichedPending = pendingRows.map((row: any) => {
      const suggester = Array.isArray(row.suggester) ? row.suggester[0] : row.suggester;
      const shop = Array.isArray(row.shop) ? row.shop[0] : row.shop;
      const trust = trustMap.get(row.suggested_by) || { reviewsCount: 0, visitsCount: 0, score: 0 };

      return {
        ...row,
        suggester,
        shop,
        trust,
      };
    });

    enrichedPending.sort((a: any, b: any) => {
      if (b.trust.score !== a.trust.score) {
        return b.trust.score - a.trust.score;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const enrichedReviewed = reviewedRows.map((row: any) => {
      const suggester = Array.isArray(row.suggester) ? row.suggester[0] : row.suggester;
      const reviewer = Array.isArray(row.reviewer) ? row.reviewer[0] : row.reviewer;
      const shop = Array.isArray(row.shop) ? row.shop[0] : row.shop;

      return {
        ...row,
        suggester,
        reviewer,
        shop,
      };
    });

    return NextResponse.json({
      pending: enrichedPending,
      recentlyReviewed: enrichedReviewed,
    });
  } catch (error: any) {
    console.error('[API /api/admin/suggestions GET] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminAuth = await requireAdmin();
    if (!adminAuth) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu yêu cầu không hợp lệ' }, { status: 400 });
    }

    const { id, action, note } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Mã đề xuất (id) là bắt buộc' }, { status: 400 });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Hành động không hợp lệ. Phải là 'approve' hoặc 'reject'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the suggestion to check existence and status
    const { data: suggestion, error: fetchError } = await supabase
      .from('shop_edit_suggestions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[API /api/admin/suggestions PATCH] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Lỗi khi kiểm tra đề xuất' }, { status: 500 });
    }

    if (!suggestion) {
      return NextResponse.json({ error: 'Không tìm thấy đề xuất' }, { status: 404 });
    }

    if (suggestion.status !== 'pending') {
      return NextResponse.json(
        { error: 'Đề xuất này đã được xử lý trước đó.' },
        { status: 409 }
      );
    }

    // Guardrail: Block self-review (suggestion owner cannot approve their own)
    if (suggestion.suggested_by === adminAuth.user.id && action === 'approve') {
      return NextResponse.json(
        { error: 'Bạn không thể tự duyệt đề xuất của chính mình.' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      // Extract and filter changes against allowed fields
      const changes = suggestion.changes || {};
      const shopUpdates: Record<string, any> = {};

      for (const [key, diff] of Object.entries(changes)) {
        if (ALLOWED_FIELDS.has(key) && !DISALLOWED_FIELDS.has(key)) {
          shopUpdates[key] = (diff as any)?.to;
        }
      }

      shopUpdates.updated_at = now;

      // Apply changes to shops table
      const { error: shopUpdateError } = await supabase
        .from('shops')
        .update(shopUpdates)
        .eq('place_id', suggestion.shop_place_id);

      if (shopUpdateError) {
        console.error(
          '[API /api/admin/suggestions PATCH] Shop update error:',
          shopUpdateError
        );
        return NextResponse.json(
          { error: `Lỗi khi cập nhật quán: ${shopUpdateError.message}` },
          { status: 500 }
        );
      }

      // Update suggestion record status to approved
      const { data: updatedSuggestion, error: suggestionUpdateError } = await supabase
        .from('shop_edit_suggestions')
        .update({
          status: 'approved',
          reviewed_by: adminAuth.user.id,
          reviewed_at: now,
          review_note: note?.trim() || null,
        })
        .eq('id', id)
        .select(
          '*, shop:shops(place_id, name, address), suggester:profiles!shop_edit_suggestions_suggested_by_fkey(id, full_name, username, avatar_url), reviewer:profiles!shop_edit_suggestions_reviewed_by_fkey(id, full_name, username, avatar_url)'
        )
        .single();

      if (suggestionUpdateError) {
        console.error(
          '[API /api/admin/suggestions PATCH] Suggestion status update error:',
          suggestionUpdateError
        );
        return NextResponse.json(
          { error: suggestionUpdateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'approve',
        suggestion: updatedSuggestion,
      });
    } else {
      // action === 'reject'
      const { data: updatedSuggestion, error: suggestionUpdateError } = await supabase
        .from('shop_edit_suggestions')
        .update({
          status: 'rejected',
          reviewed_by: adminAuth.user.id,
          reviewed_at: now,
          review_note: note?.trim() || null,
        })
        .eq('id', id)
        .select(
          '*, shop:shops(place_id, name, address), suggester:profiles!shop_edit_suggestions_suggested_by_fkey(id, full_name, username, avatar_url), reviewer:profiles!shop_edit_suggestions_reviewed_by_fkey(id, full_name, username, avatar_url)'
        )
        .single();

      if (suggestionUpdateError) {
        console.error(
          '[API /api/admin/suggestions PATCH] Reject update error:',
          suggestionUpdateError
        );
        return NextResponse.json(
          { error: suggestionUpdateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'reject',
        suggestion: updatedSuggestion,
      });
    }
  } catch (error: any) {
    console.error('[API /api/admin/suggestions PATCH] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
