'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: 'app' | 'auth';
  scope?: 'root' | 'main' | 'auth';
}

export function ErrorFallback({
  error,
  reset,
  variant = 'app',
  scope = 'main',
}: ErrorFallbackProps) {
  const isAuth = variant === 'auth' || scope === 'auth';
  const isFullScreen = scope === 'root' || scope === 'auth';
  const Icon = isAuth ? AlertTriangle : Coffee;

  const title = isAuth ? 'Không thể tải trang đăng nhập' : 'Đã xảy ra lỗi';
  const description = isAuth
    ? 'Vui lòng thử lại hoặc quay lại sau.'
    : 'Rất tiếc, đã có sự cố xảy ra. Vui lòng thử lại hoặc quay về trang chủ.';

  return (
    <div
      className={cn(
        'flex items-center justify-center px-4',
        isFullScreen ? 'min-h-screen' : 'min-h-[60vh]'
      )}
    >
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-card p-6 sm:p-8 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-gold/10 border border-amber-gold/30 flex items-center justify-center text-amber-gold mx-auto">
          <Icon size={32} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left text-xs bg-muted/60 p-3 rounded-xl border border-border overflow-hidden">
            <summary className="cursor-pointer font-medium text-foreground select-none">
              Chi tiết lỗi (Development only)
            </summary>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
              {error?.message && (
                <p>
                  <span className="font-semibold text-foreground">Message:</span> {error.message}
                </p>
              )}
              {error?.digest && (
                <p>
                  <span className="font-semibold text-foreground">Digest:</span> {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold rounded-xl h-10 px-4 text-xs cursor-pointer flex-1"
          >
            Thử lại
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border font-bold rounded-xl h-10 px-4 text-xs cursor-pointer flex-1"
          >
            <Link href={isAuth ? '/login' : '/'}>
              {isAuth ? 'Về trang đăng nhập' : 'Về trang chủ'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
