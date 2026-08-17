'use client';

import React, { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function InfiniteScroll({ onLoadMore, hasMore, isLoading }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) {
    return (
      <div className="col-span-full py-8 text-center text-xs text-phin-600 font-medium">
        ☕ You&apos;ve explored all nearby coffee spots!
      </div>
    );
  }

  return (
    <div ref={sentinelRef} className="col-span-full py-6 flex items-center justify-center">
      {isLoading && (
        <div className="flex items-center gap-2 text-xs font-semibold text-phin-700">
          <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Brewing more coffee spots...
        </div>
      )}
    </div>
  );
}
