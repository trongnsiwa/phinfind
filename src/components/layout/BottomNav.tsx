'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Heart, User } from 'lucide-react';
import { APP_ROUTES } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-1.5 shadow-lg text-foreground">
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
              <Link href={item.href}>
                <Icon className={cn('h-5 w-5 transition-transform', isActive ? 'stroke-[2.5px] text-primary' : 'text-muted-foreground')} />
                <span className="text-[10px] tracking-wide">{item.label}</span>
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
