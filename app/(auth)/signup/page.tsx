'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Account created successfully!');
      router.push('/');
    }, 600);
  };

  return (
    <Card className="border-0 shadow-none bg-transparent p-0">
      <CardHeader className="p-0 mb-6 space-y-1 text-left">
        <CardTitle className="font-sans font-bold text-2xl text-phin-900">Create Account</CardTitle>
        <CardDescription className="text-xs text-phin-600">
          Join PhinFind to start discovering authentic coffee spots
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="space-y-1.5">
            <Label htmlFor="fullname" className="text-xs font-bold text-phin-900">
              Full Name
            </Label>
            <Input
              id="fullname"
              type="text"
              placeholder="John Doe"
              required
              className="h-10 text-xs bg-phin-50/70 border-phin-200 text-phin-900 focus-visible:ring-primary rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-phin-900">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-10 text-xs bg-phin-50/70 border-phin-200 text-phin-900 focus-visible:ring-primary rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-phin-900">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="h-10 text-xs bg-phin-50/70 border-phin-200 text-phin-900 focus-visible:ring-primary rounded-xl pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-phin-500 hover:text-phin-900"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-phin-800 text-white hover:bg-phin-900 font-semibold rounded-xl shadow-md text-xs"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={15} /> Create Account
              </span>
            )}
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
