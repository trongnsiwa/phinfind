'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Globe, Heart, MapPin, Navigation, Phone, Star } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useShopDetails } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: shop, isLoading, error } = useShopDetails(resolvedParams.id);
  const { favorites, toggleFavorite } = useShopStore();

  if (isLoading) {
    return <LoadingSpinner text="Fetching shop details..." className="h-64" />;
  }

  if (error || !shop) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-phin-200 shadow-sm p-6">
        <span className="text-4xl">☕</span>
        <h3 className="text-lg font-bold text-phin-900 mt-2">Coffee Shop Not Found</h3>
        <p className="text-xs text-phin-600 mt-1 mb-4">
          The requested coffee shop details could not be loaded.
        </p>
        <Link href="/">
          <Button variant="primary" size="sm">
            <ArrowLeft size={14} /> Back to Discover
          </Button>
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(shop.place_id);
  const isOpen = shop.opening_hours?.open_now ?? true;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-phin-700">
            <ArrowLeft size={16} />
            Back to Map
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleFavorite(shop.place_id)}
          className={`gap-1.5 text-xs ${isFav ? 'text-rose-500 border-rose-200' : ''}`}
        >
          <Heart size={14} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
          {isFav ? 'Saved' : 'Save'}
        </Button>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isOpen ? '🟢 Open Now' : '🔴 Closed'}
              </span>
              {shop.price_range && (
                <span className="text-xs text-phin-600 font-medium">{shop.price_range}</span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl text-phin-900">{shop.name}</h1>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200 text-amber-800">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span className="font-bold text-sm">{shop.rating.toFixed(1)}</span>
            <span className="text-xs text-amber-700">({shop.total_ratings})</span>
          </div>
        </div>

        <p className="text-xs text-phin-700 flex items-center gap-1.5">
          <MapPin size={16} className="text-primary flex-shrink-0" />
          {shop.address}
        </p>

        {/* Primary Action */}
        <div className="pt-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" className="w-full h-11 text-sm font-semibold">
              <Navigation size={16} /> Get Directions
            </Button>
          </a>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-4">
        <h3 className="font-bold text-sm text-phin-900 border-b border-phin-100 pb-2">
          Shop Information
        </h3>

        <div className="space-y-3 text-xs text-phin-800">
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
      </div>
    </div>
  );
}
