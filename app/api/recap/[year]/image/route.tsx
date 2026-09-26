import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { createClient, createPublicClient } from '@/lib/supabase/server';
import { fetchPublicProfileForServer } from '@/lib/supabase/profile-detail';
import { computeRecap } from '@/lib/recap/computeRecap';
import { computeTier, computeTotalContributions } from '@/lib/utils/badges';
import type { CoffeeShop } from '@/types/shop';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

interface RouteProps {
  params: Promise<{ year: string }>;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-192.png');
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath).toString('base64');
    }
  } catch {
    // Fallback if filesystem read fails
  }
  return '';
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { year: rawYear } = await params;
  const year = parseInt(rawYear, 10);

  if (isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: 'Năm không hợp lệ' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const requestedUsername = searchParams.get('username')?.trim();

  let targetUserId: string;
  let displayName = 'Người Dùng PhinFind';
  let handle = '';
  let supabaseClient: any;

  if (requestedUsername) {
    const publicProfile = await fetchPublicProfileForServer(requestedUsername);
    if (!publicProfile) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ người dùng' }, { status: 404 });
    }
    targetUserId = publicProfile.id;
    displayName = publicProfile.full_name || `@${publicProfile.username}`;
    handle = `@${publicProfile.username}`;

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (user && user.id === targetUserId) {
      supabaseClient = authClient;
    } else {
      supabaseClient = await createPublicClient();
    }
  } else {
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để xem tổng kết' }, { status: 401 });
    }

    targetUserId = user.id;
    supabaseClient = authClient;

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('username, full_name')
      .eq('id', targetUserId)
      .maybeSingle();

    if (profile) {
      displayName = profile.full_name || profile.username || 'Người Dùng PhinFind';
      if (profile.username) handle = `@${profile.username}`;
    }
  }

  // 1. Fetch user visits, reviews, and saved shops
  const [visitsRes, reviewsRes, favoritesRes] = await Promise.all([
    supabaseClient
      .from('visits')
      .select('id, user_id, shop_place_id, shop_name, shop_address, visited_at, created_at')
      .eq('user_id', targetUserId),
    supabaseClient
      .from('reviews')
      .select('id, user_id, shop_place_id, rating, comment, created_at')
      .eq('user_id', targetUserId),
    supabaseClient
      .from('saved_shops')
      .select('id, user_id, place_id, name, created_at')
      .eq('user_id', targetUserId),
  ]);

  const rawVisits = visitsRes.data || [];
  const rawReviews = reviewsRes.data || [];
  const rawFavorites = favoritesRes.data || [];

  // 2. Fetch associated shop metadata for enriched visits & reviews
  const placeIds = Array.from(
    new Set([
      ...rawVisits.map((v: any) => v.shop_place_id),
      ...rawReviews.map((r: any) => r.shop_place_id),
    ].filter(Boolean))
  );

  const shopsMap = new Map<string, Partial<CoffeeShop>>();
  if (placeIds.length > 0) {
    const { data: shopsData } = await supabaseClient
      .from('shops')
      .select('place_id, name, address, photos, rating, categories, price_range, slug')
      .in('place_id', placeIds);

    if (shopsData) {
      for (const s of shopsData) {
        shopsMap.set(s.place_id, s);
      }
    }
  }

  const enrichedVisits = rawVisits.map((v: any) => {
    const shopMeta = shopsMap.get(v.shop_place_id);
    return {
      ...v,
      shop_name: shopMeta?.name || v.shop_name || 'Quán Cà Phê',
      shop_address: shopMeta?.address || v.shop_address,
      shop: shopMeta ? (shopMeta as CoffeeShop) : null,
    };
  });

  const enrichedReviews = rawReviews.map((r: any) => {
    const shopMeta = shopsMap.get(r.shop_place_id);
    return {
      ...r,
      author: displayName,
      shop_name: shopMeta?.name || 'Quán Cà Phê',
      shop_slug: shopMeta?.slug || null,
    };
  });

  // 3. Compute badge tier & recap metrics
  const totalContributions = computeTotalContributions({
    reviews: rawReviews.length,
    visits: rawVisits.length,
    favorites: rawFavorites.length,
  });
  const computedTier = computeTier(totalContributions);

  const recap = computeRecap({
    year,
    visits: enrichedVisits,
    reviews: enrichedReviews,
    favorites: rawFavorites,
    tier_label: computedTier.label,
  });

  const logoBase64 = getLogoBase64();

  const tierColors: Record<string, { bg: string; text: string; border: string }> = {
    'Kim Cương': { bg: '#0D3B36', text: '#2DD4BF', border: '#14B8A6' },
    'Vàng': { bg: '#3D2A08', text: '#FBBF24', border: '#B8860B' },
    'Bạc': { bg: '#252A34', text: '#E2E8F0', border: '#94A3B8' },
    'Đồng': { bg: '#3A1E14', text: '#FDBA74', border: '#C2410C' },
  };

  const currentTierTheme = tierColors[recap.tier_label] || tierColors['Đồng'];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          backgroundColor: '#120B07',
          padding: '36px',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1128px',
            height: '558px',
            backgroundColor: '#1C120C',
            borderRadius: '28px',
            border: '2px solid #332115',
            padding: '36px 44px',
            position: 'relative',
            overflow: 'hidden',
            justifyContent: 'space-between',
          }}
        >
          {/* Subtle top-right golden glow decorative ring */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '280px',
              height: '280px',
              borderRadius: '9999px',
              backgroundColor: '#B8860B',
              opacity: 0.12,
            }}
          />

          {/* Top Row: Brand Header & User Identity */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Brand Logo & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {logoBase64 ? (
                <img
                  src={`data:image/png;base64,${logoBase64}`}
                  alt="PhinFind"
                  width={52}
                  height={52}
                  style={{ borderRadius: '14px', border: '1px solid #4D3220' }}
                />
              ) : (
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: '#B8860B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
                  </svg>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '26px',
                    fontWeight: 'bold',
                    color: '#FFF8F0',
                    letterSpacing: '-0.5px',
                  }}
                >
                  PhinFind Recap
                </div>
                <div style={{ display: 'flex', fontSize: '14px', color: '#D4AF37', fontWeight: 600 }}>
                  {`Hành trình Cà phê ${year}`}
                </div>
              </div>
            </div>

            {/* User Pill with Badge Tier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', fontSize: '18px', fontWeight: 'bold', color: '#FFF8F0' }}>
                  {displayName}
                </div>
                {handle ? (
                  <div style={{ display: 'flex', fontSize: '13px', color: '#A8927E' }}>{handle}</div>
                ) : null}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: currentTierTheme.bg,
                  border: `1.5px solid ${currentTierTheme.border}`,
                  color: currentTierTheme.text,
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
              >
                <span>{`Hạng ${recap.tier_label}`}</span>
              </div>
            </div>
          </div>

          {/* Center: Stat Highlights Grid (2 rows x 3 columns) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
              margin: '18px 0',
            }}
          >
            {/* Row 1 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' }}>
              {/* Stat 1: Quán đã ghé */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: '#261910',
                  border: '1px solid #3E291C',
                  borderRadius: '18px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '13px', color: '#A8927E', fontWeight: 600, marginBottom: '4px' }}>
                  QUÁN ĐÃ GHÉ
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '32px', fontWeight: 'bold', color: '#FFF8F0', lineHeight: 1.1 }}>
                  <span>{String(recap.total_visits)}</span>
                  <span style={{ fontSize: '18px', color: '#D4AF37', marginLeft: '6px' }}>quán</span>
                </div>
                <div style={{ display: 'flex', fontSize: '12px', color: '#8A7360', marginTop: '4px' }}>
                  {`${recap.unique_shops_visited} địa điểm độc đáo`}
                </div>
              </div>

              {/* Stat 2: Đánh giá đã viết */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: '#261910',
                  border: '1px solid #3E291C',
                  borderRadius: '18px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '13px', color: '#A8927E', fontWeight: 600, marginBottom: '4px' }}>
                  ĐÁNH GIÁ ĐÓNG GÓP
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '32px', fontWeight: 'bold', color: '#FFF8F0', lineHeight: 1.1 }}>
                  <span>{String(recap.total_reviews)}</span>
                  <span style={{ fontSize: '18px', color: '#D4AF37', marginLeft: '6px' }}>bài viết</span>
                </div>
                <div style={{ display: 'flex', fontSize: '12px', color: '#8A7360', marginTop: '4px' }}>
                  {`Cùng ${recap.total_favorites} quán đã lưu`}
                </div>
              </div>

              {/* Stat 3: Chuỗi khám phá dài nhất */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: '#261910',
                  border: '1px solid #3E291C',
                  borderRadius: '18px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '13px', color: '#A8927E', fontWeight: 600, marginBottom: '4px' }}>
                  CHUỖI LIÊN TIẾP
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '32px', fontWeight: 'bold', color: '#FFF8F0', lineHeight: 1.1 }}>
                  <span>{String(recap.longest_streak_days)}</span>
                  <span style={{ fontSize: '18px', color: '#D4AF37', marginLeft: '6px' }}>ngày</span>
                </div>
                <div style={{ display: 'flex', fontSize: '12px', color: '#8A7360', marginTop: '4px' }}>
                  Hành trình bền bỉ chuẩn gu
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' }}>
              {/* Stat 4: Gu yêu thích nhất */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: '#261910',
                  border: '1px solid #3E291C',
                  borderRadius: '18px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '13px', color: '#A8927E', fontWeight: 600, marginBottom: '4px' }}>
                  GU CÀ PHÊ YÊU THÍCH
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#D4AF37',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {recap.top_category?.category || 'Đa dạng chuẩn vị'}
                </div>
                <div style={{ display: 'flex', fontSize: '12px', color: '#8A7360', marginTop: '4px' }}>
                  {recap.top_category ? `${recap.top_category.count} lượt trải nghiệm` : 'Khám phá mọi phong cách'}
                </div>
              </div>

              {/* Stat 5: Tháng sôi động nhất */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: '#261910',
                  border: '1px solid #3E291C',
                  borderRadius: '18px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '13px', color: '#A8927E', fontWeight: 600, marginBottom: '4px' }}>
                  THÁNG SÔI ĐỘNG NHẤT
                </div>
                <div style={{ display: 'flex', fontSize: '22px', fontWeight: 'bold', color: '#FFF8F0', lineHeight: 1.2 }}>
                  {recap.busiest_month?.name || `Năm ${year}`}
                </div>
                <div style={{ display: 'flex', fontSize: '12px', color: '#8A7360', marginTop: '4px' }}>
                  {recap.busiest_month ? `${recap.busiest_month.count} lượt ghé quán` : 'Khởi đầu hành trình mới'}
                </div>
              </div>

              {/* Stat 6: Quán ghé nhiều nhất */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  backgroundColor: '#261910',
                  border: '1px solid #3E291C',
                  borderRadius: '18px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '13px', color: '#A8927E', fontWeight: 600, marginBottom: '4px' }}>
                  QUÁN RUỘT CỦA BẠN
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#FFF8F0',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {recap.top_shop?.shop_name || 'Đang khám phá'}
                </div>
                <div style={{ display: 'flex', fontSize: '12px', color: '#8A7360', marginTop: '4px' }}>
                  {recap.top_shop ? `${recap.top_shop.count} lần ghé thăm` : 'Chờ đón điểm dừng chân'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer: Brand URL and Call to Action */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderTop: '1px solid #2F1E14',
              paddingTop: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8A7360', fontSize: '14px' }}>
              <span>Bản đồ Cà phê Việt Chuẩn Gu</span>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#D4AF37',
                letterSpacing: '0.5px',
              }}
            >
              phinfind.com/recap
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    }
  );
}
