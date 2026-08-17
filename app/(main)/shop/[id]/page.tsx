'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Globe, Heart, MapPin, Navigation, Phone, Star } from 'lucide-react';
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
    return <LoadingSpinner text="Fetching shop details..." className="h-64" />;
  }

  if (error || !shop) {
    return (
      <Card className="text-center py-12 bg-white rounded-2xl border border-phin-200 shadow-sm p-6 max-w-md mx-auto space-y-3">
        <span className="text-4xl">☕</span>
        <CardTitle className="font-display text-lg text-phin-900">Coffee Shop Not Found</CardTitle>
        <p className="text-xs text-phin-600">
          The requested coffee shop details could not be loaded.
        </p>
        <Button variant="default" size="sm" asChild className="bg-phin-800 text-white">
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation & Save Toggle */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-phin-700 hover:bg-phin-100">
          <Link href="/">
            <ArrowLeft size={16} />
            Back to Map
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveClick}
          className={cn(
            'gap-1.5 text-xs border-phin-200',
            isFav ? 'text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-100' : 'text-phin-800 hover:bg-phin-50'
          )}
        >
          <Heart size={14} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
          {isFav ? 'Saved' : 'Save'}
        </Button>
      </div>

      {/* Header Info Card */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-4">
        <CardHeader className="p-0 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                    isOpen
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  )}
                >
                  {isOpen ? '🟢 Open Now' : '🔴 Closed'}
                </Badge>
                {shop.price_range && (
                  <Badge variant="secondary" className="bg-phin-100 text-phin-700 font-medium text-xs">
                    {shop.price_range}
                  </Badge>
                )}
              </div>
              <CardTitle className="font-display font-bold text-2xl text-phin-900">{shop.name}</CardTitle>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-2xl border-amber-200 text-amber-800">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-sm">{shop.rating.toFixed(1)}</span>
              <span className="text-xs text-amber-700">({shop.total_ratings})</span>
            </Badge>
          </div>

          <p className="text-xs text-phin-700 flex items-center gap-1.5">
            <MapPin size={16} className="text-primary flex-shrink-0" />
            {shop.address}
          </p>
        </CardHeader>

        {/* Rating Progress Visual */}
        <CardContent className="p-0 space-y-3 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-phin-700">
              <span>Customer Satisfaction Score</span>
              <span className="font-semibold">{Math.round((shop.rating / 5) * 100)}%</span>
            </div>
            <Progress value={(shop.rating / 5) * 100} className="h-2 bg-phin-100" />
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default" className="w-full h-11 text-sm font-semibold bg-phin-800 text-white hover:bg-phin-900">
                <Navigation size={16} className="mr-2" /> Get Directions
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details Card */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-4">
        <h3 className="font-display font-bold text-sm text-phin-900">
          Shop Information
        </h3>
        <Separator className="bg-phin-100" />

        <div className="space-y-4 text-xs text-phin-800">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-phin-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Opening Hours</p>
              <p className="text-phin-600 mt-0.5">Everyday: 07:00 AM - 10:00 PM</p>
            </div>
          </div>

          {shop.phone && (
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-phin-500 flex-shrink-0" />
              <div>
                <p className="font-semibold">Phone</p>
                <a href={`tel:${shop.phone}`} className="text-primary hover:underline">
                  {shop.phone}
                </a>
              </div>
            </div>
          )}

          {shop.website && (
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-phin-500 flex-shrink-0" />
              <div>
                <p className="font-semibold">Website</p>
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate block max-w-xs"
                >
                  {shop.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Unsave Confirmation Alert Dialog */}
      <AlertDialog open={showUnsaveDialog} onOpenChange={setShowUnsaveDialog}>
        <AlertDialogContent className="bg-white border-phin-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-phin-900">Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-phin-600">
              Are you sure you want to remove &quot;{shop.name}&quot; from your saved coffee shops?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-phin-200 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnsave} className="bg-rose-600 text-white hover:bg-rose-700 text-xs">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
