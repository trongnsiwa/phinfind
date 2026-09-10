'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Session verification: 'checking' | 'valid' | 'invalid'
  const [sessionState, setSessionState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [expiredMessage, setExpiredMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      // Check query and hash parameters for Supabase auth error flags
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription =
        searchParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        if (isMounted) {
          setSessionState('invalid');
          setExpiredMessage(
            errorDescription || 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.'
          );
        }
        return;
      }

      // If PKCE code exists in searchParams, exchange it
      const code = searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (isMounted) {
            setSessionState('invalid');
            setExpiredMessage(exchangeError.message || 'Liên kết đặt lại mật khẩu không hợp lệ.');
          }
          return;
        }
      }

      // Check current session
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (isMounted) {
        if (sessionError || !data?.session) {
          setSessionState('invalid');
          setExpiredMessage('Không tìm thấy phiên khôi phục hợp lệ hoặc liên kết đã hết hạn.');
        } else {
          setSessionState('valid');
        }
      }
    };

    // Also listen for PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionState('valid');
      }
    });

    verifySession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (password.length < 8) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp.');
      hasError = true;
    } else {
      setConfirmError('');
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message || 'Không thể cập nhật mật khẩu.');
        setIsLoading(false);
        return;
      }

      toast.success('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      toast.error('Đã xảy ra lỗi trong quá trình cập nhật mật khẩu.');
      setIsLoading(false);
    }
  };

  if (sessionState === 'checking') {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-gold/30 border-t-amber-gold animate-spin" />
        <p className="text-xs text-muted-foreground">Đang xác thực liên kết...</p>
      </div>
    );
  }

  if (sessionState === 'invalid') {
    return (
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardHeader className="p-0 mb-6 sm:mb-8 space-y-2 text-left">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2 shadow-sm">
            <AlertCircle size={24} />
          </div>
          <CardTitle className="font-sans font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Liên Kết Không Hợp Lệ
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
            {expiredMessage || 'Liên kết đặt lại mật khẩu này đã hết hạn hoặc đã được sử dụng.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          <Button
            asChild
            className="w-full h-11 bg-gradient-to-r from-amber-gold to-amber-gold-hover text-phin-950 font-bold rounded-xl py-3 text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-0"
          >
            <Link href="/forgot-password">Yêu cầu liên kết mới</Link>
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-amber-gold hover:text-amber-gold-hover font-semibold hover:underline underline-offset-2 transition-colors"
            >
              <ArrowLeft size={14} /> Quay lại đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent p-0">
      <CardHeader className="p-0 mb-6 sm:mb-8 space-y-1.5 text-left">
        <CardTitle className="font-sans font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
          Đặt Lại Mật Khẩu
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
          Nhập mật khẩu mới cho tài khoản của bạn (tối thiểu 8 ký tự)
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        <form className="space-y-4" onSubmit={handleReset}>
          <div className="space-y-2">
            <Label
              htmlFor="new-password"
              className="text-muted-foreground font-semibold text-xs uppercase tracking-wider"
            >
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                disabled={isLoading}
                required
                minLength={8}
                className="h-11 text-sm bg-input-bg border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl pr-11 shadow-inner transition-all duration-150"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full cursor-pointer transition-colors focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:outline-none"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {passwordError && <p className="text-xs text-destructive mt-1">{passwordError}</p>}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-muted-foreground font-semibold text-xs uppercase tracking-wider"
            >
              Xác nhận mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) setConfirmError('');
                }}
                disabled={isLoading}
                required
                minLength={8}
                className="h-11 text-sm bg-input-bg border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl pr-11 shadow-inner transition-all duration-150"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full cursor-pointer transition-colors focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:outline-none"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {confirmError && <p className="text-xs text-destructive mt-1">{confirmError}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-amber-gold to-amber-gold-hover text-phin-950 font-bold rounded-xl py-3 text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer border-0 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                Đang lưu mật khẩu...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <KeyRound size={16} /> Cập nhật mật khẩu
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground pt-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-amber-gold hover:text-amber-gold-hover font-semibold hover:underline underline-offset-2 transition-colors"
          >
            <ArrowLeft size={14} /> Quay lại đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-gold/30 border-t-amber-gold animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
