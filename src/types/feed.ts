export interface FeedActor {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface FeedShop {
  place_id: string;
  name: string;
  address?: string | null;
  slug?: string | null;
  photo?: string | null;
}

export interface FeedReviewPayload {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  tags?: string[];
}

export interface FeedVisitPayload {
  id: string;
  note?: string | null;
  visited_at: string;
}

export interface ReviewFeedItem {
  id: string;
  type: 'review_created';
  actor: FeedActor;
  shop: FeedShop;
  created_at: string;
  review: FeedReviewPayload;
}

export interface VisitFeedItem {
  id: string;
  type: 'shop_visited';
  actor: FeedActor;
  shop: FeedShop;
  created_at: string;
  visit: FeedVisitPayload;
}

export type FeedItem = ReviewFeedItem | VisitFeedItem;

export interface FeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
  total: number;
}
