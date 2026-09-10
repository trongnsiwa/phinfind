import React from 'react';
import { ShieldCheck, Coffee } from 'lucide-react';

interface AdminEmptyStateProps {
  type: 'pending' | 'rejected';
}

export function AdminEmptyState({ type }: AdminEmptyStateProps) {
  const isPending = type === 'pending';
  const title = isPending ? 'Không có quán chờ duyệt' : 'Không có quán bị từ chối';

  return (
    <div className="bg-card border border-border rounded-2xl p-6 min-h-[160px] flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary border border-border/50 text-muted-foreground mb-3">
        {isPending ? (
          <>
            <ShieldCheck className="w-6 h-6 text-primary stroke-[1.75]" />
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-card border border-border/60">
              <Coffee className="w-3.5 h-3.5 text-primary stroke-[2]" />
            </div>
          </>
        ) : (
          <Coffee className="w-6 h-6 text-muted-foreground stroke-[1.75]" />
        )}
      </div>
      <h3 className="font-sans font-semibold text-sm sm:text-base text-foreground">
        {title}
      </h3>
    </div>
  );
}
