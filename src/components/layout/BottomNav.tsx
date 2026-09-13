'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Heart, User } from 'lucide-react';
import { APP_ROUTES } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';

export function BottomNav() {
  const pathname = usePathname();
  const mobileFilterSheetOpen = useUIStore((state) => state.mobileFilterSheetOpen);

  // RESPONSIVE: Hide BottomNav when mobile filter sheet is open to prevent collision with sheet/footer
  if (mobileFilterSheetOpen) {
    return null;
  }

  if (pathname?.startsWith('/shop/')) {
    return null;
  }

  const navItems = [
    {
      label: 'Khám phá',
      href: APP_ROUTES.HOME,
      icon: Compass,
    },
    {
      label: 'Bản đồ',
      href: APP_ROUTES.MAP,
      icon: MapPin,
    },
    {
      label: 'Đã lưu',
      href: APP_ROUTES.FAVORITES,
      icon: Heart,
    },
    {
      label: 'Hồ sơ',
      href: APP_ROUTES.PROFILE,
      icon: User,
    },
  ];

  return (
    // RESPONSIVE: safe-bottom clears physical gesture indicator on notched devices; md:hidden since tablet/desktop relies on Header nav.
    // Z-index hierarchy: BottomNav (z-40) > sticky bar (z-30) > scroll content (z-0..20).
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border px-4 pt-1.5 safe-bottom shadow-lg text-foreground">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                'relative flex flex-col items-center gap-0.5 h-auto py-1 px-3 text-xs hover:bg-accent rounded-xl transition-all duration-200',
                isActive ? 'text-foreground font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                <Icon className={cn('h-5 w-5 transition-transform', isActive ? 'stroke-[2.5px] text-primary' : 'text-muted-foreground')} />
                {/* RESPONSIVE: Bump label from 10px to 11px/xs for mobile readability */}
                <span className="text-[11px] xs:text-xs tracking-wide">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
