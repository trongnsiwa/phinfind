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
  SETTINGS: '/settings',
  ADMIN: '/admin',
  SHOP_DETAIL: (id: string) => `/shop/${id}`,
  PUBLIC_PROFILE: (username: string) => `/u/${encodeURIComponent(username)}`,
  FOLLOWERS: (username: string) => `/u/${encodeURIComponent(username)}/followers`,
  FOLLOWING: (username: string) => `/u/${encodeURIComponent(username)}/following`,
  FEED: '/feed',
};

export const API_ENDPOINTS = {
  NEARBY_SHOPS: '/api/shops/nearby',
  SHOP_DETAILS: '/api/shops/details',
  SEARCH_SHOPS: '/api/shops/search',
  CREATE_SHOP: '/api/shops/create',
  UPDATE_SHOP: '/api/shops/update',
  DELETE_SHOP: '/api/shops/delete',
  ADMIN_SHOPS: '/api/admin/shops',
  USER_FAVORITES: '/api/user/favorites',
  USER_VISITS: '/api/user/visits',
  USER_PROFILE: '/api/user/profile',
  PUBLIC_PROFILE: '/api/user/public-profile',
  SUGGEST_EDIT: '/api/shops/suggest-edit',
  ADMIN_SUGGESTIONS: '/api/admin/suggestions',
  FOLLOW: '/api/user/follow',
  FOLLOW_STATUS: '/api/user/follow-status',
  FOLLOWERS: '/api/user/followers',
  FOLLOWING: '/api/user/following',
  FEED: '/api/feed',
};

export interface ReviewTagDefinition {
  id: string;
  label: string;
}

export const REVIEW_TAGS: readonly ReviewTagDefinition[] = [
  { id: 'wifi-manh', label: 'Wi-Fi mạnh' },
  { id: 'yen-tinh', label: 'Yên tĩnh' },
  { id: 'view-dep', label: 'View đẹp' },
  { id: 'mo-khuya', label: 'Mở khuya' },
  { id: 'do-xe', label: 'Có chỗ đỗ xe' },
  { id: 'thu-cung', label: 'Thú cưng' },
  { id: 'lam-viec', label: 'Làm việc' },
  { id: 'hen-ho', label: 'Hẹn hò' },
] as const;

export const REVIEW_TAG_IDS: readonly string[] = REVIEW_TAGS.map((t) => t.id);

export function normalizeReviewTag(tag: string): string | null {
  if (!tag || typeof tag !== 'string') return null;
  const trimmed = tag.trim().toLowerCase();
  const byId = REVIEW_TAGS.find((t) => t.id.toLowerCase() === trimmed);
  if (byId) return byId.id;
  const byLabel = REVIEW_TAGS.find((t) => t.label.toLowerCase() === trimmed);
  if (byLabel) return byLabel.id;
  if (trimmed === 'co-cho-do-xe' || trimmed === 'co cho do xe') return 'do-xe';
  return null;
}

export function getReviewTagLabel(tagIdOrLabel: string): string {
  const norm = normalizeReviewTag(tagIdOrLabel);
  const found = REVIEW_TAGS.find(
    (t) => t.id === norm || t.id === tagIdOrLabel || t.label.toLowerCase() === tagIdOrLabel.toLowerCase()
  );
  return found ? found.label : tagIdOrLabel;
}

