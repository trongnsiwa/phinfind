import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { parseVideoUrl, youtubeThumbnail } from '@/lib/utils/video';
import type { ShopVideo } from '@/types/shop';

export const revalidate = 86400; // 24 hours cache

const OEMBED_ENDPOINTS: Record<'tiktok' | 'instagram' | 'facebook', string> = {
  tiktok: 'https://www.tiktok.com/oembed',
  instagram: 'https://graph.facebook.com/v18.0/instagram_oembed',
  facebook: 'https://graph.facebook.com/v18.0/oembed_video'
};

async function handleResolve(req: NextRequest, rawUrl: string | null | undefined) {
  const url = rawUrl?.trim() ?? '';
  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 });
  }

  const clientIp =
    (req as any).ip ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon';

  const rateLimit = checkRateLimit(`video-resolve:${clientIp}`, 30, 60 * 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu' }, { status: 429 });
  }

  // YouTube: deterministic thumbnail, no external network call
  if (parsed.platform === 'youtube') {
    return NextResponse.json<ShopVideo>({
      ...parsed,
      thumbnail_url: youtubeThumbnail(parsed.video_id)
    });
  }

  // Instagram and Facebook require FB_OEMBED_TOKEN
  if (parsed.platform === 'instagram' || parsed.platform === 'facebook') {
    const fbToken = process.env.FB_OEMBED_TOKEN;
    if (!fbToken) {
      return NextResponse.json<ShopVideo>(parsed);
    }
  }

  const endpoint = OEMBED_ENDPOINTS[parsed.platform];
  if (!endpoint) {
    return NextResponse.json<ShopVideo>(parsed);
  }

  try {
    const fbToken = process.env.FB_OEMBED_TOKEN;
    const response = await axios.get(endpoint, {
      params: {
        url,
        ...(fbToken && (parsed.platform === 'instagram' || parsed.platform === 'facebook')
          ? { access_token: fbToken }
          : {})
      },
      timeout: 5000
    });

    const data = response.data;
    const enriched: ShopVideo = {
      ...parsed,
      ...(typeof data?.title === 'string' && data.title ? { title: data.title } : {}),
      ...(typeof data?.thumbnail_url === 'string' && data.thumbnail_url
        ? { thumbnail_url: data.thumbnail_url }
        : {})
    };

    return NextResponse.json<ShopVideo>(enriched);
  } catch {
    // Fail soft: return parsed video without thumbnail
    return NextResponse.json<ShopVideo>(parsed);
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
  const url = searchParams.get('url');
  return handleResolve(req, url);
}

export async function POST(req: NextRequest) {
  let url: string | null = null;
  try {
    const body = await req.json();
    url = body?.url;
  } catch {
    // Fall back to query param if JSON parsing fails
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    url = searchParams.get('url');
  }
  return handleResolve(req, url);
}
