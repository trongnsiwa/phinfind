'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, LogOut, Settings, User as UserIcon, Save, Heart, MapPin, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
import { useShopStore } from '@/stores/useShopStore';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { favorites } = useShopStore();
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
      {/* Cover Image & Profile Avatar Header Card */}
      <Card className="p-0 bg-white rounded-3xl border border-phin-200 shadow-card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-phin-900 via-phin-800 to-phin-700 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        </div>

        <CardContent className="p-6 text-center space-y-4 relative pt-0">
          <Avatar className="w-20 h-20 border-4 border-white mx-auto shadow-md -mt-10 bg-white">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Profile'} />
            <AvatarFallback className="bg-phin-100 text-primary text-2xl font-bold">
              <UserIcon size={36} />
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-sans font-bold text-xl text-phin-900">
              {profile?.full_name || user?.email || 'Coffee Explorer'}
            </h2>
            <p className="text-xs text-phin-600 mt-0.5">
              {isAuthenticated ? user?.email : 'Guest Explorer · Vietnamese Coffee Enthusiast'}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs border-phin-200 rounded-xl"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 text-xs rounded-xl"
              >
                <LogOut size={14} /> Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 pt-1">
              <Button variant="default" size="sm" asChild className="gap-1.5 bg-phin-800 text-white hover:bg-phin-900 rounded-xl">
                <Link href="/login">
                  <LogIn size={14} /> Sign In
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="border-phin-200 rounded-xl">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Stats Counter Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3.5 bg-white border border-phin-200 shadow-sm rounded-2xl text-center space-y-1">
          <Heart size={18} className="mx-auto text-rose-500" />
          <span className="font-sans font-bold text-lg text-phin-900 block leading-tight">
            {favorites.length}
          </span>
          <span className="text-[10px] text-phin-600 font-medium uppercase tracking-wider block">Favorites</span>
        </Card>

        <Card className="p-3.5 bg-white border border-phin-200 shadow-sm rounded-2xl text-center space-y-1">
          <MapPin size={18} className="mx-auto text-primary" />
          <span className="font-sans font-bold text-lg text-phin-900 block leading-tight">
            12
          </span>
          <span className="text-[10px] text-phin-600 font-medium uppercase tracking-wider block">Visits</span>
        </Card>

        <Card className="p-3.5 bg-white border border-phin-200 shadow-sm rounded-2xl text-center space-y-1">
          <Award size={18} className="mx-auto text-amber-500" />
          <span className="font-sans font-bold text-lg text-phin-900 block leading-tight">
            Bronze
          </span>
          <span className="text-[10px] text-phin-600 font-medium uppercase tracking-wider block">Badge</span>
        </Card>
      </div>

      {/* Edit Profile Form */}
      {isAuthenticated && isEditing && (
        <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-sans text-base text-phin-900">Edit Profile Details</CardTitle>
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
                        <Input placeholder="Your full name" className="h-9 text-xs border-phin-200 rounded-xl" {...field} />
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
                        <Input placeholder="username" className="h-9 text-xs border-phin-200 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="w-full bg-phin-800 text-white hover:bg-phin-900 rounded-xl font-semibold">
                  <Save size={14} className="mr-1.5" /> Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Application Settings & Info */}
      <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card space-y-3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="font-sans font-bold text-sm text-phin-900 flex items-center gap-2">
            <Settings size={16} className="text-primary" /> Application Settings
          </CardTitle>
        </CardHeader>
        <Separator className="bg-phin-100" />
        <CardContent className="p-0 space-y-2.5 text-xs text-phin-700">
          <div className="flex justify-between items-center py-1 border-b border-phin-50">
            <span>App Name</span>
            <span className="font-semibold text-phin-900">PhinFind PWA</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-phin-50">
            <span>Version</span>
            <span className="font-semibold text-phin-900">1.0.0 Production</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-phin-50">
            <span>Default Location</span>
            <span className="font-semibold text-phin-900">Hà Nội, Vietnam</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>PWA Status</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-bold text-[10px]">
              Ready / Online
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
