import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('GET /api/feed', () => {
  const mockUser = { id: 'curr-user' };
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
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [{ followee_id: 'friend-1' }],
                error: null,
              }),
            })),
          };
        }
        if (table === 'reviews') {
          return {
            select: vi.fn((_cols: string, opts?: any) => {
              if (opts?.count) {
                return {
                  in: vi.fn().mockResolvedValue({ count: 1 }),
                };
              }
              return {
                in: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({
                      data: [
                        {
                          id: 'rev-1',
                          user_id: 'friend-1',
                          shop_place_id: 'shop-1',
                          rating: 5,
                          comment: 'Cà phê rất ngon!',
                          images: ['https://example.com/img1.jpg'],
                          tags: ['ca-phe-ngon'],
                          created_at: '2026-09-25T10:00:00Z',
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
        if (table === 'visits') {
          return {
            select: vi.fn((_cols: string, opts?: any) => {
              if (opts?.count) {
                return {
                  in: vi.fn().mockResolvedValue({ count: 1 }),
                };
              }
              return {
                in: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({
                      data: [
                        {
                          id: 'vis-1',
                          user_id: 'friend-1',
                          shop_place_id: 'shop-2',
                          shop_name: 'Quán Thứ Hai',
                          shop_address: '123 Phố Cà Phê',
                          note: 'Không gian yên tĩnh',
                          visited_at: '2026-09-25T11:00:00Z',
                          created_at: '2026-09-25T11:00:00Z',
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
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              in: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'friend-1',
                    full_name: 'Bạn Bè',
                    username: 'banbe',
                    avatar_url: 'https://example.com/avatar.jpg',
                  },
                ],
                error: null,
              }),
            })),
          };
        }
        if (table === 'shops') {
          return {
            select: vi.fn(() => ({
              in: vi.fn().mockResolvedValue({
                data: [
                  {
                    place_id: 'shop-1',
                    name: 'Quán Nhất',
                    address: '456 Đường ABC',
                    photos: ['https://example.com/shop1.jpg'],
                    slug: 'quan-nhat',
                  },
                  {
                    place_id: 'shop-2',
                    name: 'Quán Thứ Hai',
                    address: '123 Phố Cà Phê',
                    photos: [],
                    slug: 'quan-thu-hai',
                  },
                ],
                error: null,
              }),
            })),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockClient);
  });

  it('returns 401 when not authenticated', async () => {
    mockClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('No user'),
    });

    const req = new NextRequest('http://localhost:3000/api/feed');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns empty feed when user follows nobody', async () => {
    mockClient.from = vi.fn((table: string) => {
      if (table === 'follows') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          })),
        };
      }
      return {};
    });

    const req = new NextRequest('http://localhost:3000/api/feed');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toEqual([]);
    expect(json.next_cursor).toBeNull();
    expect(json.total).toBe(0);
  });

  it('merges reviews and visits sorted descending by time', async () => {
    const req = new NextRequest('http://localhost:3000/api/feed');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.items).toHaveLength(2);
    // visit was at 11:00, review was at 10:00 -> visit should come first
    expect(json.items[0].type).toBe('shop_visited');
    expect(json.items[0].shop.name).toBe('Quán Thứ Hai');
    expect(json.items[0].actor.username).toBe('banbe');

    expect(json.items[1].type).toBe('review_created');
    expect(json.items[1].shop.name).toBe('Quán Nhất');
    expect(json.items[1].review.rating).toBe(5);
  });
});
