import { RecapSkeleton } from '@/components/recap/RecapSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecapLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Year Select Controls Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 min-h-[44px]">
          <Skeleton className="h-4 w-4 rounded-md bg-muted/60" />
          <Skeleton className="h-4 w-28 rounded-md bg-muted/60" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full bg-muted/60 self-start sm:self-auto" />
      </div>

      {/* Main Recap Hero Card Skeleton */}
      <RecapSkeleton />
    </div>
  );
}
