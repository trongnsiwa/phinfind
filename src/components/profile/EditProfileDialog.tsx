'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Camera, Loader2, Save, User as UserIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateProfile } from '@/hooks/useShops';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types/user';

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự'),
  username: z
    .string()
    .trim()
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(30, 'Tên người dùng tối đa 30 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Tên người dùng chỉ bao gồm chữ cái, số và dấu gạch dưới'),
  bio: z
    .string()
    .max(200, 'Giới thiệu bản thân tối đa 200 ký tự')
    .optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  profile: UserProfile | null;
  onProfileUpdated?: (updated: UserProfile | null) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  profile,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const updateProfileMutation = useUpdateProfile();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      avatarUrl: profile?.avatar_url || '',
    },
  });

  useEffect(() => {
    if (profile && open) {
      form.reset({
        fullName: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || '',
      });
    }
  }, [profile, form, open]);

  const watchedAvatarUrl = form.watch('avatarUrl');
  const watchedBio = form.watch('bio') || '';

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    const toastId = toast.loading('Đang tải ảnh đại diện lên...');

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanName = file.name
        .split('.')[0]
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 15);
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 7);
      const filePath = `avatars/${user.id}/${timestamp}_${randomStr}_${cleanName}.${fileExt}`;

      const supabase = createClient();
      let uploadBucket = 'avatars';
      let { error: uploadError } = await supabase.storage
        .from(uploadBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        uploadBucket = 'shop-photos';
        const fallback = await supabase.storage
          .from(uploadBucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });
        uploadError = fallback.error;
      }

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(uploadBucket)
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        form.setValue('avatarUrl', publicUrlData.publicUrl, { shouldDirty: true });
        toast.success('Tải ảnh đại diện thành công!', { id: toastId });
      }
    } catch (err: any) {
      console.error('Lỗi tải ảnh đại diện:', err);
      toast.error(`Không thể tải ảnh: ${err.message || 'Lỗi không xác định'}`, { id: toastId });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updated = await updateProfileMutation.mutateAsync({
        full_name: data.fullName.trim(),
        username: data.username.trim(),
        bio: data.bio?.trim() || null,
        avatar_url: data.avatarUrl || null,
      });

      toast.success('Cập nhật hồ sơ thành công!');
      onProfileUpdated?.(updated || null);
      onOpenChange(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err.message ||
        'Không thể cập nhật hồ sơ. Vui lòng thử lại.';
      toast.error(msg);
    }
  };

  const handleCancelEdit = () => {
    form.reset({
      fullName: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      avatarUrl: profile?.avatar_url || '',
    });
    onOpenChange(false);
  };

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Tín Đồ Cà Phê';

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleCancelEdit();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">
            Chỉnh sửa thông tin cá nhân
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cập nhật ảnh đại diện, họ tên, tên người dùng và giới thiệu bản thân trên PhinFind.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Avatar Upload Clickable Section */}
            <div className="flex flex-col items-center justify-center gap-2 pb-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarSelect}
                disabled={isUploadingAvatar || updateProfileMutation.isPending}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-border/80 hover:border-primary cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                title="Nhấn để đổi ảnh đại diện"
              >
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={watchedAvatarUrl || profile?.avatar_url || ''}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-secondary text-primary font-bold text-2xl">
                    <UserIcon size={32} />
                  </AvatarFallback>
                </Avatar>

                {/* Camera overlay */}
                <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity">
                  {isUploadingAvatar ? (
                    <Loader2 size={22} className="animate-spin text-white" />
                  ) : (
                    <>
                      <Camera size={20} className="mb-0.5" />
                      <span className="text-[10px] font-semibold">Đổi ảnh</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                Nhấn vào ảnh để tải lên avatar mới (tối đa 5MB)
              </p>
            </div>

            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-foreground font-medium">
                    Họ và tên <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Họ và tên của bạn"
                      className="h-10 text-xs border-border bg-secondary/30 rounded-xl focus-visible:ring-primary"
                      disabled={updateProfileMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-foreground font-medium">
                    Tên người dùng <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs text-muted-foreground font-medium select-none">
                        @
                      </span>
                      <Input
                        placeholder="username"
                        className="h-10 text-xs border-border bg-secondary/30 rounded-xl pl-7 focus-visible:ring-primary font-mono"
                        disabled={updateProfileMutation.isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Bio / Description */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs text-foreground font-medium">
                      Giới thiệu bản thân
                    </FormLabel>
                    <span
                      className={cn(
                        'text-[10px] text-muted-foreground',
                        watchedBio.length >= 200 && 'text-destructive font-semibold'
                      )}
                    >
                      {watchedBio.length}/200 ký tự
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Chia sẻ gu cà phê, sở thích hoặc một đôi dòng về bạn..."
                      className="min-h-[80px] max-h-[140px] text-xs border-border bg-secondary/30 rounded-xl focus-visible:ring-primary resize-y"
                      maxLength={200}
                      disabled={updateProfileMutation.isPending}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-row gap-2 pt-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={updateProfileMutation.isPending || isUploadingAvatar}
                className="flex-1 sm:flex-initial rounded-xl border-border text-xs cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateProfileMutation.isPending || isUploadingAvatar}
                className="flex-1 sm:flex-initial bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={14} className="mr-1.5" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
