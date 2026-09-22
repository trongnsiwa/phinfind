'use client';

import React, { useState } from 'react';
import { ChevronDown, Phone, Share2 } from 'lucide-react';
import {
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Youtube
} from '@/components/common/SocialIcons';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { AddShopFormData } from './types';

interface ContactStepProps {
  register: UseFormRegister<AddShopFormData>;
  errors: FieldErrors<AddShopFormData>;
}

function SocialInput({
  icon,
  error,
  ...props
}: React.ComponentProps<typeof Input> & { icon: React.ReactNode; error?: string }) {
  return (
    <div className='space-y-1'>
      <div className='relative flex items-center'>
        <span className='absolute left-3 pointer-events-none'>{icon}</span>
        <Input
          {...props}
          className='h-11 md:h-9 pl-9 text-sm md:text-xs bg-secondary/50 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold transition-all'
        />
      </div>
      {error && <p className='text-[11px] text-rose-500 mt-1'>{error}</p>}
    </div>
  );
}

export function ContactStep({ register, errors }: ContactStepProps) {
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  const hasSocialError = Boolean(
    errors.facebook_url ||
    errors.instagram_url ||
    errors.tiktok_url ||
    errors.youtube_url ||
    errors.zalo_url
  );

  const isOpen = isSocialOpen || hasSocialError;

  return (
    <div id='step-5' data-step='5' className='space-y-3.5 pt-5 border-t border-border/40'>
      {/* MOBILE HEADER ( < md ): Two-line hierarchy */}
      <div className='md:hidden space-y-0.5'>
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-amber-gold'>Bước 5</span>
          <h3 className='text-sm font-bold text-foreground'>Liên hệ &amp; Hình ảnh</h3>
        </div>
        <p className='text-[11px] text-muted-foreground'>Không bắt buộc</p>
      </div>

      {/* TABLET / DESKTOP HEADER ( >= md ): Preserved */}
      <h3 className='hidden md:flex text-xs font-bold text-foreground uppercase tracking-wider items-center gap-1.5'>
        <Phone size={14} className='text-amber-gold' />
        <span>4. Liên hệ &amp; Hình ảnh (Tùy chọn)</span>
      </h3>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label htmlFor='shop-phone' className='text-xs font-semibold text-foreground mb-1.5 block'>
            Số điện thoại
          </Label>
          <Input
            id='shop-phone'
            type='tel'
            inputMode='tel'
            enterKeyHint='next'
            {...register('phone')}
            placeholder='VD: 0912 345 678'
            className='h-11 md:h-9 bg-secondary/50 border-border text-sm md:text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold transition-all'
          />
        </div>

        <div className='space-y-1'>
          <Label htmlFor='shop-website' className='text-xs font-semibold text-foreground mb-1.5 block'>
            Website / Fanpage URL
          </Label>
          <Input
            id='shop-website'
            type='url'
            inputMode='url'
            enterKeyHint='done'
            {...register('website')}
            placeholder='https://facebook.com/...'
            className='h-11 md:h-9 bg-secondary/50 border-border text-sm md:text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold transition-all'
          />
          {errors.website && (
            <p className='text-[11px] text-rose-500 mt-1'>{errors.website.message}</p>
          )}
        </div>
      </div>

      {/* Collapsible Social Links Section */}
      <div className='space-y-2 pt-2 border-t border-border/30'>
        <button
          type='button'
          onClick={() => setIsSocialOpen(!isOpen)}
          className='flex items-center justify-between w-full text-xs font-semibold text-foreground py-1.5 cursor-pointer select-none group min-h-[44px]'
          aria-expanded={isOpen}
        >
          <span className='flex items-center gap-1.5'>
            <Share2 size={13} className='text-amber-gold flex-shrink-0' />
            <span>Mạng xã hội (tùy chọn)</span>
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-150'>
            <SocialInput
              id='shop-facebook'
              icon={<Facebook size={14} className='text-[#1877F2]' />}
              placeholder='https://facebook.com/quancafe'
              {...register('facebook_url')}
              error={errors.facebook_url?.message}
            />
            <SocialInput
              id='shop-instagram'
              icon={<Instagram size={14} className='text-[#E4405F]' />}
              placeholder='https://instagram.com/quancafe'
              {...register('instagram_url')}
              error={errors.instagram_url?.message}
            />
            <SocialInput
              id='shop-tiktok'
              icon={<Music2 size={14} />}
              placeholder='https://tiktok.com/@quancafe'
              {...register('tiktok_url')}
              error={errors.tiktok_url?.message}
            />
            <SocialInput
              id='shop-youtube'
              icon={<Youtube size={14} className='text-[#FF0000]' />}
              placeholder='https://youtube.com/@quancafe'
              {...register('youtube_url')}
              error={errors.youtube_url?.message}
            />
            <SocialInput
              id='shop-zalo'
              icon={<MessageCircle size={14} className='text-[#0068FF]' />}
              placeholder='https://zalo.me/0901234567'
              {...register('zalo_url')}
              error={errors.zalo_url?.message}
            />
          </div>
        )}
      </div>
    </div>
  );
}
