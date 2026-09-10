'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function ForgotPasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email.');
      return;
    }

    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        toast.error(error.message || 'Đã xảy ra lỗi khi gửi email.');
      } else {
        toast.success('Đã gửi liên kết khôi phục mật khẩu!');
      }
      // Always show success state to prevent account enumeration
      setIsSubmitted(true);
    } catch {
      toast.error('Đã xảy ra lỗi trong quá trình gửi yêu cầu.');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardHeader className="p-0 mb-6 sm:mb-8 space-y-2 text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold mb-2 shadow-sm">
            <Mail size={24} />
          </div>
          <CardTitle className="font-sans font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Kiểm tra email của bạn
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
            Nếu có tài khoản PhinFind liên kết với <span className="font-semibold text-foreground">{email}</span>, bạn sẽ nhận được một liên kết để đặt lại mật khẩu trong vài phút.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          <div className="rounded-xl border border-border bg-input-bg/60 p-4 text-xs text-muted-foreground leading-relaxed">
            Vui lòng kiểm tra hộp thư đến (bao gồm cả thư mục Spam hoặc Rác). Nếu bạn không nhận được email sau ít phút, hãy thử lại.
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="w-full h-11 border border-border bg-card/60 hover:bg-muted text-foreground text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
          >
            Gửi lại hoặc thử email khác
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
          Quên Mật Khẩu
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
          Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
              Địa chỉ email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 text-sm bg-input-bg border-border text-foreground focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl shadow-inner transition-all duration-150"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-amber-gold to-amber-gold-hover text-phin-950 font-bold rounded-xl py-3 text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer border-0 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                Đang gửi yêu cầu...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send size={16} /> Gửi liên kết đặt lại
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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-gold/30 border-t-amber-gold animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
