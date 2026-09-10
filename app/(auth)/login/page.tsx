'use client';

import { Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted && data?.session) {
        router.replace(redirect);
      }
    };
    checkSession();
    return () => {
      isMounted = false;
    };
  }, [supabase, router, redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập cả email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message || 'Email hoặc mật khẩu không hợp lệ');
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        toast.success('Chào mừng bạn quay trở lại!');
        router.push(redirect);
        router.refresh();
      }
    } catch {
      toast.error('Đã xảy ra lỗi trong quá trình đăng nhập');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error('Đăng nhập bằng Google không thành công. Vui lòng thử lại.');
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = new URL('/auth/callback', window.location.origin);
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        redirectUrl.searchParams.set('redirect', redirectParam);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString()
        }
      });

      if (error) {
        toast.error(error.message || 'Đăng nhập bằng Google thất bại');
        setIsLoading(false);
      }
    } catch {
      toast.error('Đã xảy ra lỗi trong quá trình kết nối với Google');
      setIsLoading(false);
    }
  };

  return (
    <Card className='border-0 shadow-none bg-transparent p-0'>
      <CardHeader className='p-0 mb-6 sm:mb-8 space-y-1.5 text-left'>
        <CardTitle className='font-sans font-bold text-2xl sm:text-3xl text-foreground tracking-tight'>
          Chào Mừng Trở Lại
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm text-muted-foreground leading-relaxed font-body'>
          Đăng nhập để xem các quán cà phê đã lưu và gợi ý dành riêng cho bạn
        </CardDescription>
      </CardHeader>

      <CardContent className='p-0 space-y-5'>
        <form className='space-y-4' onSubmit={handleLogin}>
          <div className='space-y-2'>
            <Label
              htmlFor='email'
              className='text-muted-foreground font-semibold text-xs uppercase tracking-wider'
            >
              Địa chỉ email
            </Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className='h-11 text-sm bg-input-bg border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl shadow-inner transition-all duration-150'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <Label
                htmlFor='password'
                className='text-muted-foreground font-semibold text-xs uppercase tracking-wider'
              >
                Mật khẩu
              </Label>
              <Link
                href='/forgot-password'
                className='text-xs text-amber-gold/70 hover:text-amber-gold font-semibold hover:underline underline-offset-2 transition-colors'
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className='h-11 text-sm bg-input-bg border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl pr-11 shadow-inner transition-all duration-150'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full cursor-pointer transition-colors focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:outline-none'
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full h-11 bg-gradient-to-r from-amber-gold to-amber-gold-hover text-phin-950 font-bold rounded-xl py-3 text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer border-0 mt-2 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <span className='flex items-center gap-2'>
                <span className='w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin' />
                Đang đăng nhập...
              </span>
            ) : (
              <span className='flex items-center gap-2'>
                <LogIn size={16} /> Đăng nhập
              </span>
            )}
          </Button>

          {/* Security Reassurance Badge */}
          {/* <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-medium pt-0.5">
            <ShieldCheck size={13} className="text-amber-gold" />
            <span>Hộ chiếu Cà phê Bảo mật 256-bit</span>
          </div> */}
        </form>

        <div className='flex items-center gap-3 my-3'>
          <div className='h-px bg-border flex-1' />
          <span className='text-[10px] text-muted-foreground font-bold uppercase tracking-wider select-none bg-transparent'>
            Hoặc
          </span>
          <div className='h-px bg-border flex-1' />
        </div>

        <Button
          type='button'
          variant='outline'
          disabled={isLoading}
          onClick={handleGoogleSignIn}
          className='w-full h-11 gap-2.5 border border-border bg-card/60 hover:bg-muted hover:border-amber-gold/50 text-foreground text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
        >
          <svg className='w-4 h-4 shrink-0' viewBox='0 0 24 24'>
            <path
              fill='#4285F4'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='#34A853'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='#FBBC05'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z'
            />
            <path
              fill='#EA4335'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z'
            />
          </svg>
          Đăng nhập bằng Google
        </Button>

        <p className='text-center text-xs text-muted-foreground pt-1'>
          Chưa có tài khoản?{' '}
          <Link
            href={`/signup${redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className='text-amber-gold hover:text-amber-gold-hover font-semibold hover:underline underline-offset-2 transition-colors'
          >
            Tạo tài khoản ngay
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-[300px] flex items-center justify-center'>
          <div className='w-8 h-8 rounded-full border-2 border-amber-gold/30 border-t-amber-gold animate-spin' />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
