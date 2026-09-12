import type { Metadata } from 'next';
import { MapClient } from './MapClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

export const metadata: Metadata = {
  title: 'Bản đồ Quán Cà phê - PhinFind',
  description:
    'Khám phá bản đồ tương tác tìm kiếm quán cà phê gần bạn trên PhinFind. Lọc theo đánh giá, tiện ích, mức giá và khoảng cách để chọn quán phù hợp nhất.',
  alternates: {
    canonical: `${BASE_URL}/map`,
  },
  openGraph: {
    title: 'Bản đồ Quán Cà phê - PhinFind',
    description:
      'Khám phá bản đồ tương tác tìm kiếm quán cà phê gần bạn trên PhinFind. Lọc theo đánh giá, tiện ích, mức giá và khoảng cách để chọn quán phù hợp nhất.',
    url: `${BASE_URL}/map`,
    siteName: 'PhinFind',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bản đồ Quán Cà phê - PhinFind',
    description:
      'Khám phá bản đồ tương tác tìm kiếm quán cà phê gần bạn trên PhinFind. Lọc theo đánh giá, tiện ích, mức giá và khoảng cách để chọn quán phù hợp nhất.',
  },
};

export default function MapPage() {
  return <MapClient />;
}
