'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState('');
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        toast.success('Account created successfully!');
        router.push(redirect);
        router.refresh();
      } else {
        toast.info('Please check your email to confirm your account.');
        router.push(`/login${redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`);
      }
    } catch {
      toast.error('An unexpected error occurred during registration');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.info('Google Sign-In is coming soon! Stay tuned ☕', {
      duration: 4000,
    });
  };

  return (
    <Card className="border-0 shadow-none bg-transparent p-0">
      <CardHeader className="p-0 mb-6 sm:mb-8 space-y-1.5 text-left">
        <CardTitle className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
          Create Account
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-[#D0D0D0]/80 leading-relaxed font-body">
          Join PhinFind to start discovering authentic coffee spots
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-[#D0D0D0]/80 font-semibold text-xs uppercase tracking-wider">
              Full Name
            </Label>
            <Input
              id="fullname"
              type="text"
              placeholder="e.g. Linh Nguyen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 text-sm bg-[#141414]/80 border-[#2A2A2A] text-white placeholder:text-[#A0A0A0]/60 focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl shadow-inner transition-all duration-150"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#D0D0D0]/80 font-semibold text-xs uppercase tracking-wider">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 text-sm bg-[#141414]/80 border-[#2A2A2A] text-white placeholder:text-[#A0A0A0]/60 focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl shadow-inner transition-all duration-150"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#D0D0D0]/80 font-semibold text-xs uppercase tracking-wider">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
                className="h-11 text-sm bg-[#141414]/80 border-[#2A2A2A] text-white placeholder:text-[#A0A0A0]/60 focus-visible:ring-2 focus-visible:ring-amber-gold/30 focus-visible:border-amber-gold rounded-xl pr-11 shadow-inner transition-all duration-150"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-[#A0A0A0] hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-amber-gold to-amber-gold-hover text-[#101010] font-bold rounded-xl py-3 text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer border-0 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#101010]/30 border-t-[#101010] animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={16} /> Create Account
              </span>
            )}
          </Button>

          {/* Security Reassurance Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A0A0A0] font-medium pt-0.5">
            <ShieldCheck size={13} className="text-amber-gold" />
            <span>Free forever &amp; privacy guaranteed</span>
          </div>
        </form>

        <div className="flex items-center gap-3 my-3">
          <div className="h-px bg-[#2A2A2A]/60 flex-1" />
          <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider select-none bg-transparent">
            Or
          </span>
          <div className="h-px bg-[#2A2A2A]/60 flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
          className="w-full h-11 gap-2.5 border border-[#2A2A2A] bg-[#141414]/40 hover:bg-[#141414]/70 hover:border-amber-gold/30 text-[#D0D0D0] hover:text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
          Sign up with Google
        </Button>

        <p className="text-center text-xs text-[#D0D0D0]/80 pt-1">
          Already have an account?{' '}
          <Link
            href={`/login${redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-amber-gold hover:text-amber-gold-hover font-semibold hover:underline underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-amber-gold/30 border-t-amber-gold animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
