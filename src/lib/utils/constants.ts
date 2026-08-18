// Default Coordinates: Hanoi City Center
export const DEFAULT_LOCATION = {
  lat: 21.0285,
  lng: 105.8542,
  name: 'Hanoi, Vietnam',
};

export const DEFAULT_SEARCH_RADIUS = 3000; // in meters (3km)

export const APP_ROUTES = {
  HOME: '/',
  MAP: '/map',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
  SHOP_DETAIL: (id: string) => `/shop/${id}`,
};

export const API_ENDPOINTS = {
  NEARBY_SHOPS: '/api/shops/nearby',
  SHOP_DETAILS: '/api/shops/details',
  SEARCH_SHOPS: '/api/shops/search',
  USER_FAVORITES: '/api/user/favorites',
  USER_PROFILE: '/api/user/profile',
};
