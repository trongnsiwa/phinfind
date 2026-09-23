'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, PlayCircle, Plus, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShopImage } from '@/components/common/ShopImage';
import { parseVideoUrl } from '@/lib/utils/video';
import { cn } from '@/lib/utils';
import type { ShopVideo, VideoPlatform } from '@/types/shop';

interface VideosStepProps {
  videos: ShopVideo[];
  onVideosChange: (videos: ShopVideo[]) => void;
}

const PLATFORM_COLORS: Record<VideoPlatform, { bg: string; text: string; label: string }> = {
  tiktok: { bg: 'bg-black/80', text: 'text-white', label: 'TikTok' },
  youtube: { bg: 'bg-[#FF0000]', text: 'text-white', label: 'YouTube' },
  instagram: { bg: 'bg-[#E4405F]', text: 'text-white', label: 'Instagram' },
  facebook: { bg: 'bg-[#1877F2]', text: 'text-white', label: 'Facebook' }
};

export function VideosStep({ videos, onVideosChange }: VideosStepProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isMaxReached = videos.length >= 6;

  const handleAddVideo = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (isMaxReached) {
      toast.error('Đã đạt giới hạn tối đa', {
        description: 'Chỉ có thể thêm tối đa 6 video cho mỗi quán.'
      });
      return;
    }

    const parsed = parseVideoUrl(trimmed);
    if (!parsed) {
      toast.error('Đường dẫn video không hợp lệ', {
        description: 'Vui lòng dán liên kết video từ TikTok, YouTube, Instagram hoặc Facebook.'
      });
      return;
    }

    // Check duplicate
    const isDuplicate = videos.some(
      (v) =>
        v.url === trimmed ||
        (v.platform === parsed.platform && v.video_id === parsed.video_id)
    );
    if (isDuplicate) {
      toast.error('Video đã tồn tại', {
        description: 'Video này đã có trong danh sách của quán.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post<ShopVideo>('/api/videos/resolve', { url: trimmed });
      const enrichedVideo = response.data;
      onVideosChange([...videos, enrichedVideo]);
      setUrlInput('');
      toast.success('Đã thêm video thành công!');
    } catch {
      toast.error('Không thể lấy thông tin video', {
        description: 'Vui lòng kiểm tra lại liên kết video và thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVideo = (index: number) => {
    const updated = videos.filter((_, i) => i !== index);
    onVideosChange(updated);
  };

  return (
    <div className='space-y-3 pt-1'>
      <div className='flex items-center justify-between'>
        <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
          <Video size={13} className='text-amber-gold' />
          <span>Video giới thiệu ({videos.length}/6)</span>
          <span className='text-[10px] text-muted-foreground font-normal'>(Tùy chọn)</span>
        </Label>
      </div>

      {/* Input row */}
      <div className='flex flex-col sm:flex-row gap-2'>
        <div className='relative flex-1'>
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleAddVideo();
              }
            }}
            placeholder='Dán link TikTok, YouTube, Reels, Facebook...'
            disabled={isLoading || isMaxReached}
            className='h-11 md:h-10 text-sm bg-secondary/50 border-border rounded-xl pr-3'
          />
        </div>
        <Button
          type='button'
          onClick={handleAddVideo}
          disabled={isLoading || isMaxReached || !urlInput.trim()}
          className='h-11 md:h-10 px-4 font-semibold text-xs rounded-xl bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground min-w-[110px] shrink-0'
        >
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin mr-1.5' />
          ) : (
            <Plus className='h-4 w-4 mr-1.5' />
          )}
          <span>Thêm video</span>
        </Button>
      </div>

      {/* Video chips grid */}
      {videos.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1'>
          {videos.map((video, index) => {
            const platformConfig = PLATFORM_COLORS[video.platform] || PLATFORM_COLORS.youtube;
            return (
              <div
                key={`${video.platform}-${video.video_id}-${index}`}
                className='group relative aspect-[9/16] rounded-xl overflow-hidden border border-border/60 bg-muted flex flex-col justify-between shadow-xs'
              >
                {/* Media background */}
                {video.thumbnail_url ? (
                  <ShopImage
                    src={video.thumbnail_url}
                    alt={video.title || 'Video preview'}
                    imageClassName='object-cover'
                    fill
                  />
                ) : (
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center p-2',
                      video.platform === 'tiktok' && 'bg-zinc-900',
                      video.platform === 'youtube' && 'bg-red-950',
                      video.platform === 'instagram' && 'bg-fuchsia-950',
                      video.platform === 'facebook' && 'bg-blue-950'
                    )}
                  >
                    <PlayCircle className='h-8 w-8 text-white/70' />
                  </div>
                )}

                {/* Gradient shade */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none' />

                {/* Top bar: Platform badge & delete button */}
                <div className='relative z-10 flex items-center justify-between p-1.5'>
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs',
                      platformConfig.bg,
                      platformConfig.text
                    )}
                  >
                    {platformConfig.label}
                  </span>

                  <button
                    type='button'
                    onClick={() => handleRemoveVideo(index)}
                    aria-label={`Xóa video ${index + 1}`}
                    className='h-7 w-7 rounded-full bg-black/60 hover:bg-destructive text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold'
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Center play icon overlay */}
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <PlayCircle className='h-8 w-8 text-white/80 drop-shadow-md' />
                </div>

                {/* Bottom title */}
                {video.title && (
                  <div className='relative z-10 p-1.5'>
                    <p className='text-[10px] font-medium text-white line-clamp-2 leading-tight drop-shadow-sm'>
                      {video.title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
