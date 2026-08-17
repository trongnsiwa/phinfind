'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, LogOut, Settings, User as UserIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      username: profile?.username || '',
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card text-center space-y-4">
        <Avatar className="w-20 h-20 border-2 border-primary mx-auto shadow-inner">
          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Profile'} />
          <AvatarFallback className="bg-phin-100 text-primary text-2xl font-bold">
            <UserIcon size={36} />
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-display font-bold text-xl text-phin-900">
            {profile?.full_name || user?.email || 'Coffee Explorer'}
          </h2>
          <p className="text-xs text-phin-600 mt-0.5">
            {isAuthenticated ? user?.email : 'Guest Explorer'}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs border-phin-200"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
            >
              <LogOut size={14} /> Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="default" size="sm" asChild className="gap-1.5 bg-phin-800 text-white">
              <Link href="/login">
                <LogIn size={14} /> Sign In
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="border-phin-200">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Profile Form (if authenticated and editing mode) */}
      {isAuthenticated && isEditing && (
        <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-display text-base text-phin-900">Edit Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-phin-900">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" className="h-9 text-xs border-phin-200" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-phin-900">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" className="h-9 text-xs border-phin-200" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="w-full bg-phin-800 text-white">
                  <Save size={14} className="mr-1.5" /> Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* App Info Card */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="font-display font-bold text-sm text-phin-900 flex items-center gap-2">
            <Settings size={16} className="text-primary" /> Application Info
          </CardTitle>
        </CardHeader>
        <Separator className="bg-phin-100" />
        <CardContent className="p-0 space-y-2 text-xs text-phin-700">
          <div className="flex justify-between py-1 border-b border-phin-50">
            <span>App Name</span>
            <span className="font-medium text-phin-900">PhinFind PWA</span>
          </div>
          <div className="flex justify-between py-1 border-b border-phin-50">
            <span>Version</span>
            <span className="font-medium text-phin-900">0.1.0 MVP</span>
          </div>
          <div className="flex justify-between py-1 border-b border-phin-50">
            <span>Default City</span>
            <span className="font-medium text-phin-900">Hà Nội, Vietnam</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Status</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-semibold text-[10px]">
              shadcn UI Enabled
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
