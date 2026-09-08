'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQueries } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  LogIn,
  User as UserIcon,
  Save,
  Heart,
  MapPin,
  Award,
  Pencil,
  Star,
  Trash2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  Compass,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { EmptyState } from '@/components/common/EmptyState';
import { ProfileSkeleton } from '@/components/common/LoadingSkeleton';
import { FavoriteShopCard } from '@/components/shop/FavoriteShopCard';
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
import { useUIStore } from '@/stores/useUIStore';
import { API_ENDPOINTS, APP_ROUTES, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  // Reviews-first tab layout per modern social UX
  const [activeTab, setActiveTab] = useState<'reviews' | 'saved' | 'visited'>('reviews');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { user, profile, isAuthenticated, loading: isAuthLoading } = useAuth();
  const { favorites, setSelectedShop } = useShopStore();
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const { lat, lng } = useLocation();

  // 1. User Favorites Data & Batch Details
  const {
    data: savedFavoritesData,
    isLoading: isFavoritesLoading,
    isFetching: isFavoritesFetching,
  } = useUserFavorites();
  const savedFavorites = savedFavoritesData || [];
  const { toggleFavorite } = useToggleFavorite();
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

  // 4. Edit Profile Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      username: profile?.username || '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || '',
        username: profile.username || '',
      });
    }
  }, [profile, form]);

  const onSubmit = (_data: ProfileFormValues) => {
    toast.success('Cập nhật hồ sơ thành công!');
    setIsEditOpen(false);
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
              Đồng
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
                <Card
                  key={review.id}
                  className="p-4 sm:p-5 bg-card border border-border shadow-card rounded-2xl transition-all hover:border-border/80"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Shop info and rating */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={APP_ROUTES.SHOP_DETAIL(review.shop_place_id)}
                          className="font-sans font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                        >
                          <span className="truncate">{review.shop_name || 'Quán Cà Phê'}</span>
                          <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary shrink-0" />
                        </Link>
                      </div>

                      {review.shop_address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin size={12} className="shrink-0 text-primary" />
                          <span>{review.shop_address}</span>
                        </p>
                      )}

                      {/* Star Rating & Date */}
                      <div className="flex items-center gap-2.5 pt-0.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={
                                star <= review.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-muted-foreground/30 fill-muted-foreground/10'
                              }
                            />
                          ))}
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1.5">
                            {review.rating}.0
                          </span>
                        </div>

                        <span className="text-muted-foreground/40 text-xs">•</span>

                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(review.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Delete Action */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReviewToDelete(review)}
                      className="self-end sm:self-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-xl text-xs gap-1.5 cursor-pointer transition-colors"
                      title="Xóa đánh giá này"
                    >
                      <Trash2 size={13} />
                      <span>Xóa</span>
                    </Button>
                  </div>

                  {/* Review Comment */}
                  <div className="mt-2.5 pt-2.5 border-t border-border/40">
                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {review.comment}
                    </p>
                  </div>

                  {/* Review Photos (if any) */}
                  {review.images && review.images.length > 0 && (
                    <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                      {review.images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => openImagePreview(review.images || [], idx)}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border/80 bg-muted cursor-pointer shrink-0 hover:border-primary/60 transition-all shadow-xs group"
                        >
                          <img
                            src={img}
                            alt={`Ảnh đánh giá ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
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
                        {coverPhoto ? (
                          <img
                            src={coverPhoto}
                            alt={visit.shop_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/70">
                            <MapPin size={24} className="text-primary/70 mb-1" />
                            <span className="text-[11px] font-medium">Quán Cà Phê</span>
                          </div>
                        )}

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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Chỉnh sửa thông tin cá nhân
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cập nhật họ tên và tên người dùng hiển thị của bạn trên PhinFind.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground font-medium">Họ và tên</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Họ và tên của bạn"
                        className="h-10 text-xs border-border bg-secondary/30 rounded-xl focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground font-medium">Tên người dùng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tên người dùng (@username)"
                        className="h-10 text-xs border-border bg-secondary/30 rounded-xl focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-row gap-2 pt-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 sm:flex-initial rounded-xl border-border text-xs cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="flex-1 sm:flex-initial bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl text-xs cursor-pointer"
                >
                  <Save size={14} className="mr-1.5" /> Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
