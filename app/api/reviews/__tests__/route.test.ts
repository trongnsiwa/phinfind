import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { DELETE } from '../route';
import { createClient } from '@/lib/supabase/server';
import { deleteStorageFilesFromUrls } from '@/lib/supabase/storage';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createPublicClient: vi.fn(),
}));

vi.mock('@/lib/supabase/storage', () => ({
  deleteStorageFilesFromUrls: vi.fn(),
}));

describe('DELETE /api/reviews', () => {
  const mockUser = { id: 'test-user-123' };
  let mockExistingReview: { images: string[] | null } | null = null;
  let mockDeleteError: any = null;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExistingReview = null;
    mockDeleteError = null;

    mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'reviews') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: mockExistingReview,
                    error: null,
                  }),
                })),
              })),
            })),
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({
                  error: mockDeleteError,
                }),
              })),
            })),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockClient);
    vi.mocked(deleteStorageFilesFromUrls).mockResolvedValue({ deleted: 1, skipped: 0, failed: 0 });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/reviews?id=rev-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toContain('đăng nhập');
  });

  it('returns 400 when id param is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('id');
  });

  it('calls deleteStorageFilesFromUrls with review images and ownership prefix', async () => {
    const images = [
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/test-user-123/pic1.jpg',
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/test-user-123/pic2.jpg',
    ];
    mockExistingReview = { images };

    const request = new NextRequest('http://localhost:3000/api/reviews?id=rev-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });

    expect(deleteStorageFilesFromUrls).toHaveBeenCalledTimes(1);
    expect(deleteStorageFilesFromUrls).toHaveBeenCalledWith(
      mockClient,
      images,
      'reviews/test-user-123/'
    );
  });

  it('returns HTTP 200 even when storage deletion fails', async () => {
    mockExistingReview = {
      images: ['https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/test-user-123/pic1.jpg'],
    };

    // Simulate storage cleanup rejection
    vi.mocked(deleteStorageFilesFromUrls).mockRejectedValueOnce(
      new Error('Storage service unavailable')
    );

    const request = new NextRequest('http://localhost:3000/api/reviews?id=rev-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const json = await response.json();

    // Database deletion succeeded, so endpoint must still return 200
    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(deleteStorageFilesFromUrls).toHaveBeenCalledTimes(1);
  });

  it('does not invoke storage cleanup when review has no images', async () => {
    mockExistingReview = { images: [] };

    const request = new NextRequest('http://localhost:3000/api/reviews?id=rev-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(deleteStorageFilesFromUrls).not.toHaveBeenCalled();
  });
});
