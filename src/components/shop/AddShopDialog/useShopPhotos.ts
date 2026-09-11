import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseShopPhotosOptions {
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

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để tải ảnh lên.');
      return;
    }

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

    setIsUploadingPhoto(true);
    const toastId = toast.loading(`Đang tải lên ${files.length} ảnh...`);
    const newUploadedUrls: string[] = [];

    try {
      for (const file of files) {
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
          console.error('Lỗi khi tải ảnh lên Supabase Storage:', uploadError);
          toast.error(`Không thể tải lên tệp "${file.name}": ${uploadError.message}`, { id: toastId });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('shop-photos')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          newUploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      if (newUploadedUrls.length > 0) {
        onPhotosChange([...photos, ...newUploadedUrls]);
        toast.success(`Đã tải lên thành công ${newUploadedUrls.length} ảnh!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      console.error('Lỗi ngoại lệ khi tải ảnh:', err);
      toast.error('Đã xảy ra lỗi trong quá trình tải ảnh. Vui lòng thử lại.', { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    onPhotosChange(photos.filter((_, i) => i !== indexToRemove));
  };

  const resetPhotos = () => {
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
    resetPhotos
  };
}
