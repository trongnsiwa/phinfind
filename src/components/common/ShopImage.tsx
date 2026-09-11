'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ShopImageProps {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  draggable?: boolean;
  unoptimized?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  children?: React.ReactNode;
}

export function ShopImage({
  src,
  alt,
  fallback,
  className,
  imageClassName,
  fill = true,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  draggable = false,
  unoptimized = false,
  onLoad,
  onError,
  children,
}: ShopImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  if (!src || hasError) {
    if (fallback) {
      return (
        <div className={cn(fill && 'relative w-full h-full', className)}>
          {fallback}
        </div>
      );
    }
    return null;
  }

  return (
    <div className={cn(fill && 'relative w-full h-full', className)}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={fill ? sizes : undefined}
        priority={priority}
        draggable={draggable}
        quality={85}
        unoptimized={unoptimized || src.startsWith('blob:') || src.startsWith('data:')}
        className={cn('object-cover', imageClassName)}
        onLoad={onLoad}
        onError={handleImageError}
      />
      {children}
    </div>
  );
}
