import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../[year]/image/route';
import { createClient, createPublicClient } from '@/lib/supabase/server';
import { fetchPublicProfileForServer } from '@/lib/supabase/profile-detail';

let lastRenderedElement: any = null;

vi.mock('next/og', () => ({
  ImageResponse: class MockImageResponse extends Response {
    constructor(element: any, options?: any) {
      lastRenderedElement = element;
      super('fake-image-png-content', {
        status: 200,
        headers: {
          'content-type': 'image/png',
          ...options?.headers,
        },
      });
    }
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createPublicClient: vi.fn(),
}));

vi.mock('@/lib/supabase/profile-detail', () => ({
  fetchPublicProfileForServer: vi.fn(),
}));

describe('GET /api/recap/[year]/image', () => {
  let mockAuthClient: any;
  let mockPublicClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'u123' } },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { username: 'testuser', full_name: 'Test User' },
                  error: null,
                }),
              })),
            })),
          };
        }
        if (table === 'visits') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'v1',
                    user_id: 'u123',
                    shop_place_id: 'p1',
                    shop_name: 'Quán Test',
                    visited_at: '2026-05-01T10:00:00Z',
                    created_at: '2026-05-01T10:00:00Z',
                  },
                ],
                error: null,
              }),
            })),
          };
        }
        if (table === 'reviews') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'r1',
                    user_id: 'u123',
                    shop_place_id: 'p1',
                    rating: 5,
                    comment: 'Ngon',
                    created_at: '2026-05-02T10:00:00Z',
                  },
                ],
                error: null,
              }),
            })),
          };
        }
        if (table === 'saved_shops') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [],
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
                    place_id: 'p1',
                    name: 'Quán Test',
                    address: '123 Test St',
                    categories: ['catering.coffee_shop'],
                    slug: 'quan-test',
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

    mockPublicClient = {
      from: mockAuthClient.from,
    };

    vi.mocked(createClient).mockResolvedValue(mockAuthClient);
    vi.mocked(createPublicClient).mockResolvedValue(mockPublicClient);
  });

  it('returns 400 for invalid year parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/recap/invalid-year/image');
    const res = await GET(req, { params: Promise.resolve({ year: 'invalid-year' }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Năm không hợp lệ');
  });

  it('returns 401 when not authenticated and no username query parameter', async () => {
    mockAuthClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Unauthorized'),
    });

    const req = new NextRequest('http://localhost:3000/api/recap/2026/image');
    const res = await GET(req, { params: Promise.resolve({ year: '2026' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 when requested username does not exist', async () => {
    vi.mocked(fetchPublicProfileForServer).mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/recap/2026/image?username=unknown_user');
    const res = await GET(req, { params: Promise.resolve({ year: '2026' }) });
    expect(res.status).toBe(404);
  });

  it('returns 200 image response for authenticated user session', async () => {
    const req = new NextRequest('http://localhost:3000/api/recap/2026/image');
    const res = await GET(req, { params: Promise.resolve({ year: '2026' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('cache-control')).toContain('max-age=3600');
  });

  it('returns 200 image response when public username query param is provided', async () => {
    vi.mocked(fetchPublicProfileForServer).mockResolvedValueOnce({
      id: 'target-u2',
      username: 'coffeelover',
      full_name: 'Coffee Lover',
      avatar_url: null,
      created_at: '2025-01-01T00:00:00Z',
    });

    const req = new NextRequest('http://localhost:3000/api/recap/2026/image?username=coffeelover');
    const res = await GET(req, { params: Promise.resolve({ year: '2026' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
  });

  it('uses auth client when requested username matches authenticated user', async () => {
    vi.mocked(fetchPublicProfileForServer).mockResolvedValueOnce({
      id: 'u123',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
      created_at: '2025-01-01T00:00:00Z',
    });

    const req = new NextRequest('http://localhost:3000/api/recap/2026/image?username=testuser');
    const res = await GET(req, { params: Promise.resolve({ year: '2026' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
  });

  it('satisfies Satori layout requirement: all <div> elements with multiple children have explicit display: flex', async () => {
    const req = new NextRequest('http://localhost:3000/api/recap/2026/image');
    await GET(req, { params: Promise.resolve({ year: '2026' }) });

    expect(lastRenderedElement).not.toBeNull();

    function validateNode(node: any) {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'div') {
        const rawChildren = node.props?.children;
        const childArray = Array.isArray(rawChildren) ? rawChildren.filter(Boolean) : rawChildren ? [rawChildren] : [];
        if (childArray.length > 1) {
          const display = node.props?.style?.display;
          expect(['flex', 'contents', 'none']).toContain(display);
        }
      }
      if (node.props?.children) {
        if (Array.isArray(node.props.children)) {
          node.props.children.forEach(validateNode);
        } else {
          validateNode(node.props.children);
        }
      }
    }

    validateNode(lastRenderedElement);
  });
});
