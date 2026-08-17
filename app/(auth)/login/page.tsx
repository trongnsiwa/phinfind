'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Welcome back!');
    router.push('/');
  };

  return (
    <Card className="border-0 shadow-none bg-transparent p-0">
      <CardHeader className="text-center p-0 mb-6 space-y-1">
        <CardTitle className="font-display font-bold text-xl text-phin-900">Welcome Back</CardTitle>
        <CardDescription className="text-xs text-phin-600">
          Sign in to access your saved coffee shops
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-phin-800">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-10 text-xs bg-phin-50 border-phin-200 text-phin-900 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-phin-800">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-10 text-xs bg-phin-50 border-phin-200 text-phin-900 focus-visible:ring-primary"
            />
          </div>

          <Button type="submit" variant="default" className="w-full h-10 bg-phin-800 text-white hover:bg-phin-900 font-semibold">
            Sign In
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <Separator className="bg-phin-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-phin-500 font-medium uppercase tracking-wider absolute">
            Or
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            toast.success('Welcome back!');
            router.push('/');
          }}
          className="w-full h-10 gap-2 border-phin-200 text-phin-800 hover:bg-phin-50 text-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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

        <p className="text-center text-xs text-phin-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
