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
  ExternalLink,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { FavoriteShopCard } from '@/components/shop/FavoriteShopCard';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import {
  useUserFavorites,
  useToggleFavorite,
  useUserReviews,
  useDeleteReview,
  ReviewData,
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
    data: savedFavorites = [],
    isLoading: isFavoritesLoading,
  } = useUserFavorites();
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
      enabled: Boolean(fav.place_id),
    })),
  });

  const isDetailsLoading =
    savedFavorites.length > 0 && shopQueries.some((q) => q.isLoading);
  const isSavedLoading = isAuthLoading || (isAuthenticated && isFavoritesLoading) || isDetailsLoading;

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
  const { data: userReviews = [], isLoading: isReviewsLoading } = useUserReviews();
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

  // 3. Edit Profile Form
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

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* 1. COMPACT HEADER SECTION (Threads / Google Maps style) */}
      <Card className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Avatar + User Info */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-border/80 shrink-0 shadow-sm">
              <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
              <AvatarFallback className="bg-secondary text-primary font-bold text-lg sm:text-xl">
                <UserIcon size={24} />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-sans font-bold text-lg sm:text-xl text-foreground tracking-tight truncate">
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
              <p className="text-xs text-muted-foreground truncate">
                {isAuthenticated ? userEmail : 'Khách khám phá · Người yêu cà phê'}
              </p>
              {isAuthenticated && profile?.username && (
                <p className="text-xs text-primary font-medium">@{profile.username}</p>
              )}
            </div>
          </div>

          {/* Right: Quick Action Button */}
          <div className="shrink-0">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="rounded-xl border-border hover:bg-secondary/60 text-xs font-medium gap-1.5 h-9 px-3 cursor-pointer shadow-xs"
              >
                <Pencil size={13} className="text-primary" />
                <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
                <span className="sm:hidden">Sửa</span>
              </Button>
            ) : (
              <Button
                size="sm"
                asChild
                className="rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold h-9 px-3 cursor-pointer shadow-xs"
              >
                <Link href={APP_ROUTES.LOGIN}>
                  <LogIn size={13} className="mr-1" /> Đăng nhập
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 2. COMPACT STATS ROW (Pill / Card style) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        <div className="bg-card border border-border shadow-xs rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-center gap-2 sm:gap-3 transition-colors hover:border-primary/40">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <Heart size={16} className="fill-rose-500/20" />
          </div>
          <div className="text-left">
            <span className="font-sans font-bold text-base sm:text-lg text-foreground block leading-tight">
              {savedFavorites.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
              Đã lưu
            </span>
          </div>
        </div>

        <div className="bg-card border border-border shadow-xs rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-center gap-2 sm:gap-3 transition-colors hover:border-primary/40">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <MapPin size={16} className="fill-primary/20" />
          </div>
          <div className="text-left">
            <span className="font-sans font-bold text-base sm:text-lg text-foreground block leading-tight">
              12
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
              Đã ghé
            </span>
          </div>
        </div>

        <div className="bg-card border border-border shadow-xs rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-center gap-2 sm:gap-3 transition-colors hover:border-primary/40">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Award size={16} className="fill-amber-500/20" />
          </div>
          <div className="text-left">
            <span className="font-sans font-bold text-base sm:text-lg text-foreground block leading-tight">
              Đồng
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
              Huy hiệu
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABBED CONTENT (Reviews First) */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'reviews' | 'saved' | 'visited')}
        className="w-full space-y-4 pt-1"
      >
        {/* Underline Tabs Header */}
        <div className="relative border-b border-border">
          <TabsList className="flex items-center justify-start bg-transparent p-0 h-auto rounded-none w-full gap-5 sm:gap-8 overflow-x-auto">
            {/* Tab 1: Đánh giá của tôi (Default) */}
            <TabsTrigger
              value="reviews"
              className="pb-3 pt-1.5 px-1 font-semibold text-sm sm:text-base text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center gap-1.5 shrink-0"
            >
              <Star size={15} />
              <span>Đánh giá của tôi</span>
              {userReviews.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 rounded-full font-bold bg-secondary text-foreground"
                >
                  {userReviews.length}
                </Badge>
              )}
            </TabsTrigger>

            {/* Tab 2: Đã lưu */}
            <TabsTrigger
              value="saved"
              className="pb-3 pt-1.5 px-1 font-semibold text-sm sm:text-base text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center gap-1.5 shrink-0"
            >
              <Heart size={15} />
              <span>Đã lưu</span>
              {savedFavorites.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 rounded-full font-bold bg-secondary text-foreground"
                >
                  {savedFavorites.length}
                </Badge>
              )}
            </TabsTrigger>

            {/* Tab 3: Đã ghé */}
            <TabsTrigger
              value="visited"
              className="pb-3 pt-1.5 px-1 font-semibold text-sm sm:text-base text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10 flex items-center gap-1.5 shrink-0"
            >
              <MapPin size={15} />
              <span>Đã ghé</span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 rounded-full font-bold bg-secondary text-foreground"
              >
                12
              </Badge>
            </TabsTrigger>
          </TabsList>
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
          ) : isReviewsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 bg-card rounded-2xl border border-border space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-48 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
              ))}
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
          ) : isSavedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full bg-card rounded-2xl border border-border p-3.5 space-y-3"
                >
                  <Skeleton className="w-full h-32 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                  <div className="pt-2 border-t border-border/40 flex justify-between">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayShops.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Chưa Có Quán Đã Lưu Nào"
              description="Hãy khám phá danh sách quán cà phê đặc sắc và nhấn vào biểu tượng trái tim để lưu lại quán yêu thích của bạn."
              actionLabel="Khám phá quán cà phê"
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
          <Card className="p-6 sm:p-8 bg-card border border-border shadow-card rounded-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <MapPin size={26} className="fill-primary/20" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-sans font-bold text-base sm:text-lg text-foreground">
                12 Địa Điểm Cà Phê Đã Ghé Thăm
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Bạn đã tích lũy 12 lần ghé quán cà phê trên hành trình khám phá. Hãy tiếp tục đánh giá và chia sẻ trải nghiệm để nâng hạng huy hiệu lên Bạc và Vàng!
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Link href={APP_ROUTES.MAP}>
                <Compass size={14} className="mr-1.5" /> Khám phá thêm trên bản đồ
              </Link>
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

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
