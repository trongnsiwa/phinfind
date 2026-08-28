export interface OpeningPeriod {
  open: { day: number; time: string };
  close: { day: number; time: string };
}

export interface OpeningHours {
  open_now: boolean;
  periods?: OpeningPeriod[];
}

export interface CoffeeShop {
  id: string;
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance: number; // in meters
  distance_text: string;
  rating: number; // 0 to 5
  total_ratings: number;
  opening_hours?: OpeningHours;
  price_range?: '₫' | '₫₫' | '₫₫₫' | '₫₫₫₫';
  photos?: string[];
  website?: string;
  phone?: string;
  categories: string[];
  created_by?: string | null;
  verified?: boolean;
}

export interface ShopFilterState {
  openNowOnly: boolean;
  minRating: number;
  sortBy: 'distance' | 'rating' | 'name';
}

export interface GeoapifyFeature {
  type: string;
  properties: {
    place_id: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    lat: number;
    lon: number;
    distance?: number;
    categories?: string[];
    datasource?: {
      raw?: {
        opening_hours?: string;
        phone?: string;
        website?: string;
        rating?: number;
      };
    };
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface GeoapifyPlacesResponse {
  type: string;
  features: GeoapifyFeature[];
}
