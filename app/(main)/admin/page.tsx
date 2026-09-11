'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, Clock, XCircle, AlertTriangle, Pencil, ChevronDown, CheckCircle2 } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AdminShopCard, AdminShopItem } from '@/components/admin/AdminShopCard';
import { AdminSuggestionCard } from '@/components/admin/AdminSuggestionCard';
import { AdminSkeletonList } from '@/components/admin/AdminSkeletonList';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { API_ENDPOINTS, APP_ROUTES } from '@/lib/utils/constants';
import {
  useAdminSuggestions,
  useReviewSuggestion,
  ShopEditSuggestion,
} from '@/hooks/useShops';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [pendingShops, setPendingShops] = useState<AdminShopItem[]>([]);
  const [rejectedShops, setRejectedShops] = useState<AdminShopItem[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [rejectingShop, setRejectingShop] = useState<AdminShopItem | null>(null);

  // Suggestions state
  const { data: suggestionsData, isLoading: loadingSuggestions } = useAdminSuggestions({
    enabled: true,
  });
  const reviewSuggestionMutation = useReviewSuggestion();
  const [rejectingSuggestion, setRejectingSuggestion] = useState<ShopEditSuggestion | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRecentlyReviewed, setShowRecentlyReviewed] = useState(false);

  const pendingSuggestions = suggestionsData?.pending || [];
  const recentlyReviewed = suggestionsData?.recentlyReviewed || [];

  useEffect(() => {
    let isMounted = true;

    async function fetchAdminShops() {
      try {
        setLoadingShops(true);
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
          setLoadingShops(false);
        }
      }
    }

    fetchAdminShops();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleApproveShop = async (shop: AdminShopItem) => {
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

  const handleConfirmRejectShop = async () => {
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

  const handleUnhideShop = async (shop: AdminShopItem) => {
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

  // Suggestion Actions
  const handleApproveSuggestion = async (suggestion: ShopEditSuggestion) => {
    if (user && suggestion.suggested_by === user.id) {
      toast.error('Bạn không thể tự duyệt đề xuất của chính mình.');
      return;
    }

    try {
      await reviewSuggestionMutation.mutateAsync({
        id: suggestion.id,
        action: 'approve',
      });
    } catch {
      // Handled in mutation onError
    }
  };

  const handleOpenRejectSuggestion = (suggestion: ShopEditSuggestion) => {
    setRejectingSuggestion(suggestion);
    setRejectionNote('');
  };

  const handleConfirmRejectSuggestion = async () => {
    if (!rejectingSuggestion) return;
    const target = rejectingSuggestion;
    const note = rejectionNote.trim();
    setRejectingSuggestion(null);

    try {
      await reviewSuggestionMutation.mutateAsync({
        id: target.id,
        action: 'reject',
        note: note || undefined,
      });
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pb-24 sm:pb-16 pt-4 sm:pt-6 px-3 sm:px-6 max-w-5xl mx-auto">
      {/* Header title block */}
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
          Quản lý và kiểm duyệt các quán cà phê cùng đề xuất chỉnh sửa từ cộng đồng.
        </p>
      </div>

      {/* Underline Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="flex items-center justify-start gap-4 sm:gap-6 border-b border-border bg-transparent p-0 h-auto rounded-none w-full overflow-x-auto scrollbar-none">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-2 pb-3 pt-1.5 px-1 font-semibold text-xs sm:text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 flex-shrink-0"
          >
            <Clock size={15} />
            <span>Chờ duyệt</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              ({pendingShops.length})
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="rejected"
            className="flex items-center gap-2 pb-3 pt-1.5 px-1 font-semibold text-xs sm:text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 flex-shrink-0"
          >
            <XCircle size={15} />
            <span>Đã từ chối</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              ({rejectedShops.length})
            </span>
          </TabsTrigger>

          {/* Third Tab: Edit Suggestions */}
          <TabsTrigger
            value="suggestions"
            className="flex items-center gap-2 pb-3 pt-1.5 px-1 font-semibold text-xs sm:text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 flex-shrink-0"
          >
            <Pencil size={15} />
            <span>Đề xuất chỉnh sửa</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-gold/20 text-amber-gold font-bold">
              ({pendingSuggestions.length})
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Shops */}
        <TabsContent value="pending" className="mt-4 space-y-4">
          {loadingShops ? (
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
                  onApprove={handleApproveShop}
                  onReject={setRejectingShop}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Rejected Shops */}
        <TabsContent value="rejected" className="mt-4 space-y-4">
          {loadingShops ? (
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
                  onUnhide={handleUnhideShop}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Edit Suggestions */}
        <TabsContent value="suggestions" className="mt-4 space-y-6">
          {loadingSuggestions ? (
            <AdminSkeletonList />
          ) : pendingSuggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-2xl border border-dashed border-border/80 space-y-2">
              <CheckCircle2 size={32} className="text-teal" />
              <h3 className="font-bold text-sm text-foreground">Không có đề xuất chờ duyệt</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tất cả các đề xuất chỉnh sửa thông tin từ cộng đồng đã được xử lý.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSuggestions.map((suggestion) => (
                <AdminSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  currentUserId={user?.id}
                  variant="pending"
                  onApprove={handleApproveSuggestion}
                  onReject={handleOpenRejectSuggestion}
                />
              ))}
            </div>
          )}

          {/* Expandable Recently Reviewed Section */}
          {recentlyReviewed.length > 0 && (
            <div className="pt-4 border-t border-border/60 space-y-3">
              <Button
                variant="ghost"
                onClick={() => setShowRecentlyReviewed((prev) => !prev)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>Đã xử lý gần đây</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-muted text-foreground">
                    {recentlyReviewed.length}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    showRecentlyReviewed ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              {showRecentlyReviewed && (
                <div className="space-y-3 pt-1">
                  {recentlyReviewed.map((suggestion) => (
                    <AdminSuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      currentUserId={user?.id}
                      variant="reviewed"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Shop Rejection Confirmation AlertDialog */}
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
              onClick={handleConfirmRejectShop}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              Từ chối quán
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suggestion Rejection Dialog with Note */}
      <AlertDialog
        open={Boolean(rejectingSuggestion)}
        onOpenChange={(open) => !open && setRejectingSuggestion(null)}
      >
        <AlertDialogContent className="bg-card border border-border rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-destructive mb-1">
              <XCircle size={20} />
              <AlertDialogTitle className="font-sans font-bold text-lg text-foreground">
                Từ chối đề xuất chỉnh sửa
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Nhập lý do từ chối đề xuất này (tùy chọn). Người đề xuất sẽ nhận được thông báo kèm lý do.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value.slice(0, 500))}
              placeholder="Ví dụ: 'Thông tin này không chính xác sau khi kiểm tra qua hotline'..."
              rows={3}
              className="text-xs rounded-xl bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-amber-gold resize-none"
            />
            <div className="text-right text-[11px] text-muted-foreground mt-1">
              {rejectionNote.length}/500
            </div>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
            <AlertDialogCancel className="rounded-xl text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRejectSuggestion}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              Từ chối đề xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
