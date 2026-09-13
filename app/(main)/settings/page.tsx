import type { Metadata } from 'next';
import { SettingsClient } from './SettingsClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

export const metadata: Metadata = {
  title: 'Cài Đặt - PhinFind',
  description: 'Tùy chỉnh giao diện, vị trí GPS, chủ đề sáng tối và quản lý tài khoản PhinFind của bạn.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${BASE_URL}/settings`,
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
