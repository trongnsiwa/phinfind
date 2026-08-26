'use client';

import { useState } from 'react';
import { Heart, Trash2, Navigation, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { CoffeeShop } from '@/types/shop';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';

export default function FavoritesPage() {
  const router = useRouter();
  const { lat, lng } = useLocation();
  const { data: shops = [] } = useNearbyShops(lat, lng);
  const { favorites, toggleFavorite } = useShopStore();
  const [shopToRemove, setShopToRemove] = useState<CoffeeShop | null>(null);

  const favoriteShops = shops.filter((s) => favorites.includes(s.place_id));

  const handleConfirmRemove = () => {
    if (shopToRemove) {
      toggleFavorite(shopToRemove.place_id);
      toast.info(`Đã xóa "${shopToRemove.name}" khỏi danh sách yêu thích`);
      setShopToRemove(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-phin-200">
        <div>
          <h2 className="font-sans font-bold text-2xl text-phin-900 flex items-center gap-2.5">
            <Heart size={22} className="text-rose-500 fill-rose-500 animate-pulse" />
            Quán Cà Phê Đã Lưu
          </h2>
          <p className="text-xs text-phin-600 mt-1">
            Lưu lại các địa điểm cà phê yêu thích để dễ dàng xem lại mọi lúc
          </p>
        </div>
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-xs px-3 py-1">
          {favoriteShops.length} đã lưu
        </Badge>
      </div>

      {favoriteShops.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Chưa Có Quán Yêu Thích Nào"
          description="Nhấn vào biểu tượng trái tim trên bất kỳ thẻ quán cà phê nào để lưu lại danh sách riêng của bạn."
          actionLabel="Khám phá quán cà phê"
          onAction={() => router.push(APP_ROUTES.HOME)}
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteShops.map((shop) => (
            <Card
              key={shop.id}
              className="p-4 bg-white border border-phin-100 shadow-card hover:shadow-card-hover transition-all duration-300 rounded-2xl flex flex-col justify-between"
            >
              <CardHeader className="p-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-sans font-bold text-base text-phin-900 line-clamp-1">
                    {shop.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShopToRemove(shop)}
                    className="h-8 w-8 text-phin-400 hover:text-rose-600 hover:bg-rose-50 rounded-full flex-shrink-0 cursor-pointer"
                    aria-label="Xóa khỏi yêu thích"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
                <p className="text-xs text-phin-600 line-clamp-1">{shop.address || 'Chưa có địa chỉ'}</p>
              </CardHeader>

              <CardContent className="p-0 pt-4 flex items-center justify-between text-xs border-t border-phin-50 mt-3">
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-bold text-[11px]">
                  ⭐ {shop.rating.toFixed(1)} · {shop.distance_text || 'Gần đây'}
                </Badge>

                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] border-phin-200 rounded-lg cursor-pointer" asChild>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation size={11} className="mr-1 text-primary" />
                      Chỉ đường
                    </a>
                  </Button>
                  <Button variant="default" size="sm" className="h-7 px-2.5 text-[11px] bg-phin-800 text-white hover:bg-phin-900 rounded-lg font-semibold cursor-pointer" asChild>
                    <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)}>
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
        <AlertDialogContent className="bg-white border-phin-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-phin-900">Xóa khỏi danh sách yêu thích?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-phin-600">
              Bạn có chắc chắn muốn xóa &quot;{shopToRemove?.name}&quot; khỏi danh sách yêu thích không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-phin-200 text-xs rounded-xl cursor-pointer">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold cursor-pointer">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
