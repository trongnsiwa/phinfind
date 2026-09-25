export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  website_url?: string | null;
  email: string | null;
  role?: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  social_stats?: SocialStats;
}

export interface SocialStats {
  followers: number;
  following: number;
  is_following: boolean;
}

export interface SavedShop {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  address: string | null;
  created_at: string;
}
