'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Info, Loader2, Sparkles } from 'lucide-react';
import { CoffeeShop } from '@/types/shop';
import { useSuggestEdit, useUserVisits } from '@/hooks/useShops';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SuggestEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: CoffeeShop;
}

const PRICE_OPTIONS: Array<'₫' | '₫₫' | '₫₫₫' | '₫₫₫₫'> = ['₫', '₫₫', '₫₫₫', '₫₫₫₫'];

interface DiffRowProps {
  label: string;
  currentDisplay: React.ReactNode;
  children: React.ReactNode;
  isChanged: boolean;
}

function DiffRow({ label, currentDisplay, children, isChanged }: DiffRowProps) {
  return (
    <div
      className={cn(
        'p-3 rounded-xl border transition-all space-y-2',
        isChanged
          ? 'bg-amber-gold/5 border-amber-gold/30 dark:bg-amber-gold/10'
          : 'bg-secondary/30 border-border/60'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {isChanged && (
          <span className="text-[10px] font-bold text-amber-gold uppercase tracking-wider bg-amber-gold/10 px-2 py-0.5 rounded-full">
            Đã sửa
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1.2fr] items-center gap-2">
        {/* Left: Current value */}
        <div className="bg-background/80 rounded-lg p-2 border border-border/40 min-w-0">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">
            Hiện tại
          </span>
          <div className="text-xs text-muted-foreground truncate">{currentDisplay}</div>
        </div>

        {/* Center: Arrow */}
        <div className="hidden sm:flex justify-center text-muted-foreground/60">
          <ArrowRight size={14} className={cn(isChanged && 'text-amber-gold')} />
        </div>

        {/* Right: Proposed value */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-amber-gold uppercase tracking-wider block sm:hidden">
            Đề xuất
          </span>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SuggestEditDialog({ open, onOpenChange, shop }: SuggestEditDialogProps) {
  const shopPlaceId = shop.place_id || shop.id;
  const { data: userVisits = [] } = useUserVisits();
  const suggestEditMutation = useSuggestEdit();

  const hasVisited = useMemo(() => {
    return userVisits.some((v) => v.shop_place_id === shopPlaceId);
  }, [userVisits, shopPlaceId]);

  // Editable form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [openNow, setOpenNow] = useState<boolean>(true);
  const [reason, setReason] = useState('');

  // Initialize/reset form with current shop values
  useEffect(() => {
    if (open) {
      setName(shop.name || '');
      setAddress(shop.address || '');
      setPhone(shop.phone || '');
      setWebsite(shop.website || '');
      setPriceRange(shop.price_range || '');
      setOpenNow(shop.opening_hours?.open_now ?? true);
      setReason('');
    }
  }, [open, shop]);

  // Compute diffs against current values
  const diffs = useMemo(() => {
    const changes: Record<string, { from: any; to: any }> = {};

    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== (shop.name || '').trim()) {
      changes.name = { from: shop.name, to: trimmedName };
    }

    const trimmedAddress = address.trim();
    if (trimmedAddress !== (shop.address || '').trim()) {
      changes.address = { from: shop.address || '', to: trimmedAddress };
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone !== (shop.phone || '').trim()) {
      changes.phone = { from: shop.phone || null, to: trimmedPhone || null };
    }

    const trimmedWebsite = website.trim();
    if (trimmedWebsite !== (shop.website || '').trim()) {
      changes.website = { from: shop.website || null, to: trimmedWebsite || null };
    }

    if (priceRange !== (shop.price_range || '')) {
      changes.price_range = {
        from: shop.price_range || null,
        to: priceRange || null,
      };
    }

    const currentOpenNow = shop.opening_hours?.open_now ?? true;
    if (openNow !== currentOpenNow) {
      changes.opening_hours = {
        from: shop.opening_hours || { open_now: currentOpenNow },
        to: { ...(shop.opening_hours || {}), open_now: openNow },
      };
    }

    return changes;
  }, [name, address, phone, website, priceRange, openNow, shop]);

  const changedKeys = Object.keys(diffs);
  const changedCount = changedKeys.length;

  // Validation
  const hasChanges = changedCount > 0;
  const isOverLimit = changedCount > 3;
  const requiresReason = changedCount > 1;
  const isReasonMissing = requiresReason && !reason.trim();
  const canSubmit = hasChanges && !isOverLimit && !isReasonMissing && !suggestEditMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await suggestEditMutation.mutateAsync({
        shop_place_id: shopPlaceId,
        changes: diffs,
        reason: reason.trim() || undefined,
      });
      onOpenChange(false);
    } catch {
      // Error handled inside useSuggestEdit toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0 border-border bg-card">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 text-left space-y-1.5 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="font-sans font-bold text-lg text-foreground tracking-tight">
              Đề xuất chỉnh sửa
            </DialogTitle>
            {hasVisited && (
              <Badge
                variant="outline"
                className="bg-amber-gold/15 text-amber-gold border-amber-gold/30 text-[11px] font-medium py-0.5 px-2 rounded-full flex items-center gap-1 flex-shrink-0"
              >
                <Sparkles size={11} />
                <span>Bạn đã ghé quán này</span>
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Giúp cộng đồng cập nhật thông tin chính xác cho{' '}
            <span className="font-semibold text-foreground">{shop.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Hint banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs text-muted-foreground">
            <Info size={15} className="text-amber-gold flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Chỉ những thông tin được thay đổi mới được gửi đến quản trị viên để duyệt (tối đa{' '}
              <strong className="text-foreground">3 thông tin</strong> mỗi lần).
            </span>
          </div>

          {/* Diff Rows */}
          <DiffRow
            label="Tên quán"
            currentDisplay={shop.name || '(Trống)'}
            isChanged={Boolean(diffs.name)}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên quán cà phê"
              className="h-9 text-xs rounded-lg bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-amber-gold"
            />
          </DiffRow>

          <DiffRow
            label="Địa chỉ"
            currentDisplay={shop.address || '(Chưa có địa chỉ)'}
            isChanged={Boolean(diffs.address)}
          >
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Địa chỉ quán cà phê"
              className="h-9 text-xs rounded-lg bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-amber-gold"
            />
          </DiffRow>

          <DiffRow
            label="Số điện thoại"
            currentDisplay={shop.phone || '(Chưa có số điện thoại)'}
            isChanged={Boolean(diffs.phone)}
          >
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0901234567"
              className="h-9 text-xs rounded-lg bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-amber-gold"
            />
          </DiffRow>

          <DiffRow
            label="Website / Mạng xã hội"
            currentDisplay={shop.website || '(Chưa có)'}
            isChanged={Boolean(diffs.website)}
          >
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="h-9 text-xs rounded-lg bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-amber-gold"
            />
          </DiffRow>

          <DiffRow
            label="Mức giá"
            currentDisplay={shop.price_range || '(Chưa cập nhật)'}
            isChanged={Boolean(diffs.price_range)}
          >
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-9 text-xs rounded-lg bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-amber-gold">
                <SelectValue placeholder="Chọn mức giá" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {PRICE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DiffRow>

          <DiffRow
            label="Trạng thái mở cửa"
            currentDisplay={
              shop.opening_hours?.open_now ? 'Đang mở cửa' : 'Đã đóng cửa'
            }
            isChanged={Boolean(diffs.opening_hours)}
          >
            <div className="flex items-center justify-between h-9 px-3 rounded-lg bg-background border border-border/70">
              <span className="text-xs text-foreground font-medium">
                {openNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
              </span>
              <Switch checked={openNow} onCheckedChange={setOpenNow} />
            </div>
          </DiffRow>

          {/* Reason Section */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="suggest-reason" className="font-semibold text-foreground">
                Lý do thay đổi{' '}
                {requiresReason ? (
                  <span className="text-destructive font-normal">(bắt buộc khi đổi &gt; 1 thông tin)</span>
                ) : (
                  <span className="text-muted-foreground font-normal">(tùy chọn)</span>
                )}
              </label>
              <span className="text-[11px] text-muted-foreground">{reason.length}/500</span>
            </div>
            <Textarea
              id="suggest-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="Ghi chú nguồn tin cậy, ví dụ: 'Quán đổi giờ hoạt động từ tháng 9'..."
              rows={2}
              className="text-xs rounded-xl bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-amber-gold resize-none"
            />
          </div>

          {/* Inline Validation Alerts */}
          {isOverLimit && (
            <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
              Chỉ có thể đề xuất tối đa 3 thay đổi mỗi lần. Hiện đang chọn {changedCount} thay đổi.
            </p>
          )}

          {isReasonMissing && (
            <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
              Vui lòng nhập lý do khi thay đổi từ 2 thông tin trở lên.
            </p>
          )}
        </form>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex-row justify-end gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={suggestEditMutation.isPending}
            className="rounded-xl text-xs font-semibold focus-visible:ring-1 focus-visible:ring-amber-gold"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-xl text-xs font-bold bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground focus-visible:ring-1 focus-visible:ring-amber-gold cursor-pointer"
          >
            {suggestEditMutation.isPending ? (
              <>
                <Loader2 size={13} className="mr-1.5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              `Gửi đề xuất${changedCount > 0 ? ` (${changedCount})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
