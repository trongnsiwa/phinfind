'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type IllustrationType = 'no-photos' | 'no-reviews' | 'add-photo' | 'no-hours';

interface IllustrationProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
  className?: string;
}

export function NoPhotosIllustration({ size = 160, className, ...props }: IllustrationProps) {
  return (
    <img
      src="/illustrations/no-photos.svg"
      alt="Chưa có hình ảnh"
      width={size}
      height={size}
      className={cn('select-none pointer-events-none object-contain drop-shadow-md', className)}
      {...props}
    />
  );
}

export function NoReviewsIllustration({ size = 160, className, ...props }: IllustrationProps) {
  return (
    <img
      src="/illustrations/no-reviews.svg"
      alt="Chưa có đánh giá"
      width={size}
      height={size}
      className={cn('select-none pointer-events-none object-contain drop-shadow-md', className)}
      {...props}
    />
  );
}

export function AddPhotoIllustration({ size = 160, className, ...props }: IllustrationProps) {
  return (
    <img
      src="/illustrations/add-photo.svg"
      alt="Thêm hình ảnh"
      width={size}
      height={size}
      className={cn('select-none pointer-events-none object-contain drop-shadow-md', className)}
      {...props}
    />
  );
}

export function NoHoursIllustration({ size = 160, className, ...props }: IllustrationProps) {
  return (
    <img
      src="/illustrations/no-hours.svg"
      alt="Chưa có thông tin giờ mở cửa"
      width={size}
      height={size}
      className={cn('select-none pointer-events-none object-contain drop-shadow-md', className)}
      {...props}
    />
  );
}


export function EmptyIllustration({
  type,
  size = 160,
  className,
  ...props
}: {
  type: IllustrationType;
  size?: number | string;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  switch (type) {
    case 'no-photos':
      return <NoPhotosIllustration size={size} className={className} {...props} />;
    case 'no-reviews':
      return <NoReviewsIllustration size={size} className={className} {...props} />;
    case 'add-photo':
      return <AddPhotoIllustration size={size} className={className} {...props} />;
    case 'no-hours':
      return <NoHoursIllustration size={size} className={className} {...props} />;
    default:
      return <NoPhotosIllustration size={size} className={className} {...props} />;
  }
}
