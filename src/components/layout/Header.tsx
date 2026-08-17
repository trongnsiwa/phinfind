'use client';

import Link from 'next/link';
import { Search, User, Heart, Settings, LogOut } from 'lucide-react';
import { APP_ROUTES } from '@/lib/utils/constants';
import { useUIStore } from '@/stores/useUIStore';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

export function Header() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-phin-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href={APP_ROUTES.HOME} className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-primary/90 transition-colors">
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

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={APP_ROUTES.HOME}>Discover</Link>
                </Button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={APP_ROUTES.FAVORITES}>Favorites</Link>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-phin-500 z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coffee shop name or location..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-white text-phin-900 border-phin-200 rounded-xl focus-visible:ring-primary"
          />
        </div>

        {/* User Account Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="User Menu">
              <Avatar className="h-8 w-8 border border-phin-200">
                <AvatarFallback className="bg-phin-100 text-phin-800">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border-phin-200">
            <DropdownMenuLabel className="text-phin-900 font-display">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-phin-100" />
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.PROFILE} className="cursor-pointer text-phin-800 hover:text-primary">
                <User size={14} className="mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.FAVORITES} className="cursor-pointer text-phin-800 hover:text-primary">
                <Heart size={14} className="mr-2" />
                Favorites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-phin-100" />
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.LOGIN} className="cursor-pointer text-destructive hover:text-destructive">
                <LogOut size={14} className="mr-2" />
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
