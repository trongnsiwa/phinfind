'use client';

import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { APP_ROUTES } from '@/lib/utils/constants';
import { useUIStore } from '@/stores/useUIStore';

export function Header() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-phin-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href={APP_ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0 group">
          <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-primary-hover transition-colors">
            ☕
          </span>
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-lg leading-tight text-phin-900">
              PhinFind
            </h1>
            <p className="text-[10px] text-phin-600 tracking-wide font-medium">
              Discover Vietnamese Coffee
            </p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-phin-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coffee shop name or location..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-white text-phin-900 border border-phin-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-phin-400"
          />
        </div>

        {/* User Profile Action */}
        <Link
          href={APP_ROUTES.PROFILE}
          aria-label="User Profile"
          className="p-2 rounded-xl bg-white border border-phin-200 text-phin-800 hover:text-primary hover:bg-phin-50 transition-colors flex-shrink-0"
        >
          <User size={18} />
        </Link>
      </div>
    </header>
  );
}
