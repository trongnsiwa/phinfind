'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { DetailSkeleton } from '@/components/common/LoadingSkeleton';
import { useShopDetails } from '@/hooks/useShops';
import { ShopDetailsContent } from '@/components/shop/ShopDetailsContent';

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: shop, isLoading, error } = useShopDetails(resolvedParams.id);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !shop) {
    return (
      <Card className="text-center py-12 bg-card rounded-3xl border border-border shadow-xl p-6 max-w-md mx-auto space-y-3 text-foreground">
        <span className="text-5xl">☕</span>
        <CardTitle className="font-sans text-lg text-foreground">Không Tìm Thấy Quán Cà Phê</CardTitle>
        <p className="text-xs text-muted-foreground">
          Không thể tải thông tin chi tiết của quán cà phê này.
        </p>
        <Button variant="default" size="sm" asChild className="bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold rounded-xl text-xs">
          <Link href="/">
            <ArrowLeft size={14} className="mr-1" /> Quay lại Khám phá
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 text-foreground pb-8">
      <div className="pt-2 px-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="bg-card/80 backdrop-blur-md hover:bg-secondary text-foreground border border-border/60 text-xs rounded-xl shadow-xs"
        >
          <Link href="/">
            <ArrowLeft size={16} className="mr-1 text-amber-gold" />
            Quay lại Khám phá
          </Link>
        </Button>
      </div>
      <ShopDetailsContent shop={shop} isSidebar={false} />
    </div>
  );
}

