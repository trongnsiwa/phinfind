import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FeedClient } from './FeedClient';

export const metadata: Metadata = {
  title: 'Bảng tin hoạt động | PhinFind',
  description: 'Cập nhật đánh giá và hành trình khám phá cà phê từ những người bạn theo dõi trên PhinFind.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/feed');
  }

  return <FeedClient />;
}
