import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';
import { fetchShopForServer } from '@/lib/supabase/shop-detail';
import {
  buildOgTitle,
  buildOgSubtitle,
  buildOgPills,
} from '@/lib/seo/ogImage';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-192.png');
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath).toString('base64');
    }
  } catch {
    // Graceful fallback if filesystem read fails
  }
  return '';
}

async function fetchCoverPhotoBase64(url?: string | null): Promise<string | null> {
  if (!url || !url.startsWith('http')) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'image/*' },
    });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const shop = await fetchShopForServer(id);
  const logoBase64 = getLogoBase64();

  if (!shop) {
    // Fallback generic card when shop is not found (does not throw)
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            backgroundColor: '#F9F6F0',
            padding: '40px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '1120px',
              height: '550px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E8DFD5',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden',
              justifyContent: 'space-between',
            }}
          >
            {/* Bottom accent bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: '0px',
                width: '100%',
                height: '6px',
                backgroundColor: '#B8860B',
              }}
            />

            {/* Left column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '530px',
                height: '470px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {logoBase64 ? (
                  <img
                    src={`data:image/png;base64,${logoBase64}`}
                    alt="PhinFind"
                    width={48}
                    height={48}
                    style={{ borderRadius: '12px' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#B8860B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
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
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#2C1810',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    PhinFind
                  </div>
                  <div style={{ fontSize: '14px', color: '#7C6853' }}>
                    Bản đồ Cà phê Việt
                  </div>
                </div>
              </div>

              {/* Title & description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: 'bold',
                    color: '#1C120C',
                    lineHeight: 1.2,
                  }}
                >
                  Khám phá Cà phê Việt Chuẩn Gu
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: '#5C4D3C',
                    lineHeight: 1.4,
                  }}
                >
                  Khám phá hàng nghìn quán cà phê đặc sản, không gian chuẩn gu và trải nghiệm đậm chất Việt.
                </div>
                {/* Pills */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '6px' }}>
                  {['Cà phê đặc sản', 'Không gian chuẩn gu', 'Đánh giá chân thực'].map((text) => (
                    <div
                      key={text}
                      style={{
                        backgroundColor: '#FFF9F0',
                        border: '1px solid #E6D0AC',
                        borderRadius: '9999px',
                        padding: '6px 14px',
                        color: '#B8860B',
                        fontWeight: 'bold',
                        fontSize: '15px',
                      }}
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#8C7764',
                  fontSize: '15px',
                  fontWeight: '500',
                }}
              >
                phinfind.com
              </div>
            </div>

            {/* Right column / placeholder hero */}
            <div
              style={{
                width: '480px',
                height: '470px',
                borderRadius: '18px',
                backgroundColor: '#F3EDE2',
                border: '1px solid #E5D7C5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B8860B"
                strokeWidth={1.5}
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
              </svg>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#7C6853',
                }}
              >
                PhinFind Coffee
              </div>
            </div>
          </div>
        </div>
      ),
      size
    );
  }

  // Shop found — generate branded card
  const title = buildOgTitle(shop);
  const subtitle = buildOgSubtitle(shop);
  const pills = buildOgPills(shop);
  const coverPhotoDataUri = await fetchCoverPhotoBase64(shop.photos?.[0]);
  const canonicalPath = `phinfind.com/shop/${shop.slug || shop.place_id || id}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          backgroundColor: '#F9F6F0',
          padding: '40px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '1120px',
            height: '550px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E8DFD5',
            padding: '35px',
            position: 'relative',
            overflow: 'hidden',
            justifyContent: 'space-between',
          }}
        >
          {/* Bottom accent bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '0px',
              left: '0px',
              width: '100%',
              height: '6px',
              backgroundColor: '#B8860B',
            }}
          />

          {/* Left column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '530px',
              height: '480px',
              paddingRight: '10px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {logoBase64 ? (
                <img
                  src={`data:image/png;base64,${logoBase64}`}
                  alt="PhinFind"
                  width={46}
                  height={46}
                  style={{ borderRadius: '12px' }}
                />
              ) : (
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#B8860B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="26"
                    height="26"
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
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#2C1810',
                    letterSpacing: '-0.5px',
                  }}
                >
                  PhinFind
                </div>
                <div style={{ fontSize: '13px', color: '#7C6853' }}>
                  Bản đồ Cà phê Việt
                </div>
              </div>
            </div>

            {/* Shop Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 2-line clamped shop name */}
              <div
                style={{
                  fontSize: '38px',
                  fontWeight: 'bold',
                  color: '#1C120C',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>

              {/* 1-line clamped address (if present) */}
              {subtitle ? (
                <div
                  style={{
                    fontSize: '18px',
                    color: '#5C4D3C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#B8860B"
                    strokeWidth={2}
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <span>{subtitle}</span>
                </div>
              ) : null}

              {/* Pills row */}
              {pills.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    marginTop: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  {pills.map((pill) => (
                    <div
                      key={pill.label + pill.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFF9F0',
                        border: '1px solid #E6D0AC',
                        borderRadius: '9999px',
                        padding: '6px 14px',
                        color: '#B8860B',
                        fontWeight: 'bold',
                        fontSize: '15px',
                      }}
                    >
                      {pill.label === 'rating' ? (
                        <svg width="15" height="15" viewBox="0 0 24 24">
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                            fill="#B8860B"
                          />
                        </svg>
                      ) : null}
                      <span>
                        {pill.label === 'rating'
                          ? pill.value.replace(/[^0-9.]/g, '')
                          : pill.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#8C7764',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {canonicalPath}
            </div>
          </div>

          {/* Right column: 480x480 cover photo or neutral placeholder */}
          {coverPhotoDataUri ? (
            <img
              src={coverPhotoDataUri}
              alt={title}
              width={480}
              height={480}
              style={{
                objectFit: 'cover',
                borderRadius: '18px',
                width: '480px',
                height: '480px',
              }}
            />
          ) : (
            <div
              style={{
                width: '480px',
                height: '480px',
                borderRadius: '18px',
                backgroundColor: '#F3EDE2',
                border: '1px solid #E5D7C5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B8860B"
                strokeWidth={1.5}
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
              </svg>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#7C6853',
                }}
              >
                PhinFind Coffee
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    size
  );
}
