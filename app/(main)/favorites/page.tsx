'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { FavoriteShopCard } from '@/components/shop/FavoriteShopCard';
import dynamic from 'next/dynamic';

const ShopDrawer = dynamic(
  () => import('@/components/shop/ShopDrawer').then((mod) => mod.ShopDrawer),
  { ssr: false, loading: () => null }
);
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useToggleFavorite, useUserFavorites } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { API_ENDPOINTS, APP_ROUTES, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

export default function FavoritesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const { lat, lng } = useLocation();

  const { favorites, selectedShop, setSelectedShop } = useShopStore();
  const { toggleFavorite } = useToggleFavorite();

  const [shopToRemove, setShopToRemove] = useState<CoffeeShop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch saved shops list from /api/user/favorites
  const {
    data: savedFavorites = [],
    isLoading: isFavoritesLoading,
    isError: isFavoritesError,
  } = useUserFavorites();

  // 2. Batch fetch full shop details in parallel using useQueries
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
        } catch (err: any) {
          // If shop not found in shops table (404), return null to use fallback data
          return null;
        }
      },
      staleTime: 5 * 60 * 1000,
      enabled: Boolean(fav.place_id),
    })),
  });

  const isDetailsLoading =
    savedFavorites.length > 0 && shopQueries.some((q) => q.isLoading);

  const isLoading =
    isAuthLoading ||
    (isAuthenticated && isFavoritesLoading) ||
    isDetailsLoading;

  // Build combined shop list with fallback data for any missing details
  const displayShops: { shop: CoffeeShop; isMissingDetails: boolean }[] = useMemo(() => {
    return savedFavorites.map((fav, index) => {
      const detail = shopQueries[index]?.data;
      if (detail) {
        return { shop: detail, isMissingDetails: false };
      }

      // Fallback data when shop is in saved_shops but not in shops table
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

  const handleConfirmRemove = async () => {
    if (!shopToRemove) return;
    const target = shopToRemove;
    setIsDeleting(true);
    try {
      await toggleFavorite(target.place_id, target);
    } finally {
      setIsDeleting(false);
      setShopToRemove(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-foreground flex items-center gap-2.5 tracking-tight">
            <Heart size={24} className="text-rose-500 fill-rose-500 animate-pulse" />
            Quán Cà Phê Đã Lưu
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Lưu lại các địa điểm cà phê yêu thích để dễ dàng xem lại mọi lúc mọi nơi
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold text-xs px-3 py-1"
        >
          {isLoading ? '...' : `${savedFavorites.length} đã lưu`}
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
              className="w-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 p-3 sm:p-3.5 space-y-3"
            >
              <Skeleton className="w-full h-32 sm:h-36 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <div className="pt-2 border-t border-border/40 flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-xl" />
                <Skeleton className="h-8 flex-1 rounded-xl" />
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
      ) : displayShops.length === 0 ? (
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
          {displayShops.map(({ shop, isMissingDetails }) => (
            <FavoriteShopCard
              key={shop.id || shop.place_id}
              shop={shop}
              isFavorite={favorites.includes(shop.place_id)}
              isMissingDetails={isMissingDetails}
              onToggleFavorite={(placeId) => toggleFavorite(placeId, shop)}
              onRequestRemove={(shopToRemove) => setShopToRemove(shopToRemove)}
              onSelect={(selected) => setSelectedShop(selected)}
            />
          ))}
        </div>
      )}

      {/* Remove Confirmation Alert Dialog */}
      <AlertDialog
        open={!!shopToRemove}
        onOpenChange={(open) => !open && setShopToRemove(null)}
      >
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

      {/* Shop Drawer Detail */}
      <ShopDrawer
        shop={selectedShop}
        isOpen={Boolean(selectedShop)}
        onClose={() => setSelectedShop(null)}
        onToggleFavorite={(placeId) => toggleFavorite(placeId, selectedShop || undefined)}
        isFavorite={selectedShop ? favorites.includes(selectedShop.place_id) : false}
      />
    </div>
  );
}
