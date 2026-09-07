'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
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
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useShopStore } from '@/stores/useShopStore';
import { createClient } from '@/lib/supabase/client';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';
import { API_ENDPOINTS, APP_ROUTES, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

interface SavedShopItem {
  id: string;
  place_id: string;
  name: string;
  address?: string;
  created_at?: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();
  const { lat, lng } = useLocation();
  const { setFavorites, toggleFavorite } = useShopStore();
  const supabase = useMemo(() => createClient(), []);

  const [shopToRemove, setShopToRemove] = useState<CoffeeShop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch saved shops directly from /api/user/favorites
  const {
    data: savedFavorites = [],
    isLoading: isFavoritesLoading,
    isError: isFavoritesError,
  } = useQuery<SavedShopItem[]>({
    queryKey: ['user', 'favorites', user?.id],
    queryFn: async () => {
      try {
        const response = await axios.get<{ favorites: SavedShopItem[] }>(
          API_ENDPOINTS.USER_FAVORITES
        );
        return response.data.favorites || [];
      } catch (err: any) {
        if (err?.response?.status === 401) {
          return [];
        }
        throw err;
      }
    },
    enabled: !isAuthLoading && isAuthenticated,
    staleTime: 30 * 1000,
  });

  // Keep Zustand store in sync with server-side saved places
  useEffect(() => {
    if (savedFavorites) {
      setFavorites(savedFavorites.map((f) => f.place_id));
    }
  }, [savedFavorites, setFavorites]);

  // Extract place_ids for batch shop details lookup
  const placeIds = useMemo(
    () => Array.from(new Set(savedFavorites.map((f) => f.place_id).filter(Boolean))),
    [savedFavorites]
  );

  // 2. Batch fetch full shop details from `shops` table
  const {
    data: favoriteShops = [],
    isLoading: isShopsLoading,
  } = useQuery<CoffeeShop[]>({
    queryKey: ['shops', 'favorites-details', placeIds, lat, lng],
    queryFn: async () => {
      if (placeIds.length === 0) return [];

      const { data: dbRows, error } = await supabase
        .from('shops')
        .select('*')
        .in('place_id', placeIds);

      if (error) {
        console.error('Lỗi khi truy vấn thông tin quán đã lưu:', error);
      }

      const rowMap = new Map<string, any>();
      (dbRows || []).forEach((row) => {
        rowMap.set(row.place_id, row);
      });

      // Maintain order of saved favorites and handle fallback for missing shops
      return savedFavorites.map((fav) => {
        const row = rowMap.get(fav.place_id);
        if (row) {
          return mapDbShopToCoffeeShop(row, lat, lng);
        }

        // Fallback data when shop is in saved_shops but not in local shops table
        return {
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
        } as CoffeeShop;
      });
    },
    enabled: placeIds.length > 0,
    staleTime: 60 * 1000,
  });

  const isLoading =
    isAuthLoading ||
    (isAuthenticated && isFavoritesLoading) ||
    (placeIds.length > 0 && isShopsLoading);

  const handleConfirmRemove = async () => {
    if (!shopToRemove) return;
    const targetPlaceId = shopToRemove.place_id || shopToRemove.id;
    const targetName = shopToRemove.name;

    setIsDeleting(true);
    try {
      if (isAuthenticated) {
        await axios.delete(API_ENDPOINTS.USER_FAVORITES, {
          params: { placeId: targetPlaceId },
        });
      }
      toggleFavorite(targetPlaceId);
      await queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      toast.info(`Đã xóa "${targetName}" khỏi danh sách yêu thích`);
    } catch (error) {
      console.error('Lỗi khi xóa quán khỏi danh sách yêu thích:', error);
      toast.error('Không thể xóa khỏi danh sách yêu thích. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
      setShopToRemove(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h2 className="font-sans font-bold text-2xl text-foreground flex items-center gap-2.5">
            <Heart size={22} className="text-rose-500 fill-rose-500 animate-pulse" />
            Quán Cà Phê Đã Lưu
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Lưu lại các địa điểm cà phê yêu thích để dễ dàng xem lại mọi lúc
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold text-xs px-3 py-1"
        >
          {isLoading ? '...' : `${favoriteShops.length} đã lưu`}
        </Badge>
      </div>

      {/* Unauthenticated State */}
      {!isAuthLoading && !isAuthenticated ? (
        <EmptyState
          icon={Heart}
          title="Đăng Nhập Để Xem Quán Đã Lưu"
          description="Vui lòng đăng nhập tài khoản để đồng bộ và quản lý danh sách các quán cà phê yêu thích của bạn."
          actionLabel="Đăng nhập ngay"
          onAction={() => router.push(APP_ROUTES.LOGIN)}
          className="py-16"
        />
      ) : isLoading ? (
        /* Loading Skeletons Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-card border border-border/60 rounded-2xl space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton className="h-3.5 w-1/2 rounded-md" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-border/40">
                <Skeleton className="h-5 w-24 rounded-md" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-7 w-20 rounded-lg" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isFavoritesError ? (
        <EmptyState
          icon={Heart}
          title="Không thể tải danh sách yêu thích"
          description="Đã xảy ra lỗi khi tải dữ liệu từ máy chủ. Vui lòng thử lại sau."
          actionLabel="Tải lại"
          onAction={() => queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] })}
          className="py-16"
        />
      ) : favoriteShops.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Chưa Có Quán Yêu Thích Nào"
          description="Nhấn vào biểu tượng trái tim trên bất kỳ thẻ quán cà phê nào để lưu lại danh sách riêng của bạn."
          actionLabel="Khám phá quán cà phê"
          onAction={() => router.push(APP_ROUTES.HOME)}
          className="py-16"
        />
      ) : (
        /* Favorite Shops Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteShops.map((shop) => (
            <Card
              key={shop.id || shop.place_id}
              className="p-4 bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 rounded-2xl flex flex-col justify-between"
            >
              <CardHeader className="p-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-sans font-bold text-base text-foreground line-clamp-1">
                    {shop.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShopToRemove(shop)}
                    className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full flex-shrink-0 cursor-pointer"
                    aria-label="Xóa khỏi yêu thích"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {shop.address || 'Chưa có địa chỉ'}
                </p>
              </CardHeader>

              <CardContent className="p-0 pt-4 flex items-center justify-between text-xs border-t border-border/60 mt-3">
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-[11px]"
                >
                  ⭐ {typeof shop.rating === 'number' && shop.rating > 0 ? shop.rating.toFixed(1) : 'Mới'} · {shop.distance_text || 'Đã lưu'}
                </Badge>

                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[11px] border-border rounded-lg cursor-pointer"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation size={11} className="mr-1 text-primary" />
                      Chỉ đường
                    </a>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground rounded-lg font-semibold cursor-pointer"
                    asChild
                  >
                    <Link href={APP_ROUTES.SHOP_DETAIL(shop.place_id || shop.id)}>
                      Xem
                      <ExternalLink size={10} className="ml-1 opacity-70" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Remove Confirmation Alert Dialog */}
      <AlertDialog open={!!shopToRemove} onOpenChange={(open) => !open && setShopToRemove(null)}>
        <AlertDialogContent className="bg-card border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-foreground">
              Xóa khỏi danh sách yêu thích?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn xóa &quot;{shopToRemove?.name}&quot; khỏi danh sách yêu thích không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-border text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleConfirmRemove}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={12} className="mr-1 animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
