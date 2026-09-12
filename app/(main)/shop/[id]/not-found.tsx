import Link from 'next/link';
import { Coffee, ChevronLeft } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ShopNotFound() {
  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <Card className="text-center py-10 px-6 sm:px-8 bg-card rounded-3xl border border-border/80 shadow-card max-w-md w-full space-y-5 text-foreground">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-gold flex items-center justify-center mx-auto shadow-xs">
          <Coffee size={32} />
        </div>

        <div className="space-y-2">
          <CardTitle className="font-sans font-bold text-lg sm:text-xl text-foreground">
            Không tìm thấy quán cà phê
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Quán cà phê này có thể đã bị xóa hoặc không tồn tại.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="default"
            size="sm"
            asChild
            className="h-10 px-6 bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold rounded-xl text-xs shadow-xs cursor-pointer"
          >
            <Link href="/">
              <ChevronLeft size={14} className="mr-1" />
              <span>Về trang chủ</span>
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
