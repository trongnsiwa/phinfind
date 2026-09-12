import type { Metadata } from 'next';
import { DiscoverClient } from './DiscoverClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.vercel.app';

export const metadata: Metadata = {
  title: 'PhinFind - Bản đồ Cà phê Việt | Khám phá quán cà phê gần bạn',
  description:
    'Khám phá quán cà phê gần bạn với bản đồ tương tác, đánh giá thực tế từ cộng đồng. Lưu quán yêu thích, tìm đường nhanh chóng và chia sẻ trải nghiệm cà phê.',
  keywords: [
    'quán cà phê',
    'cà phê Việt',
    'bản đồ cà phê',
    'tìm quán cà phê gần đây',
    'coffee shop Vietnam',
    'PhinFind'
  ],
  alternates: {
    canonical: `${BASE_URL}/`
  },
  openGraph: {
    title: 'PhinFind - Bản đồ Cà phê Việt | Khám phá quán cà phê gần bạn',
    description:
      'Khám phá quán cà phê gần bạn với bản đồ tương tác, đánh giá thực tế từ cộng đồng. Lưu quán yêu thích, tìm đường nhanh chóng và chia sẻ trải nghiệm cà phê.',
    url: BASE_URL,
    siteName: 'PhinFind',
    locale: 'vi_VN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhinFind - Bản đồ Cà phê Việt | Khám phá quán cà phê gần bạn',
    description:
      'Khám phá quán cà phê gần bạn với bản đồ tương tác, đánh giá thực tế từ cộng đồng. Lưu quán yêu thích, tìm đường nhanh chóng và chia sẻ trải nghiệm cà phê.'
  }
};

export default function DiscoverPage() {
  return <DiscoverClient />;
}
