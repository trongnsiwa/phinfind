import type { Metadata } from 'next';
import { FollowListClient } from '@/components/profile/FollowListClient';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} đang theo dõi | PhinFind`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function FollowingPage({ params }: PageProps) {
  const { username } = await params;
  return <FollowListClient username={username} type="following" />;
}
