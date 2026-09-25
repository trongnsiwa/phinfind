import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFollowStatus, useFeed, useFollowers, useFollowing, useToggleFollow } from '../useFollow';

const mockUseQuery = vi.fn();
const mockUseInfiniteQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseQueryClient = vi.fn();

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: (...args: any[]) => mockUseQuery(...args),
    useInfiniteQuery: (...args: any[]) => mockUseInfiniteQuery(...args),
    useMutation: (...args: any[]) => mockUseMutation(...args),
    useQueryClient: () => mockUseQueryClient(),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, isAuthenticated: true }),
}));

describe('useFollow hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFollowStatus', () => {
    it('initializes useQuery with target user_id query key and 30s staleTime', () => {
      renderHook(() => useFollowStatus('target-user-123'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['user', 'follow-status', 'target-user-123'],
          enabled: true,
          staleTime: 30 * 1000,
        })
      );
    });

    it('disables query when userId is empty', () => {
      renderHook(() => useFollowStatus(undefined));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['user', 'follow-status', undefined],
          enabled: false,
        })
      );
    });
  });

  describe('useFeed', () => {
    it('initializes useInfiniteQuery with feed query key', () => {
      renderHook(() => useFeed(20));

      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['feed'],
          enabled: true,
          initialPageParam: null,
        })
      );
    });
  });

  describe('useFollowers', () => {
    it('initializes useInfiniteQuery with followers query key', () => {
      renderHook(() => useFollowers('target-user-123', 20));

      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['user', 'followers', 'target-user-123'],
          enabled: true,
          initialPageParam: 0,
        })
      );
    });
  });

  describe('useFollowing', () => {
    it('initializes useInfiniteQuery with following query key', () => {
      renderHook(() => useFollowing('target-user-123', 20));

      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['user', 'following', 'target-user-123'],
          enabled: true,
          initialPageParam: 0,
        })
      );
    });
  });

  describe('useToggleFollow', () => {
    it('sets up mutation with onMutate, onError, and onSettled handlers', () => {
      renderHook(() => useToggleFollow());

      expect(mockUseMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          mutationFn: expect.any(Function),
          onMutate: expect.any(Function),
          onError: expect.any(Function),
          onSettled: expect.any(Function),
        })
      );
    });
  });
});
