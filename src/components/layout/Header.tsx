'use client';

import {
  Compass,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Sun,
  User,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useSearchShops } from '@/hooks/useShops';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/utils/constants';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useUserBadges } from '@/hooks/useUserBadges';
import { useShopStore } from '@/stores/useShopStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useUIStore } from '@/stores/useUIStore';
import { CoffeeShop } from '@/types/shop';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();
  const { setSelectedShop } = useShopStore();
  const { user, profile, isAuthenticated, signOut, loading } = useAuth();
  const { label: badgeTierLabel } = useUserBadges();
  const { lat, lng } = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
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

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setLocalValue('');
    setSearchQuery('');
    setSelectedIndex(-1);
    inputRef.current?.blur();
    setTimeout(() => {
      searchButtonRef.current?.focus();
    }, 50);
  }, [setSearchQuery]);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K toggles search, Escape closes search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isSearchOpen) {
        e.preventDefault();
        handleCloseSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, handleCloseSearch]);

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
      handleCloseSearch();
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
        handleCloseSearch();
      }
    }
  };

  // Map route provides its own full-bleed overlay header
  if (pathname === APP_ROUTES.MAP) {
    return null;
  }

  return (
    // RESPONSIVE: Header height must stay h-14 across all tiers because MapClient positions fixed overlays at top-14
    <header className='sticky-header sticky top-0 z-40 h-14 w-full bg-card/95 backdrop-blur-md border-b border-border text-foreground shadow-sm px-3 sm:px-4 transition-colors duration-200 flex items-center'>
      <div className='max-w-7xl mx-auto w-full flex items-center justify-between gap-3 sm:gap-4'>
        {/* RESPONSIVE: mobile search opens as full-width takeover; tablet/desktop search stays inline. */}
        {/* Left Side: Brand Logo + Desktop Navigation Links */}
        <div
          className={cn(
            'flex items-center gap-5 lg:gap-7 flex-shrink-0 transition-all duration-200',
            isSearchOpen && 'hidden md:flex'
          )}
        >
          <Link
            href={APP_ROUTES.HOME}
            className='flex items-center gap-2 group rounded-2xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-200'
            aria-label='Trang chủ PhinFind'
          >
            <div className='w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 overflow-hidden shrink-0'>
              <Image
                src='/logo.svg'
                alt='PhinFind'
                width={36}
                height={36}
                className='w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-2xl object-contain'
                priority
              />
            </div>
            <div>
              <h1 className='font-sans font-bold text-lg sm:text-xl leading-none text-foreground tracking-tight group-hover:text-primary transition-colors duration-200'>
                PhinFind
              </h1>
              <p className='hidden xs:block text-[9px] text-muted-foreground tracking-wider font-semibold uppercase mt-0.5 group-hover:text-foreground transition-colors duration-200'>
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
                'relative group text-xs font-semibold px-3 h-8.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                pathname === APP_ROUTES.HOME
                  ? 'text-foreground bg-primary/20 font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Link href={APP_ROUTES.HOME} className='flex items-center gap-1.5'>
                <Compass
                  size={15}
                  strokeWidth={2.2}
                  className={cn(
                    'transition-all duration-200 group-hover:scale-110',
                    pathname === APP_ROUTES.HOME ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span>Khám phá</span>
                {pathname === APP_ROUTES.HOME && (
                  <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary rounded-full' />
                )}
              </Link>
            </Button>

            <Button
              variant='ghost'
              size='sm'
              asChild
              className={cn(
                'relative group text-xs font-semibold px-3 h-8.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                pathname === APP_ROUTES.MAP
                  ? 'text-foreground bg-primary/20 font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Link href={APP_ROUTES.MAP} className='flex items-center gap-1.5'>
                <MapPin
                  size={15}
                  strokeWidth={2.2}
                  className={cn(
                    'transition-all duration-200 group-hover:scale-110',
                    pathname === APP_ROUTES.MAP ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span>Bản đồ</span>
                {pathname === APP_ROUTES.MAP && (
                  <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary rounded-full' />
                )}
              </Link>
            </Button>
          </nav>
        </div>


        {/* Right Side: Theme Toggle + Right-Anchored Search + Profile Avatar */}
        <div
          className={cn(
            'flex items-center gap-2 sm:gap-2.5 transition-all duration-200',
            isSearchOpen ? 'w-full md:w-auto flex-1 md:flex-initial justify-end' : 'flex-shrink-0'
          )}
        >
          {/* Theme Toggle Button */}
          {/* RESPONSIVE: Hidden on mobile (< md) to reduce header clutter to 4 tap targets; theme toggle remains accessible via Settings */}
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            aria-label={
              theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'
            }
            className='hidden md:flex h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/70 border border-border/60 hover:border-amber-gold/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold flex-shrink-0'
          >
            {theme === 'dark' ? (
              <Sun size={16} className='text-amber-gold' />
            ) : (
              <Moon size={16} className='text-muted-foreground' />
            )}
          </Button>

          {/* Notification Bell (authenticated only) */}
          {isAuthenticated && !loading && (
            <div className={cn(isSearchOpen && 'hidden md:block')}>
              <NotificationBell />
            </div>
          )}

          {/* Search container */}
          <div
            ref={searchContainerRef}
            className={cn(
              'relative flex items-center',
              isSearchOpen && 'w-full flex-1 md:w-auto md:flex-initial'
            )}
          >
            {/* Closed state: Search icon button */}
            <Button
              ref={searchButtonRef}
              variant='ghost'
              size='icon'
              onClick={() => setIsSearchOpen(true)}
              aria-label='Tìm quán cà phê (Cmd+K)'
              className={cn(
                'h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/70 border border-border/60 hover:border-amber-gold/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold flex-shrink-0',
                isSearchOpen
                  ? 'w-0 opacity-0 p-0 m-0 border-0 pointer-events-none scale-75 overflow-hidden invisible'
                  : 'opacity-100 scale-100 visible'
              )}
            >
              <Search size={16} className='text-muted-foreground' />
            </Button>

            {/* Open state: Width-based expanding container wrapping input + close button */}
            {/* RESPONSIVE: Mobile takes full width, container max-width accommodates search input ladder plus action button on desktop */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-out will-change-[max-width,opacity] py-1 -my-1 px-1 -mx-1',
                isSearchOpen
                  ? 'w-full flex-1 max-w-full md:w-auto md:max-w-[min(24rem,calc(100vw-5rem))] opacity-100 visible'
                  : 'max-w-0 opacity-0 pointer-events-none invisible'
              )}
            >
              <div
                className={cn(
                  'flex items-center gap-1.5 transition-all duration-200 ease-out will-change-[transform,opacity] origin-right w-full',
                  isSearchOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                )}
              >
                <div className='relative flex items-center flex-1 min-w-0 md:w-auto'>
                  <Search
                    size={16}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10'
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
                    // RESPONSIVE: Full width on mobile takeover, capped on tablet/desktop
                    className='w-full md:w-72 lg:w-80 md:max-w-[min(20rem,calc(100vw-8rem))] h-10 md:h-9 pl-9 pr-8 text-sm bg-secondary text-foreground border-border rounded-xl !outline-none focus:!outline-none focus-visible:!outline-none focus:ring-1 focus:ring-amber-gold/60 focus:ring-offset-0 focus:border-amber-gold/60 focus-visible:ring-1 focus-visible:ring-amber-gold/60 focus-visible:ring-offset-0 focus-visible:border-amber-gold/60 focus:shadow-[0_0_0_1px_rgba(184,134,11,0.25)] focus-visible:shadow-[0_0_0_1px_rgba(184,134,11,0.25)] placeholder:text-muted-foreground transition-all duration-200 ease-out will-change-[transform,opacity]'
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
                      className='absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-0 transition-colors'
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>

                {/* Mobile Cancel text button */}
                <Button
                  type='button'
                  variant='ghost'
                  onClick={handleCloseSearch}
                  aria-label='Đóng tìm kiếm'
                  className='md:hidden h-10 min-h-[44px] min-w-[48px] px-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted/60 active:bg-muted rounded-xl flex-shrink-0 transition-colors'
                >
                  Hủy
                </Button>

                {/* Desktop Close icon button */}
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={handleCloseSearch}
                  aria-label='Đóng tìm kiếm'
                  className='hidden md:flex h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl p-0 flex-shrink-0 transition-colors'
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Autocomplete Suggestions Dropdown Attached Below Search */}
            {/* RESPONSIVE: Full-width on mobile takeover with bounded viewport height; fixed width ladder on desktop */}
            {isSearchOpen && localValue.trim().length > 0 && (
              <div className='absolute left-0 right-0 md:left-auto md:right-0 top-full mt-2 w-auto md:w-[26rem] lg:w-[28rem] max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-8rem)] md:max-h-80 bg-popover/98 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-2 z-[100] overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 text-left'>
                {isSearching ? (
                  <div className='py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-medium'>
                    <span className='w-3.5 h-3.5 rounded-full border-2 border-amber-gold border-t-transparent animate-spin' />
                    Đang tìm kiếm quán cà phê...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className='py-6 text-center text-xs text-muted-foreground'>
                    <p className='font-semibold text-foreground mb-0.5'>
                      Không tìm thấy quán cà phê nào
                    </p>
                    <p className='text-[11px]'>Thử tìm kiếm theo tên đường hoặc quận</p>
                  </div>
                ) : (
                  <>
                    <div className='px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/40 mb-1'>
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
                              ? 'bg-primary/20 text-foreground font-semibold border border-primary/40 shadow-sm'
                              : 'hover:bg-muted text-foreground border border-transparent'
                          )}
                        >
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-1.5'>
                              <h4 className='font-sans font-bold text-xs truncate group-hover:text-primary'>
                                {shop.name}
                              </h4>
                              {shop.opening_hours?.open_now && (
                                <span
                                  className='w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0 animate-pulse'
                                  title='Đang mở cửa'
                                />
                              )}
                            </div>
                            <p className='text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5'>
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
                                  ? 'bg-secondary text-foreground border-border'
                                  : 'bg-secondary text-secondary-foreground border-border'
                              )}
                            >
                              {hasRating ? (
                                <>
                                  <Star size={9} className='fill-amber-gold text-amber-gold' />
                                  {shop.rating.toFixed(1)}
                                </>
                              ) : (
                                <>
                                  <Sparkles size={9} className='text-amber-gold' />
                                  Mới
                                </>
                              )}
                            </Badge>
                            {shop.distance_text && shop.distance_text !== '0 m' && (
                              <span className='text-muted-foreground font-medium hidden sm:inline'>
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
          <div className={cn('flex items-center', isSearchOpen && 'hidden md:flex')}>
            {loading ? (
              <Skeleton className='h-9 w-9 rounded-full' />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-9 w-9 rounded-full p-0 border border-border/60 hover:border-amber-gold/40 hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold cursor-pointer flex-shrink-0'
                    aria-label={`Menu người dùng ${displayName}`}
                  >
                    <Avatar className='h-full w-full'>
                      {avatarUrl && (
                        <AvatarImage src={avatarUrl} alt={displayName} className='object-cover' />
                      )}
                      <AvatarFallback className='bg-secondary text-foreground font-bold text-xs'>
                        {displayName.charAt(0).toUpperCase() || <User size={15} />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-64 bg-popover/95 backdrop-blur-xl border border-border/80 text-popover-foreground shadow-2xl rounded-2xl p-2 space-y-0.5 z-[500]'
                >
                  <DropdownMenuLabel className='font-sans px-3 pt-3 pb-3 border-b border-border/60 select-none'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10 rounded-full border border-border/60 shrink-0'>
                        {avatarUrl && (
                          <AvatarImage src={avatarUrl} alt={displayName} className='object-cover' />
                        )}
                        <AvatarFallback className='bg-secondary text-foreground font-bold text-sm'>
                          {displayName.charAt(0).toUpperCase() || <User size={16} />}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col min-w-0'>
                        <div className='flex items-center gap-1.5 min-w-0'>
                          <span className='text-sm font-bold text-foreground truncate'>
                            {displayName}
                          </span>
                          {badgeTierLabel && (
                            <span className='px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-secondary border border-border/80 text-muted-foreground shrink-0'>
                              {badgeTierLabel}
                            </span>
                          )}
                        </div>
                        <span className='text-[11px] font-normal text-muted-foreground truncate'>
                          {userEmail || 'Người sành cà phê'}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <div className='my-1' />
                  <DropdownMenuItem
                    asChild
                    className='cursor-pointer px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-accent/60 focus:bg-accent focus:text-foreground transition-all duration-200 group'
                  >
                    <Link href={APP_ROUTES.PROFILE} className='flex items-center gap-2.5 w-full'>
                      <User
                        size={16}
                        className='text-muted-foreground group-hover:text-primary transition-colors shrink-0'
                      />
                      <span>Trang cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className='cursor-pointer px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-accent/60 focus:bg-accent focus:text-foreground transition-all duration-200 group'
                  >
                    <Link href={APP_ROUTES.FAVORITES} className='flex items-center gap-2.5 w-full'>
                      <Heart
                        size={16}
                        className='text-muted-foreground group-hover:text-rose-500 transition-colors shrink-0'
                      />
                      <span>Yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className='cursor-pointer px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-accent/60 focus:bg-accent focus:text-foreground transition-all duration-200 group'
                  >
                    <Link href={APP_ROUTES.SETTINGS} className='flex items-center gap-2.5 w-full'>
                      <Settings
                        size={16}
                        className='text-muted-foreground group-hover:text-primary transition-colors shrink-0'
                      />
                      <span>Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem
                      asChild
                      className='cursor-pointer px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-accent/60 focus:bg-accent focus:text-foreground transition-all duration-200 group'
                    >
                      <Link href={APP_ROUTES.ADMIN} className='flex items-center gap-2.5 w-full'>
                        <Shield
                          size={16}
                          className='text-amber-gold group-hover:text-amber-gold transition-colors shrink-0'
                        />
                        <span>Quản trị</span>
                      </Link>
                    </DropdownMenuItem>
                  )}


                  <DropdownMenuSeparator className='bg-border/60 my-1' />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      router.push(APP_ROUTES.LOGIN);
                    }}
                    className='cursor-pointer px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 focus:bg-accent focus:text-foreground transition-all duration-200 flex items-center gap-2.5 group'
                  >
                    <LogOut
                      size={16}
                      className='text-muted-foreground group-hover:text-foreground transition-colors shrink-0'
                    />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-full px-2.5 xs:px-3.5 h-9 shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer'
              >
                <Link href={APP_ROUTES.LOGIN}>
                  <LogIn size={15} />
                  <span className='hidden xs:inline'>Đăng nhập</span>
                </Link>
              </Button>
            )}
          </div>

          {/* RESPONSIVE: mobile nav lives in BottomNav + avatar dropdown; hamburger Sheet was duplicative. */}
        </div>
      </div>
    </header>
  );
}


