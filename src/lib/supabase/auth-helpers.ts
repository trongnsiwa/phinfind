import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types/user';

export async function requireAdmin(): Promise<{ user: User; profile: UserProfile } | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return null;
    }

    return { user, profile };
  } catch (error) {
    console.error('Error verifying admin authorization:', error);
    return null;
  }
}
