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
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
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
    toast.success('Cập nhật hồ sơ thành công!');
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
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Hồ sơ'} />
            <AvatarFallback className="bg-phin-100 text-primary text-2xl font-bold">
              <UserIcon size={36} />
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-sans font-bold text-xl text-phin-900">
              {profile?.full_name || user?.email || 'Tín Đồ Cà Phê'}
            </h2>
            <p className="text-xs text-phin-600 mt-0.5">
              {isAuthenticated ? user?.email : 'Khách khám phá · Người yêu thích cà phê Việt'}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs border-phin-200 rounded-xl cursor-pointer"
              >
                {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 text-xs rounded-xl cursor-pointer"
              >
                <LogOut size={14} /> Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 pt-1">
              <Button variant="default" size="sm" asChild className="gap-1.5 bg-phin-800 text-white hover:bg-phin-900 rounded-xl cursor-pointer">
                <Link href="/login">
                  <LogIn size={14} /> Đăng nhập
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="border-phin-200 rounded-xl cursor-pointer">
                <Link href="/signup">Tạo tài khoản</Link>
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
          <span className="text-[10px] text-phin-600 font-medium uppercase tracking-wider block">Đã lưu</span>
        </Card>

        <Card className="p-3.5 bg-white border border-phin-200 shadow-sm rounded-2xl text-center space-y-1">
          <MapPin size={18} className="mx-auto text-primary" />
          <span className="font-sans font-bold text-lg text-phin-900 block leading-tight">
            12
          </span>
          <span className="text-[10px] text-phin-600 font-medium uppercase tracking-wider block">Đã ghé</span>
        </Card>

        <Card className="p-3.5 bg-white border border-phin-200 shadow-sm rounded-2xl text-center space-y-1">
          <Award size={18} className="mx-auto text-amber-500" />
          <span className="font-sans font-bold text-lg text-phin-900 block leading-tight">
            Đồng
          </span>
          <span className="text-[10px] text-phin-600 font-medium uppercase tracking-wider block">Huy hiệu</span>
        </Card>
      </div>

      {/* Edit Profile Form */}
      {isAuthenticated && isEditing && (
        <Card className="bg-white rounded-3xl p-6 border border-phin-200 shadow-card">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-sans text-base text-phin-900">Chỉnh Sửa Thông Tin Cá Nhân</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-phin-900">Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Họ và tên của bạn" className="h-9 text-xs border-phin-200 rounded-xl" {...field} />
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
                      <FormLabel className="text-xs text-phin-900">Tên người dùng</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên người dùng" className="h-9 text-xs border-phin-200 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="w-full bg-phin-800 text-white hover:bg-phin-900 rounded-xl font-semibold cursor-pointer">
                  <Save size={14} className="mr-1.5" /> Lưu thay đổi
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
            <Settings size={16} className="text-primary" /> Cài Đặt Ứng Dụng
          </CardTitle>
        </CardHeader>
        <Separator className="bg-phin-100" />
        <CardContent className="p-0 space-y-2.5 text-xs text-phin-700">
          <div className="flex justify-between items-center py-1 border-b border-phin-50">
            <span>Tên ứng dụng</span>
            <span className="font-semibold text-phin-900">PhinFind PWA</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-phin-50">
            <span>Phiên bản</span>
            <span className="font-semibold text-phin-900">1.0.0 Bản phát hành</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-phin-50">
            <span>Vị trí mặc định</span>
            <span className="font-semibold text-phin-900">Hà Nội, Việt Nam</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>Trạng thái PWA</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-bold text-[10px]">
              Sẵn sàng / Trực tuyến
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
