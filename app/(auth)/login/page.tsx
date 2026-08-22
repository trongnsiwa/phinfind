'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Welcome back!');
      router.push('/');
    }, 600);
  };

  return (
    <Card className="border-0 shadow-none bg-transparent p-0">
      <CardHeader className="p-0 mb-6 sm:mb-8 space-y-1.5 text-left">
        <CardTitle className="font-sans font-bold text-2xl sm:text-3xl text-cream-white tracking-tight">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-soft-beige/80 leading-relaxed font-body">
          Sign in to access your saved coffee shops and recommendations
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-soft-beige/80 font-semibold text-xs uppercase tracking-wider">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-11 text-sm bg-dark-roast/80 border-dark-border text-cream-white placeholder:text-warm-gray/60 focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl shadow-inner transition-all duration-150"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-soft-beige/80 font-semibold text-xs uppercase tracking-wider">
                Password
              </Label>
              <a href="#" className="text-xs text-amber-gold/70 hover:text-amber-gold font-semibold hover:underline underline-offset-2 transition-colors">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="h-11 text-sm bg-dark-roast/80 border-dark-border text-cream-white placeholder:text-warm-gray/60 focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl pr-11 shadow-inner transition-all duration-150"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-warm-gray hover:text-cream-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-amber-gold to-amber-gold-hover text-dark-bg font-bold rounded-xl py-3 text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer border-0 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-dark-bg/30 border-t-dark-bg animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={16} /> Sign In
              </span>
            )}
          </Button>

          {/* Security Reassurance Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-warm-gray font-medium pt-0.5">
            <ShieldCheck size={13} className="text-amber-gold" />
            <span>256-bit Secure Coffee Passport</span>
          </div>
        </form>

        <div className="flex items-center gap-3 my-3">
          <div className="h-px bg-dark-border/60 flex-1" />
          <span className="text-[10px] text-warm-gray font-bold uppercase tracking-wider select-none bg-transparent">
            Or
          </span>
          <div className="h-px bg-dark-border/60 flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            toast.success('Welcome back!');
            router.push('/');
          }}
          className="w-full h-11 gap-2.5 border border-dark-border bg-dark-roast/40 hover:bg-dark-roast/70 hover:border-amber-gold/30 text-soft-beige hover:text-cream-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign in with Google
        </Button>

        <p className="text-center text-xs text-soft-beige/80 pt-1">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-amber-gold hover:text-amber-gold-hover font-semibold hover:underline underline-offset-2 transition-colors">
            Create one now
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
