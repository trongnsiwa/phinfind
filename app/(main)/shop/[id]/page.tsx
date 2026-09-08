'use client';

import { use, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Coffee, Heart, Loader2, Navigation, RotateCcw, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { DetailSkeleton } from '@/components/common/LoadingSkeleton';
import { useShopDetails, useToggleFavorite, useUserFavorites } from '@/hooks/useShops';
import { ShopDetailsContent } from '@/components/shop/ShopDetailsContent';
import { useShopStore } from '@/stores/useShopStore';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Keep favorites synchronized
  useUserFavorites();
  const { toggleFavorite } = useToggleFavorite();
  const favorites = useShopStore((state) => state.favorites);

  const {
    data: shop,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useShopDetails(resolvedParams.id);

  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Back navigation to home
  const handleBack = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.push('/');
    },
    [router]
  );

  // Favorite toggle with animation
  const handleToggleFav = useCallback(() => {
    if (!shop) return;
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    toggleFavorite(shop.place_id || shop.id, shop);
  }, [shop, toggleFavorite]);

  // Native share or clipboard copy
  const handleShare = useCallback(async () => {
    if (!shop || typeof window === 'undefined') return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          text: `Khám phá quán cà phê ${shop.name} trên PhinFind`,
          url,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!');
    } catch {
      toast.error('Không thể sao chép liên kết.');
    }
  }, [shop]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !shop) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Card className="text-center py-10 px-6 sm:px-8 bg-card rounded-3xl border border-border/80 shadow-card max-w-md w-full space-y-5 text-foreground">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-gold flex items-center justify-center mx-auto shadow-xs">
            <Coffee size={32} />
          </div>

          <div className="space-y-2">
            <CardTitle className="font-sans font-bold text-lg sm:text-xl text-foreground">
              Không Tìm Thấy Quán Cà Phê
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Không thể tải thông tin chi tiết của quán cà phê này. Quán có thể không tồn tại hoặc đã xảy ra sự cố mạng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex-1 h-10 border-border hover:bg-secondary rounded-xl text-xs font-semibold cursor-pointer"
            >
              {isFetching ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin text-amber-gold" />
                  <span>Đang tải lại...</span>
                </>
              ) : (
                <>
                  <RotateCcw size={14} className="mr-1.5 text-amber-gold" />
                  <span>Thử lại</span>
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              asChild
              className="flex-1 h-10 bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              <Link href="/" onClick={handleBack}>
                <ChevronLeft size={14} className="mr-1" />
                <span>Quay lại</span>
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isFav = favorites.includes(shop.place_id || shop.id);

  const directionsUrl =
    shop.lat && shop.lon && shop.lat !== DEFAULT_LOCATION.lat
      ? `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          shop.address ? `${shop.name}, ${shop.address}` : shop.name
        )}`;

  return (
    <div className="relative min-h-screen text-foreground">
      {/* 1. Main Full-Page Scrolling Container with pb-24 */}
      <div className="max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-24 sm:pb-28">
        <Card className="bg-card text-card-foreground rounded-3xl border border-border/80 shadow-card p-4 sm:p-5">
          <ShopDetailsContent shop={shop} isSidebar={false} isStandalone={true} hideActions={true} />
        </Card>
      </div>

      {/* 2. Fixed Bottom Action Bar (Footer) with 4 Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border px-3 sm:px-4 py-2.5 sm:py-3 shadow-2xl select-none pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl lg:max-w-4xl mx-auto grid grid-cols-4 gap-2 sm:gap-3">
          {/* 1. Back Button */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="Quay lại"
            title="Quay lại"
            className="flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 sm:px-3 rounded-full bg-secondary border border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40 transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
          >
            <ChevronLeft size={16} className="text-amber-gold flex-shrink-0" />
            <span className="hidden sm:inline truncate">Quay lại</span>
          </button>

          {/* 2. Directions Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chỉ đường"
            title="Chỉ đường"
            className="flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 sm:px-3 rounded-full bg-amber-gold text-primary-foreground font-bold hover:bg-amber-gold-hover transition-all text-xs shadow-md group active:scale-95 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
          >
            <Navigation
              size={15}
              className="fill-primary-foreground group-hover:scale-110 transition-transform flex-shrink-0"
            />
            <span className="hidden sm:inline truncate">Chỉ đường</span>
          </a>

          {/* 3. Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFav}
            aria-label={isFav ? 'Đã lưu' : 'Lưu lại'}
            title={isFav ? 'Đã lưu' : 'Lưu lại'}
            className={cn(
              'flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 sm:px-3 rounded-full border transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold',
              isFav
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 hover:bg-rose-500/25'
                : 'bg-secondary border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40'
            )}
          >
            <Heart
              size={15}
              className={cn(
                'transition-all duration-200 flex-shrink-0',
                isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground',
                isHeartAnimating && 'scale-125 animate-heart-beat'
              )}
            />
            <span className="hidden sm:inline truncate">{isFav ? 'Đã lưu' : 'Lưu lại'}</span>
          </button>

          {/* 4. Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Chia sẻ"
            title="Chia sẻ"
            className="flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 sm:px-3 rounded-full bg-secondary border border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40 transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
          >
            <Share2 size={15} className="text-amber-gold flex-shrink-0" />
            <span className="hidden sm:inline truncate">Chia sẻ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
