import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UseShopPhotosOptions {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  user: User | null;
  isAuthenticated: boolean;
}

export function useShopPhotos({
  photos,
  onPhotosChange,
  user,
  isAuthenticated
}: UseShopPhotosOptions) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stagedFilesRef = useRef<Map<string, File>>(new Map());

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Revoke all staged blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    const stagedMap = stagedFilesRef.current;
    return () => {
      for (const blobUrl of stagedMap.keys()) {
        URL.revokeObjectURL(blobUrl);
      }
      stagedMap.clear();
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`Định dạng tệp "${file.name}" không hợp lệ. Chỉ chấp nhận tệp hình ảnh.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (file.size > MAX_SIZE) {
        toast.error(`Tệp "${file.name}" vượt quá dung lượng tối đa 5MB.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    const newBlobUrls: string[] = [];
    for (const file of files) {
      const blobUrl = URL.createObjectURL(file);
      stagedFilesRef.current.set(blobUrl, file);
      newBlobUrls.push(blobUrl);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (newBlobUrls.length > 0) {
      onPhotosChange([...photos, ...newBlobUrls]);
    }
  };

  const handleAddPhoto = () => {
    const trimmed = newPhotoUrl.trim();
    if (!trimmed) return;

    if (!/^https?:\/\/.+/i.test(trimmed)) {
      toast.error('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    if (photos.includes(trimmed)) {
      toast.info('Ảnh này đã có trong danh sách');
      return;
    }

    onPhotosChange([...photos, trimmed]);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const targetUrl = photos[indexToRemove];
    if (targetUrl && stagedFilesRef.current.has(targetUrl)) {
      URL.revokeObjectURL(targetUrl);
      stagedFilesRef.current.delete(targetUrl);
    }
    onPhotosChange(photos.filter((_, i) => i !== indexToRemove));
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover <= 0 || indexToCover >= photos.length) return;
    const newPhotos = [...photos];
    const temp = newPhotos[0];
    newPhotos[0] = newPhotos[indexToCover];
    newPhotos[indexToCover] = temp;
    onPhotosChange(newPhotos);
  };

  const uploadStagedPhotos = async (): Promise<string[]> => {
    // Pre-flight check: offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Không có kết nối mạng. Vui lòng kiểm tra lại kết nối.');
      throw new Error('Offline');
    }

    const hasStaged = photos.some((url) => url.startsWith('blob:'));
    if (!hasStaged) {
      return photos;
    }

    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để tải ảnh lên.');
      throw new Error('Unauthenticated');
    }

    setIsUploadingPhoto(true);
    const uploadedStoragePaths: string[] = [];
    const uploadedMap = new Map<string, string>();

    try {
      for (const url of photos) {
        if (!url.startsWith('blob:')) {
          continue;
        }

        const file = stagedFilesRef.current.get(url);
        if (!file) {
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 30);
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filePath = `shops/${user.id}/${timestamp}_${randomStr}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('shop-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedStoragePaths.push(filePath);

        const { data: publicUrlData } = supabase.storage
          .from('shop-photos')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error('Không lấy được đường dẫn công khai của ảnh.');
        }

        uploadedMap.set(url, publicUrlData.publicUrl);
      }
    } catch (err: any) {
      if (uploadedStoragePaths.length > 0) {
        try {
          await supabase.storage.from('shop-photos').remove(uploadedStoragePaths);
        } catch (cleanupErr) {
          console.error('Lỗi khi xóa ảnh tạm sau khi tải lên thất bại:', cleanupErr);
        }
      }
      console.error('Lỗi khi tải ảnh lên Supabase Storage:', err);
      toast.error(`Không thể tải ảnh lên: ${err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'}`);
      throw err;
    } finally {
      setIsUploadingPhoto(false);
    }

    // Preserve original ordering and cover-at-index-0 invariant
    const finalPhotos = photos.map((url) => {
      if (url.startsWith('blob:') && uploadedMap.has(url)) {
        return uploadedMap.get(url)!;
      }
      return url;
    });

    // Revoke all uploaded blob URLs and delete from staged map
    for (const blobUrl of uploadedMap.keys()) {
      URL.revokeObjectURL(blobUrl);
      stagedFilesRef.current.delete(blobUrl);
    }

    onPhotosChange(finalPhotos);
    return finalPhotos;
  };

  const resetPhotos = () => {
    for (const blobUrl of stagedFilesRef.current.keys()) {
      URL.revokeObjectURL(blobUrl);
    }
    stagedFilesRef.current.clear();
    setNewPhotoUrl('');
    setShowUrlInput(false);
    setIsUploadingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    newPhotoUrl,
    setNewPhotoUrl,
    showUrlInput,
    setShowUrlInput,
    isUploadingPhoto,
    fileInputRef,
    handleFileUpload,
    handleAddPhoto,
    handleRemovePhoto,
    handleSetCover,
    uploadStagedPhotos,
    resetPhotos
  };
}
