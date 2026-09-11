'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePublicProfile } from '@/hooks/useShops';
import { PublicProfileHeader } from '@/components/profile/PublicProfileHeader';
import { PublicReviewCard } from '@/components/profile/PublicReviewCard';
import { ProfileSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { APP_ROUTES } from '@/lib/utils/constants';

export default function PublicProfilePage() {
  const params = useParams();
  const rawUsername = params?.username;
  const username =
    typeof rawUsername === 'string'
      ? rawUsername
      : Array.isArray(rawUsername)
        ? rawUsername[0]
        : '';

  const router = useRouter();
  const { profile: currentUserProfile, isAuthenticated, loading: isAuthLoading } = useAuth();

  // Redirect to private /profile if the logged-in user visits their own /u/[username]
  useEffect(() => {
    if (
      !isAuthLoading &&
      isAuthenticated &&
      currentUserProfile?.username &&
      username &&
      currentUserProfile.username.toLowerCase() === username.toLowerCase()
    ) {
      router.replace(APP_ROUTES.PROFILE);
    }
  }, [isAuthLoading, isAuthenticated, currentUserProfile?.username, username, router]);

  const { data, isLoading, isError } = usePublicProfile(username);

  // When visiting own profile while authenticated, render skeleton while redirect completes
  if (
    !isAuthLoading &&
    isAuthenticated &&
    currentUserProfile?.username &&
    username &&
    currentUserProfile.username.toLowerCase() === username.toLowerCase()
  ) {
    return <ProfileSkeleton />;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !data?.profile) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={User}
          title="Không tìm thấy người dùng"
          description="Tên người dùng này không tồn tại hoặc người dùng chưa thiết lập hồ sơ công khai."
          actionLabel="Về trang chủ"
          onAction={() => router.push(APP_ROUTES.HOME)}
          className="py-12"
        />
      </div>
    );
  }

  const { profile, reviews } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* 1. Public Profile Header */}
      <PublicProfileHeader profile={profile} reviewCount={reviews.length} />

      {/* 2. Reviews Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Star size={16} className="text-amber-500 fill-amber-500/20" />
            <span>Đánh giá ({reviews.length})</span>
          </h2>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Người dùng chưa có đánh giá"
            description="Người dùng này chưa có bài đánh giá nào."
            className="py-12"
          />
        ) : (
          <div className="space-y-3.5">
            {reviews.map((review) => (
              <PublicReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
