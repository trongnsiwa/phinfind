'use client';

import Link from 'next/link';
import { Button } from '@/components/common/Button';

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-phin-900">Create Account</h2>
        <p className="text-xs text-phin-600 mt-1">Join PhinFind to start discovering coffee</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-semibold text-phin-800 mb-1">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full h-10 px-3 text-xs bg-phin-50 text-phin-900 border border-phin-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-phin-800 mb-1">Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full h-10 px-3 text-xs bg-phin-50 text-phin-900 border border-phin-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-phin-800 mb-1">Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            className="w-full h-10 px-3 text-xs bg-phin-50 text-phin-900 border border-phin-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <Button type="submit" variant="primary" className="w-full h-10">
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-phin-600">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
