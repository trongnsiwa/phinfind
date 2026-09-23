import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import axios from 'axios';
import { GET, POST } from '../resolve/route';
import * as rateLimitModule from '@/lib/utils/rateLimit';

vi.mock('axios');

describe('/api/videos/resolve endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(rateLimitModule, 'checkRateLimit').mockReturnValue({
      success: true,
      limit: 30,
      remaining: 29,
      reset: 3600
    });
  });

  it('returns 400 on invalid or missing URL', async () => {
    const invalidReq = new NextRequest('http://localhost:3000/api/videos/resolve?url=not-a-valid-url');
    const res = await GET(invalidReq);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('URL không hợp lệ');

    const emptyReq = new NextRequest('http://localhost:3000/api/videos/resolve');
    const emptyRes = await GET(emptyReq);
    expect(emptyRes.status).toBe(400);
  });

  it('returns 200 with deterministic thumbnail_url for YouTube URL without external call', async () => {
    const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const req = new NextRequest(`http://localhost:3000/api/videos/resolve?url=${encodeURIComponent(ytUrl)}`);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      url: ytUrl,
      platform: 'youtube',
      video_id: 'dQw4w9WgXcQ',
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    });
    // YouTube should not invoke axios.get
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limit is exceeded', async () => {
    vi.spyOn(rateLimitModule, 'checkRateLimit').mockReturnValue({
      success: false,
      limit: 30,
      remaining: 0,
      reset: 3600
    });

    const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const req = new NextRequest(`http://localhost:3000/api/videos/resolve?url=${encodeURIComponent(ytUrl)}`);
    const res = await GET(req);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Quá nhiều yêu cầu');
  });

  it('returns 200 with enriched title and thumbnail when oEmbed succeeds for TikTok', async () => {
    const ttUrl = 'https://www.tiktok.com/@cafesaigon/video/7123456789012345678';
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        title: 'Cà phê trứng tuyệt ngon tại Hà Nội',
        thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/thumb.jpeg'
      }
    });

    const req = new NextRequest(`http://localhost:3000/api/videos/resolve?url=${encodeURIComponent(ttUrl)}`);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      url: ttUrl,
      platform: 'tiktok',
      video_id: '7123456789012345678',
      title: 'Cà phê trứng tuyệt ngon tại Hà Nội',
      thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/thumb.jpeg'
    });
  });

  it('fails soft by returning parsed video without thumbnail when oEmbed call fails or times out', async () => {
    const ttUrl = 'https://www.tiktok.com/@cafesaigon/video/7123456789012345678';
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network timeout'));

    const req = new NextRequest(`http://localhost:3000/api/videos/resolve?url=${encodeURIComponent(ttUrl)}`);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      url: ttUrl,
      platform: 'tiktok',
      video_id: '7123456789012345678'
    });
    expect(body.thumbnail_url).toBeUndefined();
  });

  it('supports POST requests with json body', async () => {
    const ytUrl = 'https://youtu.be/dQw4w9WgXcQ';
    const req = new NextRequest('http://localhost:3000/api/videos/resolve', {
      method: 'POST',
      body: JSON.stringify({ url: ytUrl }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.platform).toBe('youtube');
    expect(body.thumbnail_url).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });
});
