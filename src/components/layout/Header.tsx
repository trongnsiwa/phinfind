'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Heart, Settings, LogOut, Compass, MapPin, X, Menu } from 'lucide-react';
import { APP_ROUTES } from '@/lib/utils/constants';
import { useUIStore } from '@/stores/useUIStore';
import { useShopStore } from '@/stores/useShopStore';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MOCK_VIETNAMESE_SHOPS } from '@/lib/mockShops';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useUIStore();
  const { setSelectedShop } = useShopStore();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K) to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Instant autocomplete search filter
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return MOCK_VIETNAMESE_SHOPS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border text-cream-white shadow-lg px-4 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Side: Brand Logo + Desktop Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0">
            <Link
              href={APP_ROUTES.HOME}
              className="flex items-center gap-2.5 group rounded-2xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-200"
              aria-label="PhinFind Homepage"
            >
              <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-gold to-phin-600 text-dark-bg flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
                ☕
              </span>
              <div>
                <h1 className="font-sans font-bold text-xl leading-none text-cream-white tracking-tight group-hover:text-amber-gold-hover transition-colors duration-200">
                  PhinFind
                </h1>
                <p className="text-[9px] text-soft-beige tracking-wider font-semibold uppercase mt-0.5 group-hover:text-cream-white transition-colors duration-200">
                  Coffee PWA
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links (Discover & Map) */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  'relative group text-xs font-semibold px-3.5 h-8.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold',
                  pathname === APP_ROUTES.HOME
                    ? 'text-amber-gold bg-white/10 font-bold'
                    : 'text-soft-beige hover:text-amber-gold-hover hover:bg-white/5'
                )}
              >
                <Link href={APP_ROUTES.HOME} className="flex items-center gap-1.5">
                  <Compass
                    size={15}
                    strokeWidth={2.2}
                    className={cn(
                      'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                      pathname === APP_ROUTES.HOME
                        ? 'text-amber-gold'
                        : 'text-warm-gray'
                    )}
                  />
                  <span>Discover</span>
                  {pathname === APP_ROUTES.HOME && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-amber-gold rounded-full" />
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  'relative group text-xs font-semibold px-3.5 h-8.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold',
                  pathname === APP_ROUTES.MAP
                    ? 'text-amber-gold bg-white/10 font-bold'
                    : 'text-soft-beige hover:text-amber-gold-hover hover:bg-white/5'
                )}
              >
                <Link href={APP_ROUTES.MAP} className="flex items-center gap-1.5">
                  <MapPin
                    size={15}
                    strokeWidth={2.2}
                    className={cn(
                      'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                      pathname === APP_ROUTES.MAP
                        ? 'text-amber-gold'
                        : 'text-warm-gray'
                    )}
                  />
                  <span>Map</span>
                  {pathname === APP_ROUTES.MAP && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-amber-gold rounded-full" />
                  )}
                </Link>
              </Button>
            </nav>
          </div>

          {/* Right Side: Search Button + Profile Avatar Dropdown + Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon Button with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchModalOpen(true)}
                  aria-label="Search coffee shops (Cmd+K)"
                  className="h-9 px-3 text-xs bg-dark-roast/90 hover:bg-dark-border text-cream-white border border-dark-border rounded-2xl gap-2 backdrop-blur-md transition-all duration-200 hover:border-amber-gold/50 hover:text-amber-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold shadow-sm"
                >
                  <Search size={15} className="text-amber-gold" />
                  <span className="hidden sm:inline text-soft-beige">Search...</span>
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-warm-gray bg-dark-bg px-1.5 py-0.5 rounded-lg font-mono border border-dark-border">
                    ⌘K
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-dark-bg text-cream-white border-dark-border text-xs rounded-xl">
                Search coffee shops (⌘K)
              </TooltipContent>
            </Tooltip>

            {/* Profile Avatar Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-0 border border-transparent hover:ring-2 hover:ring-amber-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-200"
                  aria-label="User Menu"
                >
                  <Avatar className="h-9 w-9 border-2 border-amber-gold shadow-md transition-transform duration-200 active:scale-95">
                    <AvatarFallback className="bg-dark-roast text-amber-gold font-bold text-xs">
                      <User size={18} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 bg-dark-bg/95 backdrop-blur-md border-dark-border text-cream-white shadow-2xl rounded-2xl p-1.5 space-y-1 z-[500]"
              >
                <DropdownMenuLabel className="text-amber-gold font-sans font-bold text-xs px-2 py-1.5 flex items-center gap-1.5">
                  ☕ Coffee Explorer
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-dark-border" />
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.PROFILE}
                    className="cursor-pointer text-xs font-medium text-soft-beige hover:text-amber-gold focus:bg-dark-roast focus:text-amber-gold rounded-xl transition-colors"
                  >
                    <User size={14} className="mr-2 text-amber-gold" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.FAVORITES}
                    className="cursor-pointer text-xs font-medium text-soft-beige hover:text-amber-gold focus:bg-dark-roast focus:text-amber-gold rounded-xl transition-colors"
                  >
                    <Heart size={14} className="mr-2 text-rose-400" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.PROFILE}
                    className="cursor-pointer text-xs font-medium text-soft-beige hover:text-amber-gold focus:bg-dark-roast focus:text-amber-gold rounded-xl transition-colors"
                  >
                    <Settings size={14} className="mr-2 text-warm-gray" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-dark-border" />
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.LOGIN}
                    className="cursor-pointer text-xs font-medium text-rose-400 hover:text-rose-300 focus:bg-rose-950/50 rounded-xl transition-colors"
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger Navigation Sheet Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 text-soft-beige hover:text-amber-gold hover:bg-white/5 border border-transparent rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
                  aria-label="Toggle mobile menu"
                >
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-dark-bg text-cream-white border-l border-dark-border p-6 w-72">
                <SheetHeader className="text-left space-y-1 mb-6">
                  <SheetTitle className="font-sans font-bold text-lg text-amber-gold flex items-center gap-2">
                    ☕ PhinFind Navigation
                  </SheetTitle>
                  <SheetDescription className="text-xs text-warm-gray">
                    Explore Vietnamese coffee culture
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-2">
                  <SheetClose asChild>
                    <Link
                      href={APP_ROUTES.HOME}
                      className={cn(
                        'relative group flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors duration-200',
                        pathname === APP_ROUTES.HOME
                          ? 'text-amber-gold bg-white/10 font-bold'
                          : 'text-soft-beige hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                      )}
                    >
                      <Compass
                        size={16}
                        strokeWidth={2.2}
                        className={cn(
                          'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                          pathname === APP_ROUTES.HOME
                            ? 'text-amber-gold'
                            : 'text-warm-gray'
                        )}
                      />
                      <span>Discover</span>
                      {pathname === APP_ROUTES.HOME && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full" />
                      )}
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href={APP_ROUTES.MAP}
                      className={cn(
                        'relative group flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors duration-200',
                        pathname === APP_ROUTES.MAP
                          ? 'text-amber-gold bg-white/10 font-bold'
                          : 'text-soft-beige hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                      )}
                    >
                      <MapPin
                        size={16}
                        strokeWidth={2.2}
                        className={cn(
                          'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                          pathname === APP_ROUTES.MAP
                            ? 'text-amber-gold'
                            : 'text-warm-gray'
                        )}
                      />
                      <span>Map View</span>
                      {pathname === APP_ROUTES.MAP && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full" />
                      )}
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href={APP_ROUTES.FAVORITES}
                      className={cn(
                        'relative group flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors duration-200',
                        pathname === APP_ROUTES.FAVORITES
                          ? 'text-amber-gold bg-white/10 font-bold'
                          : 'text-soft-beige hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                      )}
                    >
                      <Heart
                        size={16}
                        strokeWidth={2.2}
                        className={cn(
                          'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                          pathname === APP_ROUTES.FAVORITES
                            ? 'text-amber-gold'
                            : 'text-rose-400'
                        )}
                      />
                      <span>Saved Favorites</span>
                      {pathname === APP_ROUTES.FAVORITES && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full" />
                      )}
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href={APP_ROUTES.PROFILE}
                      className={cn(
                        'relative group flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors duration-200',
                        pathname === APP_ROUTES.PROFILE
                          ? 'text-amber-gold bg-white/10 font-bold'
                          : 'text-soft-beige hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                      )}
                    >
                      <User
                        size={16}
                        strokeWidth={2.2}
                        className={cn(
                          'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                          pathname === APP_ROUTES.PROFILE
                            ? 'text-amber-gold'
                            : 'text-warm-gray'
                        )}
                      />
                      <span>My Profile</span>
                      {pathname === APP_ROUTES.PROFILE && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full" />
                      )}
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Search Sheet Overlay Modal */}
      <Sheet open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <SheetContent side="top" className="bg-dark-bg text-cream-white border-b border-dark-border p-6 max-w-3xl mx-auto rounded-b-3xl shadow-2xl z-[500]">
          <SheetHeader className="text-left space-y-1 mb-4">
            <SheetTitle className="font-sans font-bold text-xl text-amber-gold flex items-center gap-2">
              <Search size={18} className="text-amber-gold" /> Search Coffee Shops
            </SheetTitle>
            <SheetDescription className="text-xs text-warm-gray">
              Find shops by name, street, or neighborhood in Hanoi.
            </SheetDescription>
          </SheetHeader>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shop name or location..."
              autoFocus
              className="h-11 pl-10 pr-10 text-sm bg-dark-roast text-cream-white border-dark-border rounded-2xl focus-visible:ring-amber-gold placeholder:text-warm-gray"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-warm-gray hover:text-cream-white hover:bg-dark-border rounded-full"
              >
                <X size={14} />
              </Button>
            )}
          </div>

          {/* Instant Autocomplete Search Results */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {searchQuery && searchResults.length === 0 ? (
              <p className="text-xs text-warm-gray text-center py-6">No matching coffee shops found.</p>
            ) : (
              searchResults.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => {
                    setSelectedShop(shop);
                    setSearchModalOpen(false);
                    router.push(APP_ROUTES.SHOP_DETAIL(shop.id));
                  }}
                  className="p-3 bg-dark-roast/50 hover:bg-dark-roast rounded-2xl border border-dark-border hover:border-amber-gold/40 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <h4 className="font-sans font-bold text-xs text-amber-gold">{shop.name}</h4>
                    <p className="text-[11px] text-soft-beige line-clamp-1">{shop.address}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-gold/20 text-amber-gold border-amber-gold/40 text-[10px]">
                    ⭐ {shop.rating.toFixed(1)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

