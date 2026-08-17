'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account created!');
    router.push('/');
  };

  return (
    <Card className="border-0 shadow-none bg-transparent p-0">
      <CardHeader className="text-center p-0 mb-6 space-y-1">
        <CardTitle className="font-display font-bold text-xl text-phin-900">Create Account</CardTitle>
        <CardDescription className="text-xs text-phin-600">
          Join PhinFind to start discovering coffee
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="space-y-1.5">
            <Label htmlFor="fullname" className="text-xs font-semibold text-phin-800">
              Full Name
            </Label>
            <Input
              id="fullname"
              type="text"
              placeholder="John Doe"
              required
              className="h-10 text-xs bg-phin-50 border-phin-200 text-phin-900 focus-visible:ring-primary"
            />
          </div>

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
              placeholder="Minimum 8 characters"
              required
              className="h-10 text-xs bg-phin-50 border-phin-200 text-phin-900 focus-visible:ring-primary"
            />
          </div>

          <Button type="submit" variant="default" className="w-full h-10 bg-phin-800 text-white hover:bg-phin-900 font-semibold">
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-phin-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
