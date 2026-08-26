'use client';

import {
  Compass,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  Sparkles,
  Star,
  User,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useSearchShops } from '@/hooks/useShops';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/utils/constants';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { CoffeeShop } from '@/types/shop';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useUIStore();
  const { setSelectedShop } = useShopStore();
  const { user, profile, isAuthenticated, signOut, loading } = useAuth();
  const { lat, lng } = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [localValue, setLocalValue] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Sync local input with store if changed externally
  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  // Debounce updates to global store and autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(localValue);
      if (localValue !== searchQuery) {
        setSearchQuery(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, searchQuery, setSearchQuery]);

  // Debounced search query to Supabase via useSearchShops
  const { data: searchResults = [], isLoading: isSearching } = useSearchShops(
    isSearchOpen && debouncedQuery.trim().length > 0 ? debouncedQuery : '',
    lat,
    lng
  );

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Người sành cà phê');
  const userEmail = profile?.email || user?.email;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // Auto-focus input when search expands
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K) to open inline search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener to dismiss search bar & autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectShop = (shop: CoffeeShop) => {
    setSelectedShop(shop);
    setIsSearchOpen(false);
    router.push(APP_ROUTES.SHOP_DETAIL(shop.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      return;
    }

    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectShop(searchResults[selectedIndex]);
      } else if (pathname !== APP_ROUTES.HOME) {
        router.push(APP_ROUTES.HOME);
        setIsSearchOpen(false);
      }
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setLocalValue('');
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  // Map route provides its own full-bleed overlay header
  if (pathname === APP_ROUTES.MAP) {
    return null;
  }

  return (
    <header className='sticky top-0 z-40 bg-[#101010]/95 backdrop-blur-md border-b border-[#2A2A2A] text-white shadow-lg px-3 sm:px-4 py-2.5 transition-all duration-300'>
      <div className='max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4'>
        {/* Left Side: Brand Logo + Desktop Navigation Links */}
        <div className='flex items-center gap-5 lg:gap-7 flex-shrink-0'>
          <Link
            href={APP_ROUTES.HOME}
            className='flex items-center gap-2 group rounded-2xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-200'
            aria-label='Trang chủ PhinFind'
          >
            <span className='w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-amber-gold to-phin-600 text-[#101010] flex items-center justify-center font-bold text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform duration-200'>
              ☕
            </span>
            <div>
              <h1 className='font-sans font-bold text-lg sm:text-xl leading-none text-amber-gold tracking-tight group-hover:text-amber-gold-hover transition-colors duration-200'>
                PhinFind
              </h1>
              <p className='text-[9px] text-[#D0D0D0] tracking-wider font-semibold uppercase mt-0.5 group-hover:text-white transition-colors duration-200'>
                Bản đồ cà phê Việt
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className='hidden md:flex items-center gap-1.5'>
            <Button
              variant='ghost'
              size='sm'
              asChild
              className={cn(
                'relative group text-xs font-semibold px-3 h-8.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold',
                pathname === APP_ROUTES.HOME
                  ? 'text-amber-gold bg-white/10 font-bold'
                  : 'text-[#D0D0D0] hover:text-amber-gold-hover hover:bg-white/5'
              )}
            >
              <Link href={APP_ROUTES.HOME} className='flex items-center gap-1.5'>
                <Compass
                  size={15}
                  strokeWidth={2.2}
                  className={cn(
                    'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                    pathname === APP_ROUTES.HOME ? 'text-amber-gold' : 'text-[#A0A0A0]'
                  )}
                />
                <span>Khám phá</span>
                {pathname === APP_ROUTES.HOME && (
                  <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-amber-gold rounded-full' />
                )}
              </Link>
            </Button>

            <Button
              variant='ghost'
              size='sm'
              asChild
              className={cn(
                'relative group text-xs font-semibold px-3 h-8.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold',
                pathname === APP_ROUTES.MAP
                  ? 'text-amber-gold bg-white/10 font-bold'
                  : 'text-[#D0D0D0] hover:text-amber-gold-hover hover:bg-white/5'
              )}
            >
              <Link href={APP_ROUTES.MAP} className='flex items-center gap-1.5'>
                <MapPin
                  size={15}
                  strokeWidth={2.2}
                  className={cn(
                    'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                    pathname === APP_ROUTES.MAP ? 'text-amber-gold' : 'text-[#A0A0A0]'
                  )}
                />
                <span>Bản đồ</span>
                {pathname === APP_ROUTES.MAP && (
                  <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-amber-gold rounded-full' />
                )}
              </Link>
            </Button>
          </nav>
        </div>

        {/* Right Side: Right-Anchored Search + Profile Avatar + Mobile Hamburger Menu */}
        <div className='flex items-center gap-2 sm:gap-2.5 flex-shrink-0'>
          {/* Search container */}
          <div ref={searchContainerRef} className='relative flex items-center'>
            {!isSearchOpen ? (
              /* Closed state: Search icon button */
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsSearchOpen(true)}
                aria-label='Tìm quán cà phê (Cmd+K)'
                className='h-9 w-9 rounded-full text-[#A0A0A0] hover:text-amber-gold hover:bg-white/5 border border-[#2A2A2A]/60 hover:border-amber-gold/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold flex-shrink-0'
              >
                <Search size={16} className='text-amber-gold' />
              </Button>
            ) : (
              /* Open state: Clean slide-in search input stretching leftward */
              <div className='flex items-center gap-1.5 animate-in fade-in slide-in-from-right-3 duration-200 ease-out'>
                <div className='relative flex items-center'>
                  <Search
                    size={15}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none z-10'
                    aria-hidden='true'
                  />
                  <Input
                    ref={inputRef}
                    type='text'
                    value={localValue}
                    onChange={(e) => {
                      setLocalValue(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder='Tìm theo tên quán, đường phố, khu vực...'
                    aria-label='Tìm kiếm quán cà phê'
                    className='w-48 sm:w-64 h-9 pl-9 pr-8 text-xs sm:text-sm bg-[#141414] text-white border-[#2A2A2A] rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold placeholder:text-[#A0A0A0] shadow-inner'
                  />
                  {localValue && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        setLocalValue('');
                        setSearchQuery('');
                        setSelectedIndex(-1);
                        inputRef.current?.focus();
                      }}
                      aria-label='Xóa nội dung tìm kiếm'
                      className='absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]/80 rounded-full p-0 transition-colors'
                    >
                      <X size={13} />
                    </Button>
                  )}
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleCloseSearch}
                  aria-label='Đóng tìm kiếm'
                  className='h-9 w-9 text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]/80 rounded-xl p-0 flex-shrink-0 transition-colors'
                >
                  <X size={16} />
                </Button>
              </div>
            )}

            {/* Autocomplete Suggestions Dropdown Attached Below Right-Aligned Search */}
            {isSearchOpen && localValue.trim().length > 0 && (
              <div className='absolute right-0 top-full mt-2 w-72 sm:w-80 md:w-96 bg-[#101010]/98 backdrop-blur-xl border border-[#2A2A2A]/80 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] shadow-amber-gold/5 p-2 z-[100] max-h-80 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 text-left'>
                {isSearching ? (
                  <div className='py-6 text-center text-xs text-[#D0D0D0]/70 flex items-center justify-center gap-2 font-medium'>
                    <span className='w-3.5 h-3.5 rounded-full border-2 border-amber-gold border-t-transparent animate-spin' />
                    Đang tìm kiếm quán cà phê...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className='py-6 text-center text-xs text-[#D0D0D0]/70'>
                    <p className='font-semibold text-white mb-0.5'>
                      Không tìm thấy quán cà phê nào
                    </p>
                    <p className='text-[11px]'>Thử tìm kiếm theo tên đường hoặc quận</p>
                  </div>
                ) : (
                  <>
                    <div className='px-2.5 py-1 text-[10px] font-bold text-[#D0D0D0]/60 uppercase tracking-wider flex items-center justify-between border-b border-[#2A2A2A]/40 mb-1'>
                      <span>Quán Cà Phê Phù Hợp</span>
                      <span>{searchResults.length} kết quả</span>
                    </div>
                    {searchResults.map((shop, index) => {
                      const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
                      const isSelected = index === selectedIndex;

                      return (
                        <div
                          key={shop.id}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => handleSelectShop(shop)}
                          className={cn(
                            'p-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-2.5 transition-all duration-150',
                            isSelected
                              ? 'bg-[#141414] text-amber-gold border border-amber-gold/30 shadow-sm'
                              : 'hover:bg-[#141414]/60 text-white border border-transparent'
                          )}
                        >
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-1.5'>
                              <h4 className='font-sans font-bold text-xs truncate group-hover:text-amber-gold'>
                                {shop.name}
                              </h4>
                              {shop.opening_hours?.open_now && (
                                <span
                                  className='w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0 animate-pulse'
                                  title='Đang mở cửa'
                                />
                              )}
                            </div>
                            <p className='text-[11px] text-[#D0D0D0]/80 truncate flex items-center gap-1 mt-0.5'>
                              <MapPin size={10} className='text-amber-gold flex-shrink-0' />
                              {shop.address || 'Chưa có địa chỉ'}
                            </p>
                          </div>

                          <div className='flex items-center gap-1.5 flex-shrink-0 text-[10px]'>
                            <Badge
                              variant='outline'
                              className={cn(
                                'px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-0.5',
                                hasRating
                                  ? 'bg-[#101010]/80 text-amber-gold border-amber-gold/30'
                                  : 'bg-[#101010]/80 text-[#D0D0D0] border-[#2A2A2A]'
                              )}
                            >
                              {hasRating ? (
                                <>
                                  <Star size={9} className='fill-amber-gold text-amber-gold' />
                                  {shop.rating.toFixed(1)}
                                </>
                              ) : (
                                <>
                                  <Sparkles size={9} className='text-amber-gold/60' />
                                  Mới
                                </>
                              )}
                            </Badge>
                            {shop.distance_text && shop.distance_text !== '0 m' && (
                              <span className='text-[#D0D0D0]/70 font-medium hidden sm:inline'>
                                {shop.distance_text}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile Avatar Dropdown Menu (Authenticated) or Sign In Button (Guest) */}
          {loading ? (
            <Skeleton className='h-9 w-9 rounded-full' />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full p-0 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(212,160,87,0.15)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold/30 cursor-pointer'
                  aria-label={`Menu người dùng ${displayName}`}
                >
                  <Avatar className='h-9 w-9'>
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt={displayName} className='object-cover' />
                    )}
                    <AvatarFallback className='bg-[#141414] text-amber-gold font-bold text-xs'>
                      {displayName.charAt(0).toUpperCase() || <User size={15} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56 bg-[#101010]/95 backdrop-blur-md border border-[#2A2A2A] text-white shadow-2xl rounded-2xl p-1.5 space-y-1 z-[500]'
              >
                <DropdownMenuLabel className='font-sans px-2.5 py-2 select-none'>
                  <div className='flex items-center gap-2.5'>
                    <Avatar className='h-9 w-9 rounded-full border border-[#2A2A2A]/40 shrink-0'>
                      {avatarUrl && (
                        <AvatarImage src={avatarUrl} alt={displayName} className='object-cover' />
                      )}
                      <AvatarFallback className='bg-[#141414] text-amber-gold font-bold text-xs'>
                        {displayName.charAt(0).toUpperCase() || <User size={16} />}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col min-w-0'>
                      <span className='text-xs font-bold text-amber-gold truncate'>
                        {displayName}
                      </span>
                      <span className='text-[10px] font-normal text-[#A0A0A0] truncate'>
                        {userEmail || 'Người sành cà phê'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className='bg-[#2A2A2A] my-1' />
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.PROFILE}
                    className='cursor-pointer text-xs font-medium text-[#D0D0D0] hover:text-amber-gold focus:bg-[#141414]/60 focus:text-amber-gold rounded-xl px-2.5 py-2 transition-colors flex items-center gap-2 group'
                  >
                    <User
                      size={16}
                      className='text-[#A0A0A0] group-hover:text-amber-gold transition-colors shrink-0'
                    />
                    <span>Trang cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.FAVORITES}
                    className='cursor-pointer text-xs font-medium text-[#D0D0D0] hover:text-amber-gold focus:bg-[#141414]/60 focus:text-amber-gold rounded-xl px-2.5 py-2 transition-colors flex items-center gap-2 group'
                  >
                    <Heart
                      size={16}
                      className='text-[#A0A0A0] group-hover:text-amber-gold transition-colors shrink-0'
                    />
                    <span>Yêu thích</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.PROFILE}
                    className='cursor-pointer text-xs font-medium text-[#D0D0D0] hover:text-amber-gold focus:bg-[#141414]/60 focus:text-amber-gold rounded-xl px-2.5 py-2 transition-colors flex items-center gap-2 group'
                  >
                    <Settings
                      size={16}
                      className='text-[#A0A0A0] group-hover:text-amber-gold transition-colors shrink-0'
                    />
                    <span>Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className='bg-[#2A2A2A] my-1' />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.push(APP_ROUTES.LOGIN);
                  }}
                  className='cursor-pointer text-xs font-medium text-rose-400 hover:text-rose-300 focus:bg-rose-950/30 focus:text-rose-300 rounded-xl px-2.5 py-2 transition-colors flex items-center gap-2 group'
                >
                  <LogOut
                    size={16}
                    className='text-rose-400 group-hover:text-rose-300 transition-colors shrink-0'
                  />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className='bg-amber-gold hover:bg-amber-gold-hover text-[#101010] font-bold text-xs rounded-xl px-3.5 py-1.5 h-9 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer'
            >
              <Link href={APP_ROUTES.LOGIN}>
                <LogIn size={15} />
                <span>Đăng nhập</span>
              </Link>
            </Button>
          )}

          {/* Mobile Hamburger Navigation Sheet Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='md:hidden h-9 w-9 text-[#D0D0D0] hover:text-amber-gold hover:bg-white/5 border border-transparent rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold'
                aria-label='Mở menu'
              >
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side='right'
              className='bg-[#101010] text-white border-l border-[#2A2A2A] p-6 w-72'
            >
              <SheetHeader className='text-left space-y-1 mb-6'>
                <SheetTitle className='font-sans font-bold text-lg text-amber-gold flex items-center gap-2'>
                  ☕ Menu PhinFind
                </SheetTitle>
                <SheetDescription className='text-xs text-[#A0A0A0]'>
                  Khám phá văn hóa cà phê Việt
                </SheetDescription>
              </SheetHeader>

              <div className='flex flex-col gap-2'>
                <SheetClose asChild>
                  <Link
                    href={APP_ROUTES.HOME}
                    className={cn(
                      'relative group flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-colors duration-200',
                      pathname === APP_ROUTES.HOME
                        ? 'text-amber-gold bg-white/10 font-bold'
                        : 'text-[#D0D0D0] hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                    )}
                  >
                    <Compass
                      size={16}
                      strokeWidth={2.2}
                      className={cn(
                        'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                        pathname === APP_ROUTES.HOME ? 'text-amber-gold' : 'text-[#A0A0A0]'
                      )}
                    />
                    <span>Khám phá</span>
                    {pathname === APP_ROUTES.HOME && (
                      <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full' />
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
                        : 'text-[#D0D0D0] hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                    )}
                  >
                    <MapPin
                      size={16}
                      strokeWidth={2.2}
                      className={cn(
                        'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                        pathname === APP_ROUTES.MAP ? 'text-amber-gold' : 'text-[#A0A0A0]'
                      )}
                    />
                    <span>Xem bản đồ</span>
                    {pathname === APP_ROUTES.MAP && (
                      <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full' />
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
                        : 'text-[#D0D0D0] hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                    )}
                  >
                    <Heart
                      size={16}
                      strokeWidth={2.2}
                      className={cn(
                        'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                        pathname === APP_ROUTES.FAVORITES ? 'text-amber-gold' : 'text-rose-400'
                      )}
                    />
                    <span>Đã lưu yêu thích</span>
                    {pathname === APP_ROUTES.FAVORITES && (
                      <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full' />
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
                        : 'text-[#D0D0D0] hover:text-amber-gold-hover hover:bg-white/5 font-semibold'
                    )}
                  >
                    <User
                      size={16}
                      strokeWidth={2.2}
                      className={cn(
                        'transition-all duration-200 group-hover:scale-110 group-hover:text-amber-gold-hover',
                        pathname === APP_ROUTES.PROFILE ? 'text-amber-gold' : 'text-[#A0A0A0]'
                      )}
                    />
                    <span>Hồ sơ của tôi</span>
                    {pathname === APP_ROUTES.PROFILE && (
                      <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-gold rounded-r-full' />
                    )}
                  </Link>
                </SheetClose>

                <div className='my-2 border-t border-[#2A2A2A]' />

                {isAuthenticated ? (
                  <Button
                    variant='ghost'
                    onClick={async () => {
                      await signOut();
                      router.push(APP_ROUTES.LOGIN);
                    }}
                    className='justify-start p-2.5 h-auto rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-2.5 transition-colors duration-200'
                  >
                    <LogOut size={16} className='text-rose-400' />
                    <span>Đăng xuất</span>
                  </Button>
                ) : (
                  <SheetClose asChild>
                    <Link
                      href={APP_ROUTES.LOGIN}
                      className='flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-amber-gold hover:text-amber-gold-hover hover:bg-amber-500/10 transition-colors duration-200'
                    >
                      <LogIn size={16} className='text-amber-gold' />
                      <span>Đăng nhập</span>
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
