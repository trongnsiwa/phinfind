'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, User } from 'lucide-react';
import { APP_ROUTES } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Discover',
      href: APP_ROUTES.HOME,
      icon: Compass,
    },
    {
      label: 'Saved',
      href: APP_ROUTES.FAVORITES,
      icon: Heart,
    },
    {
      label: 'Profile',
      href: APP_ROUTES.PROFILE,
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-phin-200 px-6 py-1.5 shadow-lg">
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
                'flex flex-col items-center gap-0.5 h-auto py-1 px-3 text-xs hover:bg-phin-50',
                isActive ? 'text-primary font-bold' : 'text-phin-600 hover:text-phin-900'
              )}
            >
              <Link href={item.href}>
                <Icon className={cn('h-5 w-5', isActive ? 'stroke-[2.5px]' : '')} />
                <span className="text-[10px] tracking-wide">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
