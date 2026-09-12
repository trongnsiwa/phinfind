import type { Metadata } from 'next';
import { fetchPublicProfileForServer } from '@/lib/supabase/profile-detail';
import { PublicProfileClient } from './PublicProfileClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfileForServer(username);

  if (!profile) {
    return {
      title: 'Không tìm thấy người dùng | PhinFind',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name = profile.full_name || profile.username;
  const title = `${name} (@${profile.username}) - PhinFind`;
  const description = profile.bio
    ? profile.bio.slice(0, 155)
    : `Xem đánh giá cà phê và hoạt động của ${name} trên PhinFind.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/u/${profile.username}`,
    },
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `${BASE_URL}/u/${profile.username}`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default function PublicProfilePage() {
  return <PublicProfileClient />;
}
