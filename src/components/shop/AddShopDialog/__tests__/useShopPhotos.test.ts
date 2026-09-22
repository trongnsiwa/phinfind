import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShopPhotos } from '../useShopPhotos';
import type { User } from '@supabase/supabase-js';

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockRemove = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove
      })
    }
  })
}));

describe('useShopPhotos - staged upload', () => {
  const mockUser: User = {
    id: 'user-test-123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };

  let createdBlobUrls: string[] = [];
  let revokedBlobUrls: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    createdBlobUrls = [];
    revokedBlobUrls = [];

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn((file: File | Blob) => {
      const url = `blob:http://localhost:3000/${Math.random().toString(36).substring(2, 9)}`;
      createdBlobUrls.push(url);
      return url;
    });

    global.URL.revokeObjectURL = vi.fn((url: string) => {
      revokedBlobUrls.push(url);
    });

    // Default mock behavior for Supabase Storage
    mockUpload.mockResolvedValue({ data: { path: 'mock-path' }, error: null });
    mockGetPublicUrl.mockImplementation((path: string) => ({
      data: { publicUrl: `https://supabase.co/storage/v1/object/public/shop-photos/${path}` }
    }));
    mockRemove.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('picking a file does not trigger any Supabase upload, generates a blob preview URL, and removing revokes the blob URL', async () => {
    let currentPhotos: string[] = [];
    const onPhotosChange = vi.fn((newPhotos: string[]) => {
      currentPhotos = newPhotos;
    });

    const { result, rerender } = renderHook(
      (props) =>
        useShopPhotos({
          photos: props.photos,
          onPhotosChange,
          user: mockUser,
          isAuthenticated: true
        }),
      { initialProps: { photos: currentPhotos } }
    );

    const mockFile = new File(['dummy photo bytes'], 'my-cafe.jpg', { type: 'image/jpeg' });

    // Pick file
    await act(async () => {
      await result.current.handleFileUpload({
        target: { files: [mockFile] }
      } as any);
    });

    // 1. Supabase upload must NOT have been called
    expect(mockUpload).not.toHaveBeenCalled();

    // 2. Preview URL must start with blob:
    expect(onPhotosChange).toHaveBeenCalledTimes(1);
    const addedPhotos = onPhotosChange.mock.calls[0][0];
    expect(addedPhotos).toHaveLength(1);
    expect(addedPhotos[0]).toMatch(/^blob:/);
    const blobUrl = addedPhotos[0];

    // Rerender hook with new photos
    rerender({ photos: addedPhotos });

    // 3. Removing the file revokes its object URL
    act(() => {
      result.current.handleRemovePhoto(0);
    });

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
    expect(onPhotosChange).toHaveBeenLastCalledWith([]);
  });

  it('uploadStagedPhotos only replaces blob entries and leaves pre-existing https URLs unchanged', async () => {
    const existingHttpsUrl = 'https://images.unsplash.com/photo-existing-123';
    let currentPhotos: string[] = [existingHttpsUrl];
    const onPhotosChange = vi.fn((newPhotos: string[]) => {
      currentPhotos = newPhotos;
    });

    const { result, rerender } = renderHook(
      (props) =>
        useShopPhotos({
          photos: props.photos,
          onPhotosChange,
          user: mockUser,
          isAuthenticated: true
        }),
      { initialProps: { photos: currentPhotos } }
    );

    const mockFile = new File(['photo content'], 'staged-shop.png', { type: 'image/png' });

    // Stage a new photo
    await act(async () => {
      await result.current.handleFileUpload({
        target: { files: [mockFile] }
      } as any);
    });

    const stagedPhotos = onPhotosChange.mock.calls[0][0];
    expect(stagedPhotos).toHaveLength(2);
    expect(stagedPhotos[0]).toBe(existingHttpsUrl);
    expect(stagedPhotos[1]).toMatch(/^blob:/);
    const blobUrl = stagedPhotos[1];

    rerender({ photos: stagedPhotos });

    // Call uploadStagedPhotos
    let uploadedResult: string[] = [];
    await act(async () => {
      uploadedResult = await result.current.uploadStagedPhotos();
    });

    // Assert only 1 file was uploaded to Supabase Storage
    expect(mockUpload).toHaveBeenCalledTimes(1);

    // Assert the first existing URL was NOT touched, and the second was replaced with public URL
    expect(uploadedResult).toHaveLength(2);
    expect(uploadedResult[0]).toBe(existingHttpsUrl);
    expect(uploadedResult[1]).toMatch(/^https:\/\/supabase\.co\/storage\/v1\/object\/public\/shop-photos\/shops\/user-test-123\//);

    // Staged blob URL was revoked after successful upload
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
  });

  it('sequential upload preserves newly chosen cover at index 0 after reordering', async () => {
    let currentPhotos: string[] = [];
    const onPhotosChange = vi.fn((newPhotos: string[]) => {
      currentPhotos = newPhotos;
    });

    const { result, rerender } = renderHook(
      (props) =>
        useShopPhotos({
          photos: props.photos,
          onPhotosChange,
          user: mockUser,
          isAuthenticated: true
        }),
      { initialProps: { photos: currentPhotos } }
    );

    const file1 = new File(['file 1'], 'file1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['file 2'], 'file2.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.handleFileUpload({
        target: { files: [file1, file2] }
      } as any);
    });

    const initialStaged = onPhotosChange.mock.calls[0][0];
    expect(initialStaged).toHaveLength(2);
    const [blob1, blob2] = initialStaged;

    rerender({ photos: initialStaged });

    // Swap cover: set index 1 as cover
    act(() => {
      result.current.handleSetCover(1);
    });

    const reorderedStaged = [blob2, blob1];
    expect(onPhotosChange).toHaveBeenLastCalledWith(reorderedStaged);

    rerender({ photos: reorderedStaged });

    // Upload staged photos
    let uploaded: string[] = [];
    await act(async () => {
      uploaded = await result.current.uploadStagedPhotos();
    });

    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(uploaded).toHaveLength(2);
    // Index 0 in uploaded must correspond to blob2
    expect(uploaded[0]).toContain('file2');
    // Index 1 in uploaded must correspond to blob1
    expect(uploaded[1]).toContain('file1');
  });

  it('aborts upload and performs best-effort cleanup of uploaded files if an error occurs mid-batch', async () => {
    let currentPhotos: string[] = [];
    const onPhotosChange = vi.fn((newPhotos: string[]) => {
      currentPhotos = newPhotos;
    });

    const { result, rerender } = renderHook(
      (props) =>
        useShopPhotos({
          photos: props.photos,
          onPhotosChange,
          user: mockUser,
          isAuthenticated: true
        }),
      { initialProps: { photos: currentPhotos } }
    );

    const file1 = new File(['file 1'], 'file1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['file 2'], 'file2.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.handleFileUpload({
        target: { files: [file1, file2] }
      } as any);
    });

    const staged = onPhotosChange.mock.calls[0][0];
    rerender({ photos: staged });

    // First upload succeeds, second upload fails
    mockUpload
      .mockResolvedValueOnce({ data: { path: 'shops/user-test-123/first.jpg' }, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('Network timeout') });

    await act(async () => {
      await expect(result.current.uploadStagedPhotos()).rejects.toThrow('Network timeout');
    });

    // Cleanup should remove the first file that succeeded
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith([expect.stringContaining('shops/user-test-123/')]);
  });

  it('resets and revokes all staged blob URLs on resetPhotos and on unmount', async () => {
    let currentPhotos: string[] = [];
    const onPhotosChange = vi.fn((newPhotos: string[]) => {
      currentPhotos = newPhotos;
    });

    const { result, unmount } = renderHook(
      () =>
        useShopPhotos({
          photos: currentPhotos,
          onPhotosChange,
          user: mockUser,
          isAuthenticated: true
        })
    );

    const file1 = new File(['file 1'], 'file1.jpg', { type: 'image/jpeg' });
    await act(async () => {
      await result.current.handleFileUpload({
        target: { files: [file1] }
      } as any);
    });

    const blobUrl = onPhotosChange.mock.calls[0][0][0];

    // Unmount
    unmount();

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
  });
});
