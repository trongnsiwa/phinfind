'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, User } from 'lucide-react';
import { APP_ROUTES } from '@/lib/utils/constants';

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-phin-200 px-6 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-primary font-bold scale-105' : 'text-phin-600 hover:text-phin-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : ''} />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
