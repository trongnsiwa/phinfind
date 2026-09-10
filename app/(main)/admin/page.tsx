'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, Clock, XCircle, AlertTriangle } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminShopCard, AdminShopItem } from '@/components/admin/AdminShopCard';
import { AdminSkeletonList } from '@/components/admin/AdminSkeletonList';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { API_ENDPOINTS, APP_ROUTES } from '@/lib/utils/constants';

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pendingShops, setPendingShops] = useState<AdminShopItem[]>([]);
  const [rejectedShops, setRejectedShops] = useState<AdminShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingShop, setRejectingShop] = useState<AdminShopItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAdminShops() {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINTS.ADMIN_SHOPS);
        if (isMounted) {
          setPendingShops(res.data.pending || []);
          setRejectedShops(res.data.rejected || []);
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            toast.error('Không có quyền truy cập');
            router.replace(APP_ROUTES.HOME);
            return;
          }
          toast.error(err.response?.data?.error || 'Lỗi khi tải dữ liệu quản trị');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAdminShops();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleApprove = async (shop: AdminShopItem) => {
    const previousPending = [...pendingShops];

    // Optimistic UI update
    setPendingShops((prev) => prev.filter((s) => s.place_id !== shop.place_id));

    try {
      await axios.patch(API_ENDPOINTS.ADMIN_SHOPS, {
        placeId: shop.place_id,
        action: 'approve',
      });

      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success(`Đã xác minh quán "${shop.name}" thành công`);
    } catch (error: any) {
      setPendingShops(previousPending);
      toast.error(
        error.response?.data?.error || 'Không thể xác minh quán. Vui lòng thử lại sau.'
      );
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingShop) return;
    const target = rejectingShop;
    setRejectingShop(null);

    const previousPending = [...pendingShops];
    const previousRejected = [...rejectedShops];

    // Optimistic UI update
    setPendingShops((prev) => prev.filter((s) => s.place_id !== target.place_id));
    setRejectedShops((prev) => [{ ...target, hidden: true, verified: false }, ...prev]);

    try {
      await axios.patch(API_ENDPOINTS.ADMIN_SHOPS, {
        placeId: target.place_id,
        action: 'reject',
      });

      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success(`Đã từ chối và ẩn quán "${target.name}"`);
    } catch (error: any) {
      setPendingShops(previousPending);
      setRejectedShops(previousRejected);
      toast.error(
        error.response?.data?.error || 'Không thể từ chối quán. Vui lòng thử lại sau.'
      );
    }
  };

  const handleUnhide = async (shop: AdminShopItem) => {
    const previousPending = [...pendingShops];
    const previousRejected = [...rejectedShops];

    // Optimistic UI update
    setRejectedShops((prev) => prev.filter((s) => s.place_id !== shop.place_id));
    setPendingShops((prev) => [{ ...shop, hidden: false, verified: false }, ...prev]);

    try {
      await axios.patch(API_ENDPOINTS.ADMIN_SHOPS, {
        placeId: shop.place_id,
        action: 'unhide',
      });

      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success(`Đã khôi phục quán "${shop.name}" về danh sách chờ duyệt`);
    } catch (error: any) {
      setPendingShops(previousPending);
      setRejectedShops(previousRejected);
      toast.error(
        error.response?.data?.error || 'Không thể khôi phục quán. Vui lòng thử lại sau.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pb-24 sm:pb-16 pt-4 sm:pt-6 px-3 sm:px-6 max-w-5xl mx-auto">
      {/* Header title block with mb-4, no duplicate count badges */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Shield size={20} className="text-primary" />
          </div>
          <h1 className="font-sans font-bold text-xl sm:text-2xl text-foreground tracking-tight">
            Bảng Quản Trị
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Quản lý và kiểm duyệt các quán cà phê do cộng đồng đóng góp.
        </p>
      </div>

      {/* Underline Tabs with no extra top margin */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="flex items-center justify-start gap-6 border-b border-border bg-transparent p-0 h-auto rounded-none w-full">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-2 pb-3 pt-1.5 px-1 font-semibold text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
          >
            <Clock size={15} />
            <span>Chờ duyệt</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              ({pendingShops.length})
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="rejected"
            className="flex items-center gap-2 pb-3 pt-1.5 px-1 font-semibold text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
          >
            <XCircle size={15} />
            <span>Đã từ chối</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              ({rejectedShops.length})
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Shops */}
        <TabsContent value="pending" className="mt-4 space-y-4">
          {loading ? (
            <AdminSkeletonList />
          ) : pendingShops.length === 0 ? (
            <AdminEmptyState type="pending" />
          ) : (
            <div className="space-y-4">
              {pendingShops.map((shop) => (
                <AdminShopCard
                  key={shop.place_id || shop.id}
                  shop={shop}
                  variant="pending"
                  onApprove={handleApprove}
                  onReject={setRejectingShop}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Rejected Shops */}
        <TabsContent value="rejected" className="mt-4 space-y-4">
          {loading ? (
            <AdminSkeletonList />
          ) : rejectedShops.length === 0 ? (
            <AdminEmptyState type="rejected" />
          ) : (
            <div className="space-y-4">
              {rejectedShops.map((shop) => (
                <AdminShopCard
                  key={shop.place_id || shop.id}
                  shop={shop}
                  variant="rejected"
                  onUnhide={handleUnhide}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Confirmation AlertDialog */}
      <AlertDialog
        open={Boolean(rejectingShop)}
        onOpenChange={(open) => !open && setRejectingShop(null)}
      >
        <AlertDialogContent className="bg-card border border-border rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-destructive mb-1">
              <AlertTriangle size={20} />
              <AlertDialogTitle className="font-sans font-bold text-lg text-foreground">
                Từ chối quán cà phê
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bạn có chắc chắn từ chối quán này? Quán sẽ bị ẩn khỏi mọi danh sách công khai.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              Từ chối quán
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
