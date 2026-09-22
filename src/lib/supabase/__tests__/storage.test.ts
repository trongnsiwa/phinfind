import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractStoragePath, deleteStorageFilesFromUrls } from '../storage';

describe('extractStoragePath', () => {
  it('extracts storage path from valid public Supabase URLs', () => {
    const url =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-123/photo.jpg';
    expect(extractStoragePath(url)).toBe('reviews/user-123/photo.jpg');
  });

  it('strips query parameters and hashes', () => {
    const url =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-123/photo.jpg?token=secret#section';
    expect(extractStoragePath(url)).toBe('reviews/user-123/photo.jpg');
  });

  it('handles URL-encoded path segments', () => {
    const url =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-123/my%20photo%20%231.jpg';
    expect(extractStoragePath(url)).toBe('reviews/user-123/my photo #1.jpg');
  });

  it('returns null for non-matching URLs or external hosts', () => {
    expect(extractStoragePath('https://images.unsplash.com/photo-123')).toBeNull();
    expect(extractStoragePath('https://xyz.supabase.co/storage/v1/object/public/other-bucket/file.jpg')).toBeNull();
    expect(extractStoragePath('')).toBeNull();
    expect(extractStoragePath(null as any)).toBeNull();
    expect(extractStoragePath(undefined as any)).toBeNull();
  });
});

describe('deleteStorageFilesFromUrls', () => {
  const mockRemove = vi.fn();
  const mockSupabase = {
    storage: {
      from: vi.fn(() => ({
        remove: mockRemove
      }))
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zeros for empty or invalid input', async () => {
    const result1 = await deleteStorageFilesFromUrls(mockSupabase, [], 'reviews/user-123/');
    expect(result1).toEqual({ deleted: 0, skipped: 0, failed: 0 });
    expect(mockRemove).not.toHaveBeenCalled();

    const result2 = await deleteStorageFilesFromUrls(mockSupabase, null as any, 'reviews/user-123/');
    expect(result2).toEqual({ deleted: 0, skipped: 0, failed: 0 });
  });

  it('strictly enforces expectedPathPrefix ownership guard and skips foreign URLs', async () => {
    const myPhoto =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-123/pic1.jpg';
    const otherUserPhoto =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/attacker-456/pic2.jpg';
    const externalPhoto = 'https://images.unsplash.com/pic3.jpg';

    mockRemove.mockResolvedValue({ data: [{ name: 'reviews/user-123/pic1.jpg' }], error: null });

    const summary = await deleteStorageFilesFromUrls(
      mockSupabase,
      [myPhoto, otherUserPhoto, externalPhoto],
      'reviews/user-123/'
    );

    expect(summary).toEqual({ deleted: 1, skipped: 2, failed: 0 });
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith(['reviews/user-123/pic1.jpg']);
  });

  it('deduplicates identical paths before calling storage.remove', async () => {
    const duplicateUrl =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-123/same.jpg';

    mockRemove.mockResolvedValue({ data: [{ name: 'reviews/user-123/same.jpg' }], error: null });

    const summary = await deleteStorageFilesFromUrls(
      mockSupabase,
      [duplicateUrl, duplicateUrl, duplicateUrl],
      'reviews/user-123/'
    );

    expect(summary.deleted).toBe(1);
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith(['reviews/user-123/same.jpg']);
  });

  it('handles storage error gracefully without throwing (best-effort)', async () => {
    const photo =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-123/pic.jpg';

    mockRemove.mockResolvedValue({ data: null, error: { message: 'Storage connection failure' } });

    const summary = await deleteStorageFilesFromUrls(
      mockSupabase,
      [photo],
      'reviews/user-123/'
    );

    expect(summary).toEqual({ deleted: 0, skipped: 0, failed: 1 });
  });

  it('catches unexpected thrown exceptions gracefully without throwing', async () => {
    const photo =
      'https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-123/pic.jpg';

    mockRemove.mockRejectedValue(new Error('Network offline'));

    const summary = await deleteStorageFilesFromUrls(
      mockSupabase,
      [photo],
      'reviews/user-123/'
    );

    expect(summary).toEqual({ deleted: 0, skipped: 0, failed: 1 });
  });
});
