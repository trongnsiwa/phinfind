import type { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

export const metadata: Metadata = {
  title: 'Hồ sơ của tôi - PhinFind',
  description: 'Quản lý hồ sơ, đánh giá, quán đã lưu và huy hiệu của bạn trên PhinFind.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${BASE_URL}/profile`,
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
