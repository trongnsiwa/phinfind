import type { Metadata } from 'next';
import { FollowListClient } from '@/components/profile/FollowListClient';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Người theo dõi của @${username} | PhinFind`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function FollowersPage({ params }: PageProps) {
  const { username } = await params;
  return <FollowListClient username={username} type="followers" />;
}
