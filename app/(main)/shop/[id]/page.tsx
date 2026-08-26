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
    date: '2 days ago',
    comment:
      'Signature traditional phin drip with sweetened condensed milk is outstanding. Quiet second-floor space with fast Wi-Fi and plenty of outlets for remote work.',
  },
  {
    author: 'Thanh Tùng',
    rating: 5,
    date: '1 week ago',
    comment:
      'Cozy, authentic vibes and friendly baristas. Great selection of specialty beans from Da Lat and excellent cold brew.',
  },
  {
    author: 'Elena Rostova',
    rating: 4,
    date: '3 weeks ago',
    comment:
      'Loved the airy ambiance and playlist. Perfect spot for reading or casual meetings. Try the salted egg coffee!',
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
      <Card className="text-center py-12 bg-[#101010]/95 rounded-3xl border border-[#2A2A2A] shadow-xl p-6 max-w-md mx-auto space-y-3 text-white">
        <span className="text-5xl">☕</span>
        <CardTitle className="font-sans text-lg text-white">Coffee Shop Not Found</CardTitle>
        <p className="text-xs text-[#D0D0D0]/80">
          The requested coffee shop details could not be loaded.
        </p>
        <Button variant="default" size="sm" asChild className="bg-amber-gold text-[#101010] hover:bg-amber-gold-hover font-bold rounded-xl text-xs">
          <Link href="/">
            <ArrowLeft size={14} className="mr-1" /> Back to Discover
          </Link>
        </Button>
      </Card>
    );
  }

  const isFav = favorites.includes(shop.place_id);
  const isOpen = shop.opening_hours?.open_now ?? true;

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      toast('Sign in required', {
        description: 'Sign in to start saving your favorite spots and share your coffee experiences.',
        action: {
          label: 'Sign in',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    if (isFav) {
      setShowUnsaveDialog(true);
    } else {
      toggleFavorite(shop.place_id);
      toast.success('Shop saved to favorites!');
    }
  };

  const confirmUnsave = () => {
    toggleFavorite(shop.place_id);
    setShowUnsaveDialog(false);
    toast.info('Shop removed from favorites');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: shop.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleCopyAddress = () => {
    if (shop.address) {
      navigator.clipboard.writeText(shop.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const charCodeSum = shop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const heroImage = shop.photos?.[0] || SAMPLE_IMAGES[charCodeSum % SAMPLE_IMAGES.length];
  const ratingScorePercent = Math.min(Math.round(((shop.rating || 4.5) / 5) * 100), 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-white pb-8">
      {/* Hero Photo Banner with Overlay Actions */}
      <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-[#2A2A2A]/80 bg-[#141414]">
        <img src={heroImage} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/95 via-black/30 to-black/40" />

        {/* Top Overlay Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="bg-[#101010]/80 backdrop-blur-md hover:bg-[#141414] text-white border border-[#2A2A2A]/60 text-xs rounded-xl shadow-md"
          >
            <Link href="/">
              <ArrowLeft size={16} className="mr-1 text-amber-gold" />
              Back
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-[#101010]/80 backdrop-blur-md hover:bg-[#141414] text-[#A0A0A0] hover:text-white border border-[#2A2A2A]/60 h-9 w-9 rounded-full shadow-md"
              aria-label="Share shop"
            >
              <Share2 size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveClick}
              className="bg-[#101010]/80 backdrop-blur-md hover:bg-[#141414] text-[#A0A0A0] hover:text-white border border-[#2A2A2A]/60 h-9 w-9 rounded-full shadow-md"
              aria-label={isFav ? 'Remove favorite' : 'Save favorite'}
            >
              <Heart size={16} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-[#A0A0A0]'} />
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
                  ? 'bg-[#7CAE8E]/30 text-[#A3D9B1] border-[#7CAE8E]/50'
                  : 'bg-[#C97A7A]/30 text-[#E8A5A5] border-[#C97A7A]/50'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', isOpen ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]')} />
              {isOpen ? 'Open Now' : 'Closed'}
            </Badge>
            {shop.price_range && (
              <Badge variant="secondary" className="bg-[#101010]/90 text-amber-gold border border-[#2A2A2A]/60 font-bold text-xs">
                {shop.price_range}
              </Badge>
            )}
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-white drop-shadow-md leading-tight">
            {shop.name}
          </h1>
          <p className="text-xs text-[#D0D0D0]/90 flex items-center gap-1">
            <MapPin size={14} className="text-amber-gold flex-shrink-0" />
            {shop.address}
          </p>
        </div>
      </div>

      {/* Tabbed Navigation Header */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="w-full space-y-4"
      >
        <TabsList className="grid grid-cols-3 bg-[#141414]/80 p-1.5 rounded-2xl border border-[#2A2A2A]/60 h-12 w-full">
          <TabsTrigger
            value="overview"
            className="text-xs font-semibold rounded-xl text-[#D0D0D0] data-[state=active]:bg-amber-gold data-[state=active]:text-[#101010] data-[state=active]:shadow-md transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="text-xs font-semibold rounded-xl text-[#D0D0D0] data-[state=active]:bg-amber-gold data-[state=active]:text-[#101010] data-[state=active]:shadow-md transition-all"
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="amenities"
            className="text-xs font-semibold rounded-xl text-[#D0D0D0] data-[state=active]:bg-amber-gold data-[state=active]:text-[#101010] data-[state=active]:shadow-md transition-all"
          >
            Amenities
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
          {/* Main Info Card */}
          <Card className="bg-[#101010]/95 rounded-3xl p-6 border border-[#2A2A2A] shadow-xl space-y-4">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-sans font-bold text-lg text-white">Rating & Community</CardTitle>
                <p className="text-xs text-[#D0D0D0]/80">Based on Google Places user feedback</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1.5 bg-[#141414] px-3 py-1.5 rounded-2xl border-[#2A2A2A] text-amber-gold font-bold text-sm">
                <Star size={16} className="fill-amber-gold text-amber-gold" />
                {shop.rating.toFixed(1)}
                <span className="text-xs font-normal text-[#A0A0A0]">({shop.total_ratings})</span>
              </Badge>
            </CardHeader>

            <CardContent className="p-0 space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#D0D0D0] font-medium">
                  <span>Customer Satisfaction Score</span>
                  <span className="font-bold text-amber-gold">{ratingScorePercent}%</span>
                </div>
                <Progress value={ratingScorePercent} className="h-2.5 bg-[#101010] border border-[#2A2A2A]" />
              </div>
            </CardContent>
          </Card>

          {/* Shop Information Card */}
          <Card className="bg-[#101010]/95 rounded-3xl p-6 border border-[#2A2A2A] shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-sm text-white">Shop Information</h3>
            <div className="space-y-4 text-xs text-[#D0D0D0]">
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-amber-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Opening Hours</p>
                  <p className="text-[#D0D0D0]/80 mt-0.5">Everyday: 07:00 AM – 10:30 PM</p>
                </div>
              </div>

              {shop.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-amber-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Phone</p>
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
                    <p className="font-bold text-white">Website</p>
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
          <Card className="bg-[#101010]/95 rounded-3xl p-6 border border-[#2A2A2A] shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-sm text-white">Physical Location</h3>
                <p className="text-sm font-semibold text-[#D0D0D0]">{shop.address}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyAddress}
                aria-label="Copy address"
                className="h-8 w-8 rounded-xl bg-[#141414] text-[#D0D0D0] hover:text-amber-gold border border-[#2A2A2A]/60 flex-shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A2A2A]/40 text-xs">
              <div className="bg-[#141414]/50 p-2.5 rounded-xl border border-[#2A2A2A]/40 flex items-center gap-2">
                <Footprints size={15} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-[#A0A0A0] block">Distance</span>
                  <span className="font-bold text-white text-xs">{shop.distance_text || 'Nearby'}</span>
                </div>
              </div>

              <div className="bg-[#141414]/50 p-2.5 rounded-xl border border-[#2A2A2A]/40 flex items-center gap-2">
                <Compass size={15} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-[#A0A0A0] block">Coordinates</span>
                  <span className="font-bold text-white text-xs">
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
              <Button className="w-full h-11 bg-amber-gold text-[#101010] hover:bg-amber-gold-hover font-bold text-xs rounded-xl shadow-lg shadow-amber-gold/15 transition-all">
                <Navigation size={14} className="mr-2" />
                Get Instant Directions via Google Maps
              </Button>
            </a>
          </Card>
        </TabsContent>

        {/* Tab 2: Reviews */}
        <TabsContent value="reviews" className="space-y-4 focus-visible:outline-none">
          <Card className="bg-[#101010]/95 rounded-3xl p-6 border border-[#2A2A2A] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:text-left flex flex-col items-center sm:items-start min-w-[100px]">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {shop.rating.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5 text-amber-gold my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= Math.round(shop.rating) ? 'fill-amber-gold text-amber-gold' : 'text-[#2A2A2A]'}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-[#A0A0A0]">{shop.total_ratings} Google Reviews</span>
              </div>

              <div className="flex-1 w-full space-y-1 text-[11px] text-[#D0D0D0]">
                {[
                  { star: 5, pct: 82 },
                  { star: 4, pct: 12 },
                  { star: 3, pct: 4 },
                  { star: 2, pct: 1 },
                  { star: 1, pct: 1 },
                ].map((bar) => (
                  <div key={bar.star} className="flex items-center gap-2">
                    <span className="w-3 text-right text-[10px] text-[#A0A0A0]">{bar.star}</span>
                    <div className="flex-1 h-1.5 bg-[#141414] rounded-full overflow-hidden border border-[#2A2A2A]/40">
                      <div
                        className="h-full bg-amber-gold rounded-full"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-[10px] text-[#A0A0A0]">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#2A2A2A]/40">
              <span className="text-[11px] font-bold text-[#D0D0D0]/70 uppercase tracking-wider block">
                Community Highlights
              </span>
              {MOCK_REVIEWS.map((rev, idx) => (
                <div
                  key={idx}
                  className="bg-[#141414]/40 p-3.5 rounded-2xl border border-[#2A2A2A]/50 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{rev.author}</span>
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-[#A0A0A0]">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-gold">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={10} className="fill-amber-gold text-amber-gold" />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#D0D0D0]/90 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Amenities */}
        <TabsContent value="amenities" className="space-y-4 focus-visible:outline-none">
          <Card className="bg-[#101010]/95 rounded-3xl p-6 border border-[#2A2A2A] shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-sm text-white">Amenities & Atmosphere</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 bg-[#141414]/50 p-3 rounded-2xl border border-[#2A2A2A]/50">
                <Wifi size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">High-Speed Wi-Fi</span>
                  <span className="text-[11px] text-[#D0D0D0]/70">Fast connection for remote work</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#141414]/50 p-3 rounded-2xl border border-[#2A2A2A]/50">
                <Zap size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Power Outlets</span>
                  <span className="text-[11px] text-[#D0D0D0]/70">Available at most tables</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#141414]/50 p-3 rounded-2xl border border-[#2A2A2A]/50">
                <Wind size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Air Conditioned</span>
                  <span className="text-[11px] text-[#D0D0D0]/70">Cool and comfortable indoors</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#141414]/50 p-3 rounded-2xl border border-[#2A2A2A]/50">
                <Sun size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Outdoor Seating</span>
                  <span className="text-[11px] text-[#D0D0D0]/70">Airy balcony and street view</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#141414]/50 p-3 rounded-2xl border border-[#2A2A2A]/50">
                <Coffee size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Specialty Phin & Drip</span>
                  <span className="text-[11px] text-[#D0D0D0]/70">Single-origin Robusta & Arabica</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#141414]/50 p-3 rounded-2xl border border-[#2A2A2A]/50">
                <CupSoda size={16} className="text-amber-gold flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Artisan Beverages</span>
                  <span className="text-[11px] text-[#D0D0D0]/70">Egg coffee, matcha & cold brew</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unsave Confirmation Modal */}
      <AlertDialog open={showUnsaveDialog} onOpenChange={setShowUnsaveDialog}>
        <AlertDialogContent className="bg-[#101010] border border-[#2A2A2A] rounded-2xl text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-white">Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#D0D0D0]/80">
              Are you sure you want to remove &quot;{shop.name}&quot; from your saved coffee shops?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2A2A2A] bg-[#141414] text-white text-xs rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnsave} className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
