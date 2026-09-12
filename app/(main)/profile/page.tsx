'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQueries } from '@tanstack/react-query';
import {
  LogIn,
  User as UserIcon,
  Heart,
  MapPin,
  Award,
  Pencil,
  Star,
  Trash2,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ProfileSkeleton } from '@/components/common/LoadingSkeleton';
import { FavoriteShopCard } from '@/components/shop/FavoriteShopCard';
import dynamic from 'next/dynamic';

const ReviewModal = dynamic(
  () => import('@/components/shop/ReviewModal').then((mod) => mod.ReviewModal),
  { ssr: false, loading: () => null }
);
const EditProfileDialog = dynamic(
  () => import('@/components/profile/EditProfileDialog').then((mod) => mod.EditProfileDialog),
  { ssr: false, loading: () => null }
);
import { ShopImage } from '@/components/common/ShopImage';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgeCard } from '@/components/profile/BadgeCard';
import { useUserBadges } from '@/hooks/useUserBadges';
import { PublicReviewCard } from '@/components/profile/PublicReviewCard';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import {
  useUserFavorites,
  useToggleFavorite,
  useUserReviews,
  useDeleteReview,
  useUserVisits,
  useToggleVisit,
  ReviewData,
  VisitedShopItem,
} from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { API_ENDPOINTS, APP_ROUTES, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  // Reviews-first tab layout per modern social UX
  const [activeTab, setActiveTab] = useState<'reviews' | 'saved' | 'visited'>('reviews');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    user,
    profile,
    setProfile,
    refreshProfile,
    isAuthenticated,
    loading: isAuthLoading,
  } = useAuth();
  const { favorites, setSelectedShop } = useShopStore();
  const { lat, lng } = useLocation();

  // 1. User Favorites Data & Batch Details
  const {
    data: savedFavoritesData,
    isLoading: isFavoritesLoading,
    isFetching: isFavoritesFetching,
  } = useUserFavorites();
  const savedFavorites = savedFavoritesData || [];
  const { toggleFavorite } = useToggleFavorite();
  const badgeData = useUserBadges();
  const [shopToRemove, setShopToRemove] = useState<CoffeeShop | null>(null);
  const [isRemovingShop, setIsRemovingShop] = useState(false);

  const shopQueries = useQueries({
    queries: savedFavorites.map((fav) => ({
      queryKey: ['shops', 'details', fav.place_id, lat, lng],
      queryFn: async () => {
        try {
          const response = await axios.get<{ shop: CoffeeShop }>(
            API_ENDPOINTS.SHOP_DETAILS,
            {
              params: {
                placeId: fav.place_id,
                lat: lat || undefined,
                lng: lng || undefined,
              },
            }
          );
          return response.data.shop;
        } catch {
          return null;
        }
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: Boolean(fav.place_id),
    })),
  });

  const isDetailsLoading =
    savedFavorites.length > 0 && shopQueries.some((q) => q.isLoading && !q.data);
  const isSavedLoading =
    (isFavoritesLoading && !savedFavoritesData) || isDetailsLoading;

  const displayShops: { shop: CoffeeShop; isMissingDetails: boolean }[] = useMemo(() => {
    return savedFavorites.map((fav, index) => {
      const detail = shopQueries[index]?.data;
      if (detail) {
        return { shop: detail, isMissingDetails: false };
      }

      const fallbackShop: CoffeeShop = {
        id: fav.place_id,
        place_id: fav.place_id,
        name: fav.name || 'Quán Cà Phê',
        address: fav.address || 'Chưa có địa chỉ',
        lat: lat || DEFAULT_LOCATION.lat,
        lon: lng || DEFAULT_LOCATION.lng,
        distance: 0,
        distance_text: 'Đã lưu',
        rating: 0,
        total_ratings: 0,
        photos: [],
        categories: [],
        verified: false,
      };

      return { shop: fallbackShop, isMissingDetails: true };
    });
  }, [savedFavorites, shopQueries, lat, lng]);

  const handleConfirmRemoveShop = async () => {
    if (!shopToRemove) return;
    setIsRemovingShop(true);
    try {
      await toggleFavorite(shopToRemove.place_id, shopToRemove);
    } finally {
      setIsRemovingShop(false);
      setShopToRemove(null);
    }
  };

  // 2. User Reviews Data & Deletion
  const {
    data: userReviewsData,
    isLoading: isReviewsLoading,
    isFetching: isReviewsFetching,
  } = useUserReviews();
  const userReviews = userReviewsData || [];
  const deleteReviewMutation = useDeleteReview();
  const [reviewToDelete, setReviewToDelete] = useState<ReviewData | null>(null);
  const [reviewToEdit, setReviewToEdit] = useState<ReviewData | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteReviewMutation.mutateAsync(reviewToDelete.id);
    } finally {
      setReviewToDelete(null);
    }
  };

  // 3. User Visits Data & Removal
  const {
    data: userVisitsData,
    isLoading: isVisitsLoading,
    isFetching: isVisitsFetching,
  } = useUserVisits();
  const userVisits = userVisitsData || [];
  const { toggleVisit } = useToggleVisit();
  const [visitToRemove, setVisitToRemove] = useState<VisitedShopItem | null>(null);
  const [isRemovingVisit, setIsRemovingVisit] = useState(false);

  const handleConfirmRemoveVisit = async () => {
    if (!visitToRemove) return;
    setIsRemovingVisit(true);
    try {
      await toggleVisit(visitToRemove.shop_place_id);
    } finally {
      setIsRemovingVisit(false);
      setVisitToRemove(null);
    }
  };

  const formatVisitedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return 'Hôm nay';
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Tín Đồ Cà Phê';
  const userEmail = profile?.email || user?.email;

  // 1. Unified loading state: true only on initial load when all queries are loading and none have data yet
  const isQueriesLoading = isReviewsLoading && isFavoritesLoading && isVisitsLoading;
  const hasNoData = !userReviewsData && !savedFavoritesData && !userVisitsData;
  const showInitialSkeleton =
    isAuthLoading || (isAuthenticated && isQueriesLoading && hasNoData);

  // 2. Background refetch indicator: subtle spinner only, never re-show skeleton
  const isBackgroundFetching =
    !showInitialSkeleton &&
    (isReviewsFetching || isFavoritesFetching || isVisitsFetching);

  if (showInitialSkeleton) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* 1. HEADER SECTION (Unified Card) */}
      <Card className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5 relative">
        {/* Top-Right: Edit Profile Icon Button */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="rounded-xl border-border hover:bg-secondary/60 text-xs font-medium gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 cursor-pointer shadow-xs"
              title="Chỉnh sửa hồ sơ"
            >
              <Pencil size={14} className="text-primary" />
              <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
              <span className="sm:hidden">Sửa</span>
            </Button>
          ) : (
            <Button
              size="sm"
              asChild
              className="rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold h-8 sm:h-9 px-3 cursor-pointer shadow-xs"
            >
              <Link href={APP_ROUTES.LOGIN}>
                <LogIn size={13} className="mr-1" /> Đăng nhập
              </Link>
            </Button>
          )}
        </div>

        {/* Left: Avatar + User Info */}
        <div className="flex items-center gap-4 min-w-0 pr-12 sm:pr-36">
          <Avatar className="w-16 h-16 border-2 border-border/80 shrink-0 shadow-xs">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-secondary text-primary font-bold text-xl">
              <UserIcon size={26} />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-sans font-bold text-lg text-foreground tracking-tight truncate">
                {displayName}
              </h1>
              {isAuthenticated && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  Thành viên
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {isAuthenticated ? userEmail : 'Khách khám phá · Người yêu cà phê'}
            </p>
            {isAuthenticated && profile?.username && (
              <p className="text-xs text-primary font-medium">@{profile.username}</p>
            )}
            {isAuthenticated && profile?.bio && (
              <p className="text-xs text-foreground/80 pt-0.5 line-clamp-2 max-w-lg leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* 2. STATS ROW (Separate Card Below Header) */}
      <Card className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-4">
          {/* Stat 1: Đã lưu */}
          <div className="text-left space-y-1">
            <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight">
              {savedFavorites.length}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart size={13} className="text-rose-500 fill-rose-500/20 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                Đã lưu
              </span>
            </div>
          </div>

          {/* Stat 2: Đã ghé */}
          <div className="text-left space-y-1">
            <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight">
              {userVisits.length}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={13} className="text-primary fill-primary/20 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                Đã ghé
              </span>
            </div>
          </div>

          {/* Stat 3: Huy hiệu */}
          <div className="text-left space-y-1">
            <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight">
              {badgeData.label}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Award size={13} className="text-amber-500 fill-amber-500/20 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                Huy hiệu
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2.5 Badge & Achievement System Card */}
      {isAuthenticated &&
        (badgeData.isLoading ? (
          <Card className="bg-card border-border rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </Card>
        ) : (
          <BadgeCard
            tier={badgeData.tier}
            label={badgeData.label}
            totalContributions={badgeData.totalContributions}
            progressPercent={badgeData.progressPercent}
            remaining={badgeData.remaining}
            nextTierLabel={badgeData.nextTierLabel}
            categoryBadges={badgeData.categoryBadges}
          />
        ))}

      {/* 3. TABBED CONTENT (Reviews First) */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'reviews' | 'saved' | 'visited')}
        className="w-full space-y-4 pt-1"
      >
        {/* Underline Tabs Header */}
        <div className="relative border-b border-border flex items-center justify-between">
          <TabsList className="flex items-center justify-start bg-transparent p-0 h-auto rounded-none w-auto gap-6 sm:gap-8 overflow-x-auto">
            {/* Tab 1: Đánh giá của tôi (Default) */}
            <TabsTrigger
              value="reviews"
              className="pb-3 pt-1.5 px-1 font-semibold text-sm sm:text-base text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center gap-1.5 shrink-0"
            >
              <Star size={15} />
              <span>Đánh giá của tôi</span>
            </TabsTrigger>

            {/* Tab 2: Đã lưu */}
            <TabsTrigger
              value="saved"
              className="pb-3 pt-1.5 px-1 font-semibold text-sm sm:text-base text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center gap-1.5 shrink-0"
            >
              <Heart size={15} />
              <span>Đã lưu</span>
            </TabsTrigger>

            {/* Tab 3: Đã ghé */}
            <TabsTrigger
              value="visited"
              className="pb-3 pt-1.5 px-1 font-semibold text-sm sm:text-base text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center gap-1.5 shrink-0"
            >
              <MapPin size={15} />
              <span>Đã ghé</span>
            </TabsTrigger>
          </TabsList>

          {isBackgroundFetching && (
            <div className="flex items-center gap-1.5 text-muted-foreground animate-in fade-in duration-200 pb-2.5 pr-1">
              <Loader2 size={13} className="animate-spin text-primary shrink-0" />
              <span className="text-[11px] font-medium hidden sm:inline">Đang đồng bộ...</span>
            </div>
          )}
        </div>

        {/* 1. REVIEWS TAB CONTENT (Default active tab) */}
        <TabsContent value="reviews" className="mt-0 focus-visible:outline-none space-y-4">
          {!isAuthenticated && !isAuthLoading ? (
            <EmptyState
              icon={Star}
              title="Đăng Nhập Để Xem Đánh Giá"
              description="Vui lòng đăng nhập tài khoản để theo dõi và quản lý các bài đánh giá cà phê của bạn."
              actionLabel="Đăng nhập ngay"
              onAction={() => router.push(APP_ROUTES.LOGIN)}
              className="py-12"
            />
          ) : isReviewsLoading && !userReviewsData ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Đang tải đánh giá...</p>
            </div>
          ) : userReviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="Chưa Có Đánh Giá Nào"
              description="Bạn chưa viết cảm nhận cho quán cà phê nào. Hãy ghé thăm các quán trên bản đồ và chia sẻ trải nghiệm thực tế của bạn!"
              actionLabel="Khám phá quán ngay"
              onAction={() => router.push(APP_ROUTES.HOME)}
              className="py-12"
            />
          ) : (
            <div className="space-y-3.5">
              {userReviews.map((review) => (
                <PublicReviewCard
                  key={review.id}
                  review={review}
                  action={
                    <div className="flex items-center gap-1.5 self-end sm:self-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReviewToEdit(review);
                          setIsReviewModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 px-2.5 rounded-xl text-xs gap-1.5 cursor-pointer transition-colors"
                        title="Chỉnh sửa đánh giá này"
                      >
                        <Pencil size={13} />
                        <span>Sửa</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewToDelete(review)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-xl text-xs gap-1.5 cursor-pointer transition-colors"
                        title="Xóa đánh giá này"
                      >
                        <Trash2 size={13} />
                        <span>Xóa</span>
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 2. SAVED TAB CONTENT */}
        <TabsContent value="saved" className="mt-0 focus-visible:outline-none space-y-4">
          {!isAuthenticated && !isAuthLoading ? (
            <EmptyState
              icon={Heart}
              title="Đăng Nhập Để Xem Quán Đã Lưu"
              description="Vui lòng đăng nhập để đồng bộ và quản lý danh sách các quán cà phê yêu thích của bạn."
              actionLabel="Đăng nhập ngay"
              onAction={() => router.push(APP_ROUTES.LOGIN)}
              className="py-12"
            />
          ) : isFavoritesLoading && !savedFavoritesData ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Đang tải quán đã lưu...</p>
            </div>
          ) : displayShops.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Chưa Có Quán Nào Được Lưu"
              description="Hãy khám phá danh sách quán cà phê đặc sắc và nhấn vào biểu tượng trái tim để lưu lại quán yêu thích của bạn."
              actionLabel="Khám phá thêm"
              onAction={() => router.push(APP_ROUTES.HOME)}
              className="py-12"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayShops.map(({ shop, isMissingDetails }) => (
                <FavoriteShopCard
                  key={shop.id || shop.place_id}
                  shop={shop}
                  isFavorite={favorites.includes(shop.place_id)}
                  isMissingDetails={isMissingDetails}
                  onToggleFavorite={(placeId) => toggleFavorite(placeId, shop)}
                  onRequestRemove={(targetShop) => setShopToRemove(targetShop)}
                  onSelect={(selected) => setSelectedShop(selected)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 3. VISITED TAB CONTENT */}
        <TabsContent value="visited" className="mt-0 focus-visible:outline-none space-y-4">
          {!isAuthenticated && !isAuthLoading ? (
            <EmptyState
              icon={CheckCircle2}
              title="Đăng Nhập Để Xem Lịch Sử Đã Ghé"
              description="Vui lòng đăng nhập tài khoản để theo dõi và lưu lại hành trình các quán cà phê bạn đã trải nghiệm."
              actionLabel="Đăng nhập ngay"
              onAction={() => router.push(APP_ROUTES.LOGIN)}
              className="py-12"
            />
          ) : isVisitsLoading && !userVisitsData ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Đang tải lịch sử đã ghé...</p>
            </div>
          ) : userVisits.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Chưa Có Quán Cà Phê Nào Đã Ghé"
              description="Bạn chưa đánh dấu quán cà phê nào đã ghé thăm. Hãy khám phá và ghi lại hành trình thưởng thức cà phê của bạn!"
              actionLabel="Khám phá quán ngay"
              onAction={() => router.push(APP_ROUTES.HOME)}
              className="py-12"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userVisits.map((visit) => {
                const coverPhoto = visit.shop?.photos?.[0];
                return (
                  <Card
                    key={visit.id || visit.shop_place_id}
                    className="p-3.5 bg-card border border-border shadow-card hover:shadow-card-hover rounded-2xl transition-all flex flex-col justify-between group overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Thumbnail or placeholder */}
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-secondary">
                        <ShopImage
                          src={coverPhoto}
                          alt={visit.shop_name}
                          fallback={
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/70">
                              <MapPin size={24} className="text-primary/70 mb-1" />
                              <span className="text-[11px] font-medium">Quán Cà Phê</span>
                            </div>
                          }
                          imageClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />

                        {/* Visited Date Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <Badge
                            variant="secondary"
                            className="bg-black/70 text-white backdrop-blur-md border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                          >
                            <CalendarCheck size={11} className="text-amber-400" />
                            <span>{formatVisitedDate(visit.visited_at)}</span>
                          </Badge>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <Link
                          href={APP_ROUTES.SHOP_DETAIL(visit.shop_place_id)}
                          className="font-sans font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors block line-clamp-1"
                        >
                          {visit.shop_name}
                        </Link>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                          <MapPin size={11} className="shrink-0 text-primary" />
                          <span className="truncate">{visit.shop_address || 'Chưa có địa chỉ'}</span>
                        </p>
                      </div>

                      {/* Note if any */}
                      {visit.note && (
                        <div className="p-2 bg-secondary/50 rounded-lg text-xs text-muted-foreground italic line-clamp-2 border border-border/50">
                          &ldquo;{visit.note}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
                      {visit.shop?.rating ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold px-1.5 py-0.5 flex items-center gap-1 rounded-md"
                        >
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{Number(visit.shop.rating).toFixed(1)}</span>
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Đã xác nhận ghé</span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisitToRemove(visit)}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1 cursor-pointer"
                        title="Bỏ đánh dấu đã ghé"
                      >
                        <Trash2 size={13} />
                        <span>Bỏ ghé</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Remove Visited Shop Confirmation Alert Dialog */}
      <AlertDialog
        open={!!visitToRemove}
        onOpenChange={(open) => !open && setVisitToRemove(null)}
      >
        <AlertDialogContent className="bg-card border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-foreground">
              Bỏ đánh dấu đã ghé?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn bỏ đánh dấu đã ghé quán &quot;{visitToRemove?.shop_name}&quot; khỏi lịch sử ghé thăm không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isRemovingVisit}
              className="border-border text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovingVisit}
              onClick={handleConfirmRemoveVisit}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold cursor-pointer"
            >
              {isRemovingVisit ? 'Đang bỏ...' : 'Bỏ đánh dấu'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Saved Shop Confirmation Alert Dialog */}
      <AlertDialog
        open={!!shopToRemove}
        onOpenChange={(open) => !open && setShopToRemove(null)}
      >
        <AlertDialogContent className="bg-card border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-foreground">
              Xóa khỏi danh sách đã lưu?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn xóa &quot;{shopToRemove?.name}&quot; khỏi danh sách các quán đã lưu không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isRemovingShop}
              className="border-border text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovingShop}
              onClick={handleConfirmRemoveShop}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold cursor-pointer"
            >
              {isRemovingShop ? 'Đang xóa...' : 'Xác nhận xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Review Confirmation Alert Dialog */}
      <AlertDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
        <AlertDialogContent className="bg-card border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-foreground">
              Xóa đánh giá này?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn xóa bài đánh giá cho &quot;{reviewToDelete?.shop_name}&quot; không? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteReviewMutation.isPending}
              className="border-border text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteReviewMutation.isPending}
              onClick={handleConfirmDeleteReview}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold cursor-pointer"
            >
              {deleteReviewMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Modal Dialog */}
      {isEditOpen && (
        <EditProfileDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          user={user}
          profile={profile}
          onProfileUpdated={(updated) => {
            if (updated) setProfile(updated);
            else refreshProfile();
          }}
        />
      )}

      {/* 5. Review Edit Modal */}
      {reviewToEdit && (
        <ReviewModal
          open={isReviewModalOpen}
          onOpenChange={(open) => {
            setIsReviewModalOpen(open);
            if (!open) setReviewToEdit(null);
          }}
          shop={{
            id: reviewToEdit.shop_place_id,
            place_id: reviewToEdit.shop_place_id,
            name: reviewToEdit.shop_name || 'Quán Cà Phê',
            address: reviewToEdit.shop_address || '',
            lat: 0,
            lon: 0,
            distance: 0,
            distance_text: '',
            rating: 0,
            total_ratings: 0,
            photos: reviewToEdit.shop_photo ? [reviewToEdit.shop_photo] : [],
            categories: [],
            verified: false,
          }}
          existingReview={{
            id: reviewToEdit.id,
            user_id: reviewToEdit.user_id,
            author: reviewToEdit.author,
            avatar: reviewToEdit.avatar || undefined,
            username: reviewToEdit.username || undefined,
            rating: reviewToEdit.rating,
            date: new Date(reviewToEdit.created_at).toLocaleDateString('vi-VN'),
            comment: reviewToEdit.comment,
            images: reviewToEdit.images || [],
          }}
        />
      )}
    </div>
  );
}
