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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
import { useShopStore } from '@/stores/useShopStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: shop, isLoading, error } = useShopDetails(resolvedParams.id);
  const { favorites, toggleFavorite } = useShopStore();
  const [showUnsaveDialog, setShowUnsaveDialog] = useState(false);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !shop) {
    return (
      <Card className="text-center py-12 bg-white rounded-3xl border border-phin-200 shadow-sm p-6 max-w-md mx-auto space-y-3">
        <span className="text-5xl">☕</span>
        <CardTitle className="font-sans text-lg text-phin-900">Coffee Shop Not Found</CardTitle>
        <p className="text-xs text-phin-600">
          The requested coffee shop details could not be loaded.
        </p>
        <Button variant="default" size="sm" asChild className="bg-phin-800 text-white rounded-xl">
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

  const sampleImages = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  ];
  const charCodeSum = shop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const heroImage = shop.photos?.[0] || sampleImages[charCodeSum % sampleImages.length];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Photo Banner with Overlay Actions */}
      <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-card border border-phin-200 bg-phin-900">
        <img src={heroImage} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Top Overlay Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Button variant="ghost" size="sm" asChild className="bg-white/80 backdrop-blur-md hover:bg-white text-phin-900 border border-white/20 text-xs rounded-xl shadow-md">
            <Link href="/">
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/80 backdrop-blur-md hover:bg-white text-phin-900 border border-white/20 h-9 w-9 rounded-full shadow-md"
              aria-label="Share shop"
            >
              <Share2 size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveClick}
              className="bg-white/80 backdrop-blur-md hover:bg-white text-phin-900 border border-white/20 h-9 w-9 rounded-full shadow-md"
              aria-label={isFav ? 'Remove favorite' : 'Save favorite'}
            >
              <Heart size={16} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-phin-800'} />
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
                  ? 'bg-emerald-500/90 text-white border-emerald-400'
                  : 'bg-rose-500/90 text-white border-rose-400'
              )}
            >
              {isOpen ? '🟢 Open Now' : '🔴 Closed'}
            </Badge>
            {shop.price_range && (
              <Badge variant="secondary" className="bg-white/90 text-phin-900 font-bold text-xs">
                {shop.price_range}
              </Badge>
            )}
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-white drop-shadow-md leading-tight">
            {shop.name}
          </h1>
          <p className="text-xs text-phin-100/90 flex items-center gap-1">
            <MapPin size={14} className="text-phin-300 flex-shrink-0" />
            {shop.address}
          </p>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-4">
        <CardHeader className="p-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-sans font-bold text-lg text-phin-900">Rating & Community</CardTitle>
            <p className="text-xs text-phin-600">Based on Google Places user feedback</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border-amber-200 text-amber-800 font-bold text-sm">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            {shop.rating.toFixed(1)}
            <span className="text-xs font-normal text-amber-700">({shop.total_ratings})</span>
          </Badge>
        </CardHeader>

        <CardContent className="p-0 space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-phin-700 font-medium">
              <span>Customer Satisfaction Score</span>
              <span className="font-bold text-phin-900">{Math.round((shop.rating / 5) * 100)}%</span>
            </div>
            <Progress value={(shop.rating / 5) * 100} className="h-2.5 bg-phin-100" />
          </div>

          <Separator className="bg-phin-100" />

          {/* Primary Directions Action */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="default" className="w-full h-12 text-sm font-semibold bg-phin-800 text-white hover:bg-phin-900 rounded-xl shadow-md">
              <Navigation size={16} className="mr-2" /> Get Directions via Google Maps
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Amenities & Vibe */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-3">
        <h3 className="font-sans font-bold text-sm text-phin-900">Amenities & Atmosphere</h3>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Badge variant="secondary" className="bg-phin-50 text-phin-800 border border-phin-200 px-3 py-1.5 rounded-xl font-medium">
            <Wifi size={14} className="mr-1.5 text-primary" /> Free Wi-Fi
          </Badge>
          <Badge variant="secondary" className="bg-phin-50 text-phin-800 border border-phin-200 px-3 py-1.5 rounded-xl font-medium">
            <Zap size={14} className="mr-1.5 text-amber-600" /> Power Outlets
          </Badge>
          <Badge variant="secondary" className="bg-phin-50 text-phin-800 border border-phin-200 px-3 py-1.5 rounded-xl font-medium">
            <Wind size={14} className="mr-1.5 text-blue-500" /> Air Conditioned
          </Badge>
          <Badge variant="secondary" className="bg-phin-50 text-phin-800 border border-phin-200 px-3 py-1.5 rounded-xl font-medium">
            <Sun size={14} className="mr-1.5 text-orange-500" /> Outdoor Seating
          </Badge>
          <Badge variant="secondary" className="bg-phin-50 text-phin-800 border border-phin-200 px-3 py-1.5 rounded-xl font-medium">
            <Coffee size={14} className="mr-1.5 text-phin-700" /> Specialty Drip Coffee
          </Badge>
        </div>
      </Card>

      {/* Additional Shop Details Card */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-4">
        <h3 className="font-sans font-bold text-sm text-phin-900">Shop Information</h3>
        <Separator className="bg-phin-100" />

        <div className="space-y-4 text-xs text-phin-800">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-phin-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-phin-900">Opening Hours</p>
              <p className="text-phin-600 mt-0.5">Everyday: 07:00 AM - 10:00 PM</p>
            </div>
          </div>

          {shop.phone && (
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-phin-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-phin-900">Phone</p>
                <a href={`tel:${shop.phone}`} className="text-primary font-semibold hover:underline">
                  {shop.phone}
                </a>
              </div>
            </div>
          )}

          {shop.website && (
            <div className="flex items-start gap-3">
              <Globe size={16} className="text-phin-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-phin-900">Website</p>
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline truncate block max-w-xs"
                >
                  {shop.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Unsave Confirmation Modal */}
      <AlertDialog open={showUnsaveDialog} onOpenChange={setShowUnsaveDialog}>
        <AlertDialogContent className="bg-white border-phin-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-phin-900">Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-phin-600">
              Are you sure you want to remove &quot;{shop.name}&quot; from your saved coffee shops?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-phin-200 text-xs rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnsave} className="bg-rose-600 text-white hover:bg-rose-700 text-xs rounded-xl font-semibold">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
