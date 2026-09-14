'use client';

import Link from 'next/link';
import {
  Laptop,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  RotateCw,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  Sun
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { APP_ROUTES, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { Theme, useThemeStore } from '@/stores/useThemeStore';
import { toast } from 'sonner';

export function SettingsClient() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const { isFallback, refetchLocation } = useLocation();

  const handleThemeSelect = (val: string) => {
    setTheme(val as Theme);
    toast.success(
      `Đã chuyển giao diện sang: ${val === 'dark' ? 'Tối' : val === 'light' ? 'Sáng' : 'Theo hệ thống'}`
    );
  };

  return (
    <div className='max-w-2xl mx-auto space-y-6 pb-16'>
      {/* Top Header */}
      <div className='pb-3 border-b border-border'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0'>
            <SettingsIcon size={18} />
          </div>
          <div>
            <h1 className='font-sans font-bold text-xl sm:text-2xl text-foreground tracking-tight'>
              Cài Đặt Ứng Dụng
            </h1>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              Tùy chỉnh cấu hình, giao diện và thông tin hệ thống
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-5'>
        {/* Section 1: Giao diện (Appearance) */}
        <Card className='bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-card space-y-4'>
          <div className='flex items-center gap-2.5 pb-2 border-b border-border/60'>
            <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
              <Moon size={16} />
            </div>
            <div>
              <h2 className='font-sans font-bold text-sm sm:text-base text-foreground'>
                Giao diện
              </h2>
              <p className='text-[11px] sm:text-xs text-muted-foreground'>
                Tùy biến hiển thị màu sắc và chế độ sáng tối
              </p>
            </div>
          </div>

          {/* RESPONSIVE: gap-3 and min-w-0 truncate prevent collisions with controls at 320px */}
          <div className='space-y-4'>
            {/* Quick Switch for Dark Mode */}
            <div className='flex justify-between items-center py-1 border-b border-border/40 gap-3'>
              <div className='space-y-0.5 pr-2 sm:pr-4 min-w-0'>
                <span className='text-xs sm:text-sm font-medium text-foreground block truncate'>
                  Chế độ tối (Dark Mode)
                </span>
                <span className='text-[11px] text-muted-foreground block truncate'>
                  Chuyển nhanh giữa chế độ sáng và tối
                </span>
              </div>
              <Switch
                className='shrink-0'
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label='Chuyển đổi giao diện tối'
              />
            </div>

            {/* Detailed Theme Selector: Light / Dark / System */}
            <div className='flex justify-between items-center py-1 gap-3'>
              <div className='space-y-0.5 pr-2 sm:pr-4 min-w-0'>
                <span className='text-xs sm:text-sm font-medium text-foreground block truncate'>
                  Chủ đề hiển thị
                </span>
                <span className='text-[11px] text-muted-foreground block truncate'>
                  Lựa chọn tông màu sáng, tối hoặc đồng bộ thiết bị
                </span>
              </div>
              <Select value={theme} onValueChange={handleThemeSelect}>
                <SelectTrigger className='w-28 sm:w-36 h-9 text-xs rounded-xl border-border bg-secondary/30 shrink-0'>
                  <SelectValue placeholder='Chọn chủ đề' />
                </SelectTrigger>
                <SelectContent className='rounded-xl border-border bg-card'>
                  <SelectItem value='light' className='text-xs cursor-pointer'>
                    <div className='flex items-center gap-2'>
                      <Sun size={14} className='text-amber-500' />
                      <span>Sáng</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='dark' className='text-xs cursor-pointer'>
                    <div className='flex items-center gap-2'>
                      <Moon size={14} className='text-primary' />
                      <span>Tối</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='system' className='text-xs cursor-pointer'>
                    <div className='flex items-center gap-2'>
                      <Laptop size={14} className='text-muted-foreground' />
                      <span>Hệ thống</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Section 2: Vị trí (Location & Discovery) */}
        <Card className='bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-card space-y-4'>
          <div className='flex items-center gap-2.5 pb-2 border-b border-border/60'>
            <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
              <MapPin size={16} />
            </div>
            <div>
              <h2 className='font-sans font-bold text-sm sm:text-base text-foreground'>
                Vị trí & Tìm kiếm
              </h2>
              <p className='text-[11px] sm:text-xs text-muted-foreground'>
                Cài đặt định vị tọa độ và bán kính khám phá quán
              </p>
            </div>
          </div>

          <div className='space-y-3.5 text-xs sm:text-sm'>
            <div className='flex justify-between items-center py-1 border-b border-border/40 gap-3'>
              <span className='text-muted-foreground min-w-0 truncate'>Vị trí mặc định</span>
              <span className='font-semibold text-foreground shrink-0'>{DEFAULT_LOCATION.name}</span>
            </div>

            <div className='flex justify-between items-center py-1 border-b border-border/40 gap-3'>
              <div className='space-y-0.5 min-w-0'>
                <span className='text-muted-foreground block truncate'>Định vị GPS</span>
                <span className='text-[11px] text-muted-foreground/80 block truncate'>
                  {isFallback
                    ? 'Đang sử dụng vị trí mặc định'
                    : 'Đã xác định vị trí thực tế của bạn'}
                </span>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                <Badge
                  variant='outline'
                  className={
                    isFallback
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold text-[10px]'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[10px]'
                  }
                >
                  {isFallback ? 'Vị trí mặc định' : 'Chính xác'}
                </Badge>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    refetchLocation();
                    toast.info('Đang cập nhật tọa độ GPS...');
                  }}
                  className='h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground rounded-lg gap-1 cursor-pointer'
                >
                  <RotateCw size={12} /> Cập nhật
                </Button>
              </div>
            </div>

            <div className='flex justify-between items-center py-1 gap-3'>
              <span className='text-muted-foreground min-w-0 truncate'>Bán kính tìm kiếm</span>
              <span className='font-semibold text-foreground shrink-0'>3.0 km (Mặc định)</span>
            </div>
          </div>
        </Card>

        {/* Section 3: Ứng dụng & PWA (Application) */}
        <Card className='bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-card space-y-4'>
          <div className='flex items-center gap-2.5 pb-2 border-b border-border/60'>
            <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
              <Smartphone size={16} />
            </div>
            <div>
              <h2 className='font-sans font-bold text-sm sm:text-base text-foreground'>Ứng dụng</h2>
              <p className='text-[11px] sm:text-xs text-muted-foreground'>
                Thông tin phiên bản và nền tảng ứng dụng PhinFind
              </p>
            </div>
          </div>

          <div className='space-y-3.5 text-xs sm:text-sm'>
            <div className='flex justify-between items-center py-1 border-b border-border/40 gap-3'>
              <span className='text-muted-foreground min-w-0 truncate'>Tên ứng dụng</span>
              <span className='font-semibold text-foreground shrink-0'>PhinFind</span>
            </div>
            <div className='flex justify-between items-center py-1 border-b border-border/40 gap-3'>
              <span className='text-muted-foreground min-w-0 truncate'>Phiên bản</span>
              <span className='font-semibold text-foreground shrink-0'>1.0.0 Bản phát hành</span>
            </div>
            <div className='flex justify-between items-center py-1 gap-3'>
              <span className='text-muted-foreground min-w-0 truncate'>Trạng thái PWA</span>
              <Badge
                variant='outline'
                className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[10px] shrink-0'
              >
                Sẵn sàng / Trực tuyến
              </Badge>
            </div>
          </div>
        </Card>

        {/* Section 4: Tài khoản & Phiên đăng nhập (Account & Actions) */}
        <Card className='bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-card space-y-4'>
          <div className='flex items-center gap-2.5 pb-2 border-b border-border/60'>
            <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
              <ShieldCheck size={16} />
            </div>
            <div>
              <h2 className='font-sans font-bold text-sm sm:text-base text-foreground'>
                Tài khoản
              </h2>
              <p className='text-[11px] sm:text-xs text-muted-foreground'>
                Quản lý trạng thái xác thực và phiên làm việc
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className='space-y-4'>
              <div className='space-y-3.5 text-xs sm:text-sm'>
                <div className='flex justify-between items-center py-1 border-b border-border/40 gap-3'>
                  <span className='text-muted-foreground min-w-0 truncate'>Tài khoản đăng nhập</span>
                  <span className='font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs shrink-0'>
                    {user?.email}
                  </span>
                </div>
                <div className='flex justify-between items-center py-1 gap-3'>
                  <span className='text-muted-foreground min-w-0 truncate'>Trạng thái</span>
                  <Badge
                    variant='outline'
                    className='bg-primary/10 text-primary border-primary/30 font-semibold text-[10px] shrink-0'
                  >
                    Đã xác thực
                  </Badge>
                </div>
              </div>

              <div className='pt-2'>
                <Button
                  variant='outline'
                  onClick={signOut}
                  className='w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 rounded-2xl py-2.5 h-auto text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors'
                >
                  <LogOut size={16} />
                  Đăng xuất khỏi tài khoản
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              <p className='text-xs text-muted-foreground'>
                Bạn chưa đăng nhập. Hãy đăng nhập để lưu trữ quán cà phê yêu thích và đồng bộ dữ
                liệu.
              </p>
              <div className='flex flex-col sm:flex-row gap-2.5 pt-1'>
                <Button
                  asChild
                  size='sm'
                  className='flex-1 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl text-xs font-semibold cursor-pointer'
                >
                  <Link href={APP_ROUTES.LOGIN}>
                    <LogIn size={14} className='mr-1.5' /> Đăng nhập ngay
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  size='sm'
                  className='flex-1 border-border rounded-xl text-xs font-semibold cursor-pointer'
                >
                  <Link href={APP_ROUTES.SIGNUP}>Tạo tài khoản mới</Link>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
