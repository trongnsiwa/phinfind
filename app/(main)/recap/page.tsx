import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RecapClient } from './RecapClient';

export const metadata: Metadata = {
  title: 'Hành trình Cà phê | PhinFind Recap',
  description: 'Tổng kết hành trình khám phá cà phê và thành tích của bạn trên PhinFind.',
};

export default async function RecapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/recap');
  }

  return <RecapClient />;
}
