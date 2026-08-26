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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-phin-950/95 backdrop-blur-lg border-t border-white/10 px-4 py-1.5 shadow-lg text-white">
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
                'relative flex flex-col items-center gap-0.5 h-auto py-1 px-3 text-xs hover:bg-white/10 rounded-xl transition-all duration-200',
                isActive ? 'text-amber-300 font-bold scale-105' : 'text-phin-300 hover:text-white'
              )}
            >
              <Link href={item.href}>
                <Icon className={cn('h-5 w-5 transition-transform', isActive ? 'stroke-[2.5px] text-amber-300' : '')} />
                <span className="text-[10px] tracking-wide">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
