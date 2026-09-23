import type React from 'react';
import type { CoffeeShop, ShopVideo } from '@/types/shop';

export interface PredefinedCategoryConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  defaultDescription: string;
}

export interface DayConfig {
  day: number;
  name: string;
  short: string;
}

export interface DayScheduleState {
  enabled: boolean;
  open: string;
  close: string;
}

export interface Amenity {
  id: string; // category key or custom ID
  name: string; // display name
  type: 'predefined' | 'custom';
  description: string; // user-editable
}

export type PriceOption = '₫' | '₫₫' | '₫₫₫' | '₫₫₫₫';

export interface OpeningPeriod {
  open: {
    day: number;
    time: string;
  };
  close: {
    day: number;
    time: string;
  };
}

export interface AddShopFormData {
  name: string;
  address: string;
  lat: number;
  lon: number;
  phone?: string;
  website?: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  zalo_url?: string | null;
  price_range?: PriceOption;
  photos: string[];
  videos?: ShopVideo[];
  opening_hours: {
    open_now: boolean;
    periods?: OpeningPeriod[];
  };
}

export interface AddShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newShop: CoffeeShop) => void;
  shop?: CoffeeShop;
}
