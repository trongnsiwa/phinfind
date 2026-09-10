import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminSkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <Card
          key={index}
          className="p-3.5 sm:p-4 bg-card border border-border rounded-2xl shadow-card"
        >
          {/* Top layout */}
          <div className="flex gap-3.5 items-start">
            {/* Thumbnail skeleton (80x80) */}
            <Skeleton className="w-20 h-20 shrink-0 rounded-xl" />

            {/* Right column */}
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4.5 w-44 sm:w-56 rounded-md" />
              <Skeleton className="h-3.5 w-60 sm:w-72 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
              <div className="flex gap-1.5 pt-0.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
