import { Image, Link, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PhotosStepProps {
  photos: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploadingPhoto: boolean;
  showUrlInput: boolean;
  setShowUrlInput: (show: boolean | ((prev: boolean) => boolean)) => void;
  newPhotoUrl: string;
  setNewPhotoUrl: (url: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleAddPhoto: () => void;
  handleRemovePhoto: (index: number) => void;
}

export function PhotosStep({
  photos,
  fileInputRef,
  isUploadingPhoto,
  showUrlInput,
  setShowUrlInput,
  newPhotoUrl,
  setNewPhotoUrl,
  handleFileUpload,
  handleAddPhoto,
  handleRemovePhoto
}: PhotosStepProps) {
  return (
    <div className='space-y-2.5 pt-1'>
      <div className='flex items-center justify-between'>
        <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
          <Image size={13} className='text-amber-gold' />
          <span>Hình ảnh quán ({photos.length})</span>
          <span className='text-[10px] text-muted-foreground font-normal'>(Tối đa 5MB/ảnh)</span>
        </Label>
        <button
          type='button'
          onClick={() => setShowUrlInput(!showUrlInput)}
          className='text-[11px] text-amber-gold hover:underline font-medium cursor-pointer flex items-center gap-1'
        >
          <Link size={11} />
          <span>{showUrlInput ? 'Ẩn dán URL' : 'Hoặc dán URL ảnh'}</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif,image/avif'
        multiple
        onChange={handleFileUpload}
        className='hidden'
      />

      {/* Main Upload Dropzone / Trigger Area */}
      <div
        onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed border-border/80 hover:border-amber-gold/60 bg-secondary/20 hover:bg-secondary/35 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group select-none',
          isUploadingPhoto && 'pointer-events-none opacity-70'
        )}
      >
        <div className='w-10 h-10 rounded-2xl bg-amber-gold/15 text-amber-gold flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200'>
          {isUploadingPhoto ? (
            <Loader2 size={20} className='animate-spin' />
          ) : (
            <Upload size={20} />
          )}
        </div>
        <div className='space-y-0.5'>
          <p className='text-xs font-bold text-foreground group-hover:text-amber-gold transition-colors'>
            {isUploadingPhoto ? 'Đang tải ảnh lên hệ thống...' : 'Tải ảnh lên từ thiết bị'}
          </p>
          <p className='text-[11px] text-muted-foreground'>
            Hỗ trợ chọn nhiều ảnh JPG, PNG, WEBP (tối đa 5MB/tệp)
          </p>
        </div>
      </div>

      {/* Collapsible URL Input fallback */}
      {showUrlInput && (
        <div className='p-3 bg-secondary/30 rounded-xl border border-border/70 space-y-2 animate-in fade-in duration-150'>
          <Label className='text-[11px] font-medium text-muted-foreground'>
            Dán liên kết ảnh trực tiếp (Unsplash, Cloudinary, Imgur...):
          </Label>
          <div className='flex items-center gap-2'>
            <Input
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPhoto();
                }
              }}
              placeholder='https://images.unsplash.com/...'
              className='h-8 text-xs bg-background border-border rounded-lg'
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleAddPhoto}
              disabled={!newPhotoUrl.trim()}
              className='h-8 px-3 text-xs rounded-lg flex-shrink-0 cursor-pointer'
            >
              <Plus size={13} className='mr-1' />
              <span>Thêm</span>
            </Button>
          </div>
        </div>
      )}

      {/* Photo Thumbnails List */}
      {photos.length > 0 && (
        <div className='space-y-1.5 pt-1'>
          <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
            <span>Ảnh đã chọn ({photos.length}):</span>
            <span className='text-[10px] text-amber-gold font-medium'>
              Ảnh đầu tiên là ảnh đại diện
            </span>
          </div>
          <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
            {photos.map((url, index) => (
              <div
                key={index}
                className='relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/80 group shadow-2xs'
              >
                <img
                  src={url}
                  alt={`Ảnh quán ${index + 1}`}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                />
                {index === 0 && (
                  <div className='absolute bottom-1 left-1 bg-black/75 text-amber-gold text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs'>
                    Ảnh đại diện
                  </div>
                )}
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(index);
                  }}
                  className='absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer opacity-90 group-hover:opacity-100 shadow-sm'
                  title='Xóa ảnh này'
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
