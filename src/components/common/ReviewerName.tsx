'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ReviewerNameProps {
  author: string;
  username?: string | null;
  className?: string;
  showEmptyHint?: boolean;
}

export function isValidUsername(username?: string | null): username is string {
  if (!username) return false;
  const trimmed = username.trim();
  return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined';
}

export function ReviewerName({
  author,
  username,
  className,
  showEmptyHint = true,
}: ReviewerNameProps) {
  const hasUsername = isValidUsername(username);

  if (hasUsername) {
    return (
      <Link
        href={`/u/${encodeURIComponent(username.trim())}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={cn(
          'font-bold text-foreground text-xs truncate hover:text-primary transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold rounded-xs',
          'inline-flex items-center min-h-[44px] md:min-h-0 py-2.5 md:py-0.5 cursor-pointer',
          className
        )}
      >
        <span className="truncate">{author}</span>
      </Link>
    );
  }

  return (
    <span
      aria-disabled="true"
      className={cn(
        'font-bold text-muted-foreground text-xs truncate',
        'inline-flex items-center gap-1.5 min-h-[44px] md:min-h-0 py-2.5 md:py-0.5 cursor-default select-none',
        className
      )}
      title="Người dùng chưa có hồ sơ công khai"
    >
      <span className="truncate">{author}</span>
      {showEmptyHint && (
        <span className="text-[10px] font-normal text-muted-foreground/70 shrink-0">
          (chưa có hồ sơ)
        </span>
      )}
    </span>
  );
}
