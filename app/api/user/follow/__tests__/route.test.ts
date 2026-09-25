import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, DELETE } from '../route';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('POST & DELETE /api/user/follow', () => {
  const mockUser = { id: 'user-1' };
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'follows') {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({ error: null }),
              })),
            })),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockClient);
  });

  describe('POST /api/user/follow', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('No session'),
      });

      const req = new NextRequest('http://localhost:3000/api/user/follow', {
        method: 'POST',
        body: JSON.stringify({ followee_id: 'user-2' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Yêu cầu đăng nhập');
    });

    it('returns 400 when followee_id is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/follow', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('followee_id là bắt buộc');
    });

    it('returns 400 when user tries to follow themselves', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/follow', {
        method: 'POST',
        body: JSON.stringify({ followee_id: 'user-1' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Bạn không thể tự theo dõi chính mình');
    });

    it('returns 200 on successful follow', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/follow', {
        method: 'POST',
        body: JSON.stringify({ followee_id: 'user-2' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.following).toBe(true);
      expect(json.success).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith('follows');
    });
  });

  describe('DELETE /api/user/follow', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('No session'),
      });

      const req = new NextRequest('http://localhost:3000/api/user/follow?followee_id=user-2', {
        method: 'DELETE',
      });

      const res = await DELETE(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Yêu cầu đăng nhập');
    });

    it('returns 400 when followee_id query param is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/follow', {
        method: 'DELETE',
      });

      const res = await DELETE(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('followee_id là bắt buộc');
    });

    it('returns 200 on successful unfollow', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/follow?followee_id=user-2', {
        method: 'DELETE',
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.following).toBe(false);
      expect(json.success).toBe(true);
    });
  });
});
