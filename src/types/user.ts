export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedShop {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  address: string | null;
  created_at: string;
}
