import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchShopForServer } from '@/lib/supabase/shop-detail';
import { ShopDetailClient } from './ShopDetailClient';
import type { CoffeeShop } from '@/types/shop';

interface PageProps {
  params: Promise<{ id: string }>;
}

function buildShopDescription(shop: CoffeeShop): string {
  const parts: string[] = [];
  if (shop.address) {
    parts.push(`Địa chỉ: ${shop.address}`);
  }
  if (shop.rating && shop.rating > 0) {
    parts.push(`Đánh giá: ${shop.rating.toFixed(1)}/5★`);
  }
  if (Array.isArray(shop.categories) && shop.categories.length > 0) {
    parts.push(`Đặc trưng: ${shop.categories.slice(0, 3).join(', ')}`);
  }
  if (parts.length > 0) {
    return `${shop.name} - ${parts.join('. ')}.`;
  }
  return `Khám phá quán cà phê ${shop.name} trên PhinFind.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const shop = await fetchShopForServer(id);

  if (!shop) {
    return {
      title: 'Không tìm thấy quán cà phê | PhinFind',
    };
  }

  const description = buildShopDescription(shop);
  const primaryPhoto = shop.photos?.[0];
  const ogImages = primaryPhoto
    ? [{ url: primaryPhoto, width: 1200, height: 630, alt: shop.name }]
    : [];

  return {
    title: `${shop.name} | PhinFind`,
    description,
    openGraph: {
      title: shop.name,
      description,
      images: ogImages,
      type: 'website',
      siteName: 'PhinFind',
      locale: 'vi_VN',
    },
    twitter: {
      card: primaryPhoto ? 'summary_large_image' : 'summary',
      title: shop.name,
      description,
      images: primaryPhoto ? [primaryPhoto] : [],
    },
    alternates: {
      canonical: `/shop/${shop.place_id || id}`,
    },
  };
}

export default async function ShopDetailPage({ params }: PageProps) {
  const { id } = await params;
  const shop = await fetchShopForServer(id);

  if (!shop) {
    notFound();
  }

  return <ShopDetailClient shop={shop} />;
}
