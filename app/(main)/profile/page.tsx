'use client';

import Link from 'next/link';
import { LogIn, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-phin-100 border-2 border-primary text-primary flex items-center justify-center mx-auto shadow-inner">
          <UserIcon size={36} />
        </div>

        <div>
          <h2 className="font-display font-bold text-xl text-phin-900">
            {profile?.full_name || user?.email || 'Coffee Explorer'}
          </h2>
          <p className="text-xs text-phin-600 mt-0.5">
            {isAuthenticated ? user?.email : 'Guest Explorer'}
          </p>
        </div>

        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={signOut} className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50">
            <LogOut size={14} /> Sign Out
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button variant="primary" size="sm" className="gap-1.5">
                <LogIn size={14} /> Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="sm">
                Create Account
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-3">
        <h3 className="font-bold text-sm text-phin-900 border-b border-phin-100 pb-2 flex items-center gap-2">
          <Settings size={16} className="text-primary" /> Application Info
        </h3>
        <div className="space-y-2 text-xs text-phin-700">
          <div className="flex justify-between py-1 border-b border-phin-50">
            <span>App Name</span>
            <span className="font-medium text-phin-900">PhinFind PWA</span>
          </div>
          <div className="flex justify-between py-1 border-b border-phin-50">
            <span>Version</span>
            <span className="font-medium text-phin-900">0.1.0 MVP (Phase 0)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-phin-50">
            <span>Default City</span>
            <span className="font-medium text-phin-900">Hà Nội, Vietnam</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Status</span>
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Phase 0 Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
