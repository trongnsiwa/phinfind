'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Globe,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Star,
  Wifi,
  Zap,
  Wind,
  Sun,
  Coffee,
  Share2,
  Sparkles,
  CupSoda,
  CreditCard,
  Utensils,
  Copy,
  Check,
  CheckCircle2,
  Compass,
  Footprints,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { DetailSkeleton } from '@/components/common/LoadingSkeleton';
import { useShopDetails } from '@/hooks/useShops';
import { useAuth } from '@/hooks/useAuth';
import { useShopStore } from '@/stores/useShopStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
];

const MOCK_REVIEWS = [
  {
    author: 'Minh Anh',
    rating: 5,
    date: '2 ngày trước',
    comment:
      'Cà phê phin truyền thống với sữa đặc của quán rất ngon và đậm đà. Tầng 2 yên tĩnh, Wi-Fi nhanh và nhiều ổ cắm tiện làm việc.',
  },
  {
    author: 'Thanh Tùng',
    rating: 5,
    date: '1 tuần trước',
    comment:
      'Không gian ấm cúng, barista thân thiện. Nhiều loại hạt đặc sản Đà Lạt chất lượng và cold brew thơm ngon.',
  },
  {
    author: 'Elena Rostova',
    rating: 4,
    date: '3 tuần trước',
    comment:
      'Rất thích không gian thoáng đãng và playlist nhạc của quán. Rất thích hợp để đọc sách hoặc trò chuyện nhẹ nhàng. Nên thử cà phê trứng!',
  },
];

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: shop, isLoading, error } = useShopDetails(resolvedParams.id);
  const { favorites, toggleFavorite } = useShopStore();
  const [showUnsaveDialog, setShowUnsaveDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'amenities'>('overview');

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !shop) {
    return (
      <Card className="text-center py-12 bg-card rounded-3xl border border-border shadow-xl p-6 max-w-md mx-auto space-y-3 text-foreground">
        <span className="text-5xl">☕</span>
        <CardTitle className="font-sans text-lg text-foreground">Không Tìm Thấy Quán Cà Phê</CardTitle>
        <p className="text-xs text-muted-foreground">
          Không thể tải thông tin chi tiết của quán cà phê này.
        </p>
        <Button variant="default" size="sm" asChild className="bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold rounded-xl text-xs">
          <Link href="/">
            <ArrowLeft size={14} className="mr-1" /> Quay lại Khám phá
          </Link>
        </Button>
      </Card>
    );
  }

  const isFav = favorites.includes(shop.place_id);
  const isOpen = shop.opening_hours?.open_now ?? true;

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      toast('Yêu cầu đăng nhập', {
        description: 'Đăng nhập để bắt đầu lưu lại các quán yêu thích và chia sẻ trải nghiệm cà phê của bạn.',
        action: {
          label: 'Đăng nhập',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    if (isFav) {
      setShowUnsaveDialog(true);
    } else {
      toggleFavorite(shop.place_id);
      toast.success('Đã lưu quán vào danh sách yêu thích!');
    }
  };

  const confirmUnsave = () => {
    toggleFavorite(shop.place_id);
    setShowUnsaveDialog(false);
    toast.info('Đã xóa quán khỏi danh sách yêu thích');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: shop.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  const handleCopyAddress = () => {
    if (shop.address) {
      navigator.clipboard.writeText(shop.address);
      setCopied(true);
      toast.success('Đã sao chép địa chỉ vào bộ nhớ tạm');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const charCodeSum = shop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const heroImage = shop.photos?.[0] || SAMPLE_IMAGES[charCodeSum % SAMPLE_IMAGES.length];
  const ratingScorePercent = Math.min(Math.round(((shop.rating || 4.5) / 5) * 100), 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-foreground pb-8">
      {/* Hero Photo Banner with Overlay Actions */}
      <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-border/80 bg-secondary">
        <img src={heroImage} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

        {/* Top Overlay Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="bg-card/80 backdrop-blur-md hover:bg-secondary text-foreground border border-border/60 text-xs rounded-xl shadow-md"
          >
            <Link href="/">
              <ArrowLeft size={16} className="mr-1 text-amber-gold" />
              Quay lại
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-card/80 backdrop-blur-md hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 h-9 w-9 rounded-full shadow-md"
              aria-label="Chia sẻ quán cà phê"
            >
              <Share2 size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveClick}
              className="bg-card/80 backdrop-blur-md hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 h-9 w-9 rounded-full shadow-md"
              aria-label={isFav ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart size={16} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'} />
            </Button>
          </div>
        </div>

        {/* Bottom Hero Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-sm',
                isOpen
                  ? 'bg-teal/20 text-teal border-teal/40'
                  : 'bg-[#C97A7A]/30 text-[#E8A5A5] border-[#C97A7A]/50'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', isOpen ? 'bg-teal animate-pulse' : 'bg-[#C97A7A]')} />
              {isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
            </Badge>
            {shop.price_range && (
              <Badge variant="secondary" className="bg-card/90 text-amber-gold border border-border/60 font-bold text-xs">
                {shop.price_range}
              </Badge>
            )}
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-white drop-shadow-md leading-tight">
            {shop.name}
          </h1>
          <p className="text-xs text-white/90 flex items-center gap-1">
            <MapPin size={14} className="text-amber-gold flex-shrink-0" />
            {shop.address || 'Chưa có địa chỉ'}
          </p>
        </div>
      </div>

      {/* Tabbed Navigation Header */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="w-full space-y-4"
      >
        <TabsList className="grid grid-cols-3 bg-secondary/80 p-1.5 rounded-2xl border border-border/60 h-12 w-full">
          <TabsTrigger
            value="overview"
            className="text-xs font-semibold rounded-xl text-muted-foreground data-[state=active]:bg-amber-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="text-xs font-semibold rounded-xl text-muted-foreground data-[state=active]:bg-amber-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Đánh giá
          </TabsTrigger>
          <TabsTrigger
            value="amenities"
            className="text-xs font-semibold rounded-xl text-muted-foreground data-[state=active]:bg-amber-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Tiện ích
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
          {/* Main Info Card */}
          <Card className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-sans font-bold text-lg text-foreground">Đánh Giá &amp; Cộng Đồng</CardTitle>
                <p className="text-xs text-muted-foreground">Dựa trên phản hồi từ người dùng Google Places</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-2xl border-border text-amber-gold font-bold text-sm">
                <Star size={16} className="fill-amber-gold text-amber-gold" />
                {shop.rating.toFixed(1)}
                <span className="text-xs font-normal text-muted-foreground">({shop.total_ratings})</span>
              </Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Mức Độ Hài Lòng Của Khách Hàng</span>
                  <span className="font-bold text-teal">{ratingScorePercent}%</span>
                </div>
                <Progress
                  value={ratingScorePercent}
                  indicatorClassName="bg-gradient-to-r from-teal to-teal-hover"
                  className="h-2.5 bg-muted border border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shop Information Card */}
          <Card className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-sm text-foreground">Thông Tin Quán</h3>
            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-amber-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Giờ Mở Cửa</p>
                  <p className="text-muted-foreground mt-0.5">Hàng ngày: 07:00 – 22:30</p>
                </div>
              </div>

              {shop.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-amber-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Điện thoại</p>
                    <a href={`tel:${shop.phone}`} className="text-amber-gold font-semibold hover:underline">
                      {shop.phone}
                    </a>
                  </div>
                </div>
              )}

              {shop.website && (
                <div className="flex items-start gap-3">
                  <Globe size={16} className="text-amber-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Website</p>
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-gold font-semibold hover:underline truncate block max-w-xs"
                    >
                      {shop.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Physical Location Card */}
          <Card className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-sm text-foreground">Địa Chỉ Quán</h3>
                <p className="text-sm font-semibold text-muted-foreground">{shop.address || 'Chưa có địa chỉ'}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyAddress}
                aria-label="Sao chép địa chỉ"
                className="h-8 w-8 rounded-xl bg-secondary text-secondary-foreground hover:text-amber-gold border border-border/60 flex-shrink-0"
              >
                {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
              <div className="bg-secondary/50 p-2.5 rounded-xl border border-border/40 flex items-center gap-2">
                <Footprints size={15} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Khoảng cách</span>
                  <span className="font-bold text-foreground text-xs">{shop.distance_text || 'Gần đây'}</span>
                </div>
              </div>

              <div className="bg-secondary/50 p-2.5 rounded-xl border border-border/40 flex items-center gap-2">
                <Compass size={15} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Tọa độ GPS</span>
                  <span className="font-bold text-foreground text-xs">
                    {shop.lat.toFixed(4)}, {shop.lon.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-2"
            >
              <Button className="w-full h-11 bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold text-xs rounded-xl shadow-lg shadow-amber-gold/15 transition-all">
                <Navigation size={14} className="mr-2" />
                Chỉ Đường Trực Tiếp Qua Google Maps
              </Button>
            </a>
          </Card>
        </TabsContent>

        {/* Tab 2: Reviews */}
        <TabsContent value="reviews" className="space-y-4 focus-visible:outline-none">
          <Card className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:flex-col items-center sm:items-start min-w-[100px]">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {shop.rating.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5 text-amber-gold my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= Math.round(shop.rating) ? 'fill-amber-gold text-amber-gold' : 'text-border'}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">{shop.total_ratings} Đánh giá Google</span>
              </div>

              <div className="flex-1 w-full space-y-1 text-[11px] text-muted-foreground">
                {[
                  { star: 5, pct: 82 },
                  { star: 4, pct: 12 },
                  { star: 3, pct: 4 },
                  { star: 2, pct: 1 },
                  { star: 1, pct: 1 },
                ].map((bar) => (
                  <div key={bar.star} className="flex items-center gap-2">
                    <span className="w-3 text-right text-[10px] text-muted-foreground">{bar.star}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden border border-border/40">
                      <div
                        className="h-full bg-amber-gold rounded-full"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-[10px] text-muted-foreground">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/40">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Điểm Nhấn Từ Cộng Đồng
              </span>
              {MOCK_REVIEWS.map((rev, idx) => (
                <div
                  key={idx}
                  className="bg-secondary/40 p-3.5 rounded-2xl border border-border/50 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{rev.author}</span>
                      <CheckCircle2 size={12} className="text-teal" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-gold">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={10} className="fill-amber-gold text-amber-gold" />
                    ))}
                  </div>
                  <p className="text-[11px] text-secondary-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Amenities */}
        <TabsContent value="amenities" className="space-y-4 focus-visible:outline-none">
          <Card className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-sm text-foreground">Tiện Ích &amp; Không Gian</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50">
                <Wifi size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Wi-Fi Tốc Độ Cao</span>
                  <span className="text-[11px] text-muted-foreground">Kết nối nhanh chóng tiện làm việc từ xa</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50">
                <Zap size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Nhiều Ổ Cắm Điện</span>
                  <span className="text-[11px] text-muted-foreground">Có sẵn tại hầu hết các bàn</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50">
                <Wind size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Không Gian Điều Hòa</span>
                  <span className="text-[11px] text-muted-foreground">Mát mẻ và dễ chịu trong nhà</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50">
                <Sun size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Chỗ Ngồi Ngoài Trời</span>
                  <span className="text-[11px] text-muted-foreground">Ban công và góc ngắm phố thoáng mát</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50">
                <Coffee size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Cà Phê Phin &amp; Pha Tay Đặc Sản</span>
                  <span className="text-[11px] text-muted-foreground">Hạt Robusta &amp; Arabica nguyên bản</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50">
                <CupSoda size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Đồ Uống Thủ Công</span>
                  <span className="text-[11px] text-muted-foreground">Cà phê trứng, matcha &amp; cold brew</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unsave Confirmation Modal */}
      <AlertDialog open={showUnsaveDialog} onOpenChange={setShowUnsaveDialog}>
        <AlertDialogContent className="bg-popover border border-border rounded-2xl text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-foreground">Xóa khỏi danh sách yêu thích?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn xóa &quot;{shop.name}&quot; khỏi danh sách quán đã lưu không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-secondary text-foreground text-xs rounded-xl cursor-pointer">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnsave} className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold cursor-pointer">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
