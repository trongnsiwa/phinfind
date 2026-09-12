import type { Metadata } from 'next';
import { FavoritesClient } from './FavoritesClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

export const metadata: Metadata = {
  title: 'Quán Cà phê Đã Lưu - PhinFind',
  description:
    'Danh sách các quán cà phê yêu thích bạn đã lưu trên PhinFind. Dễ dàng xem lại và tìm đường đến những địa điểm quen thuộc.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${BASE_URL}/favorites`,
  },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
