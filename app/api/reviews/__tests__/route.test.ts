import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { DELETE, GET, POST, PUT } from '../route';
import { createClient, createPublicClient } from '@/lib/supabase/server';
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

describe('POST /api/reviews - tags', () => {
  const mockUser = { id: 'test-user-123', email: 'test@example.com', user_metadata: {} };
  let mockClient: any;
  let insertedPayload: any;
  let mockExistingReviewCheck: any = null;
  let mockInsertError: any = null;

  beforeEach(() => {
    vi.clearAllMocks();
    insertedPayload = null;
    mockExistingReviewCheck = null;
    mockInsertError = null;

    mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'reviews') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: mockExistingReviewCheck,
                    error: null,
                  }),
                })),
              })),
            })),
            insert: vi.fn((rows: any[]) => {
              insertedPayload = rows[0];
              return {
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockInsertError
                      ? null
                      : {
                          id: 'rev-100',
                          shop_place_id: insertedPayload.shop_place_id,
                          user_id: insertedPayload.user_id,
                          rating: insertedPayload.rating,
                          comment: insertedPayload.comment,
                          images: insertedPayload.images,
                          tags: insertedPayload.tags,
                          created_at: new Date().toISOString(),
                          profiles: { full_name: 'Test User', avatar_url: null, username: 'testuser' },
                        },
                    error: mockInsertError,
                  }),
                })),
              };
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockClient);
  });

  it('returns 409 and does not insert when user already reviewed the shop (pre-check)', async () => {
    mockExistingReviewCheck = { id: 'existing-rev-99' };

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        shop_place_id: 'shop-123',
        rating: 5,
        comment: 'Bài đánh giá mới',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toContain('Bạn đã đánh giá quán này rồi');
    expect(json.error).toContain('chỉnh sửa bài đánh giá hiện có của bạn');
    expect(insertedPayload).toBeNull();
  });

  it('returns 409 when insert throws 23505 unique constraint violation (race condition fallback)', async () => {
    mockExistingReviewCheck = null;
    mockInsertError = {
      code: '23505',
      message: 'duplicate key value violates unique constraint "uniq_reviews_user_shop"',
    };

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        shop_place_id: 'shop-123',
        rating: 5,
        comment: 'Bài đánh giá race condition',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toContain('Bạn đã đánh giá quán này rồi');
  });

  it('successfully persists and returns validated & normalized tags', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        shop_place_id: 'shop-123',
        rating: 5,
        comment: 'Quán tuyệt vời!',
        tags: ['Wi-Fi mạnh', 'yen-tinh'],
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(insertedPayload.tags).toEqual(['wifi-manh', 'yen-tinh']);
    expect(json.review.tags).toEqual(['wifi-manh', 'yen-tinh']);
  });

  it('rejects with 400 when tags exceeds 3 items', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        shop_place_id: 'shop-123',
        rating: 5,
        comment: 'Quán tuyệt vời!',
        tags: ['wifi-manh', 'yen-tinh', 'view-dep', 'mo-khuya'],
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('tối đa 3 thẻ');
  });

  it('rejects with 400 when an invalid tag vocabulary is passed', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        shop_place_id: 'shop-123',
        rating: 5,
        comment: 'Quán tuyệt vời!',
        tags: ['non-existent-tag'],
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('không nằm trong danh sách thẻ hợp lệ');
  });

  it('rejects with 400 when tags is not an array', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        shop_place_id: 'shop-123',
        rating: 5,
        comment: 'Quán tuyệt vời!',
        tags: 'wifi-manh',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('không đúng định dạng');
  });
});

describe('PUT /api/reviews - tags', () => {
  const mockUser = { id: 'test-user-123' };
  let mockClient: any;
  let updatedPayload: any;

  beforeEach(() => {
    vi.clearAllMocks();
    updatedPayload = null;

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
                    data: { id: 'rev-1', images: [], tags: ['wifi-manh'] },
                    error: null,
                  }),
                })),
              })),
            })),
            update: vi.fn((payload: any) => {
              updatedPayload = payload;
              return {
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: 'rev-1',
                          shop_place_id: 'shop-1',
                          user_id: mockUser.id,
                          rating: payload.rating,
                          comment: payload.comment,
                          images: payload.images,
                          tags: payload.tags,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          profiles: { full_name: 'Test', avatar_url: null, username: 'test' },
                        },
                        error: null,
                      }),
                    })),
                  })),
                })),
              };
            }),
          };
        }
        if (table === 'review_likes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              })),
            })),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockClient);
  });

  it('updates review tags when valid tags are sent', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'rev-1',
        rating: 4,
        comment: 'Cập nhật cảm nhận',
        tags: ['yen-tinh', 'do-xe'],
      }),
    });

    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updatedPayload.tags).toEqual(['yen-tinh', 'do-xe']);
    expect(json.review.tags).toEqual(['yen-tinh', 'do-xe']);
  });

  it('rejects with 400 when update tags exceeds 3 items', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'rev-1',
        rating: 4,
        comment: 'Cập nhật cảm nhận',
        tags: ['wifi-manh', 'yen-tinh', 'view-dep', 'mo-khuya'],
      }),
    });

    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('tối đa 3 thẻ');
  });

  it('rejects with 400 when update tag vocabulary is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'rev-1',
        rating: 4,
        comment: 'Cập nhật cảm nhận',
        tags: ['invalid-tag'],
      }),
    });

    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('không nằm trong danh sách thẻ hợp lệ');
  });
});

describe('GET /api/reviews - tags', () => {
  it('returns reviews containing tags array', async () => {
    const mockPublicClient = {
      from: vi.fn((table: string) => {
        if (table === 'reviews') {
          return {
            select: vi.fn((fields: string, opts?: any) => {
              if (opts?.count === 'exact') {
                return {
                  eq: vi.fn().mockResolvedValue({ count: 1 }),
                };
              }
              return {
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({
                      data: [
                        {
                          id: 'rev-1',
                          shop_place_id: 'shop-1',
                          user_id: 'user-1',
                          rating: 5,
                          comment: 'Tuyệt',
                          images: [],
                          tags: ['wifi-manh', 'yen-tinh'],
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          profiles: { full_name: 'User 1', avatar_url: null, username: 'u1' },
                        },
                      ],
                      error: null,
                    }),
                  })),
                })),
              };
            }),
          };
        }
        if (table === 'review_likes') {
          return {
            select: vi.fn(() => ({
              in: vi.fn().mockResolvedValue({ data: [] }),
            })),
          };
        }
        return {};
      }),
    };

    vi.mocked(createPublicClient).mockResolvedValue(mockPublicClient as any);
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/reviews?placeId=shop-1');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.reviews).toHaveLength(1);
    expect(json.reviews[0].tags).toEqual(['wifi-manh', 'yen-tinh']);
  });

  it('enriches reviews with visitor_visit_count when visits exist', async () => {
    const mockPublicClient = {
      from: vi.fn((table: string) => {
        if (table === 'reviews') {
          return {
            select: vi.fn((fields: string, opts?: any) => {
              if (opts?.count === 'exact') {
                return {
                  eq: vi.fn().mockResolvedValue({ count: 1 }),
                };
              }
              return {
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({
                      data: [
                        {
                          id: 'rev-1',
                          shop_place_id: 'shop-1',
                          user_id: 'user-1',
                          rating: 5,
                          comment: 'Tuyệt',
                          images: [],
                          tags: [],
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          profiles: { full_name: 'User 1', avatar_url: null, username: 'u1' },
                        },
                      ],
                      error: null,
                    }),
                  })),
                })),
              };
            }),
          };
        }
        if (table === 'review_likes') {
          return {
            select: vi.fn(() => ({
              in: vi.fn().mockResolvedValue({ data: [] }),
            })),
          };
        }
        if (table === 'visits') {
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({
                  data: [
                    { user_id: 'user-1', shop_place_id: 'shop-1' },
                    { user_id: 'user-1', shop_place_id: 'shop-1' },
                  ],
                }),
              })),
            })),
          };
        }
        return {};
      }),
    };

    vi.mocked(createPublicClient).mockResolvedValue(mockPublicClient as any);
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/reviews?placeId=shop-1');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.reviews).toHaveLength(1);
    expect(json.reviews[0].visitor_visit_count).toBe(2);
  });
});
