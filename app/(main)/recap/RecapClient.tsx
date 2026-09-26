'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRecap } from '@/hooks/useRecap';
import { useAuth } from '@/hooks/useAuth';
import { ShareMenu } from '@/components/shop/ShareMenu';
import { EmptyIllustration } from '@/components/common/EmptyIllustration';
import { RecapHeroCard } from '@/components/recap/RecapHeroCard';
import { RecapSkeleton } from '@/components/recap/RecapSkeleton';

export function RecapClient() {
  const { user, profile, loading: isAuthLoading } = useAuth();
  const {
    data: recap,
    isLoading: isRecapLoading,
    availableYears,
    selectedYear,
    setSelectedYear,
  } = useRecap();

  const isLoading = isAuthLoading || isRecapLoading;

  const [isDownloading, setIsDownloading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (profile?.username) {
        setShareUrl(`${origin}/u/${profile.username}`);
      } else {
        setShareUrl(`${origin}/recap`);
      }
    }
  }, [profile?.username]);

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/recap/${selectedYear}/image`);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Vui lòng đăng nhập để tải ảnh tổng kết.');
        }
        throw new Error('Không thể tải ảnh tổng kết lúc này.');
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `phinfind-recap-${selectedYear}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Đã tải ảnh tổng kết về máy thành công!');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải ảnh tổng kết. Vui lòng thử lại sau.';
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Bạn';

  const hasActivity =
    recap &&
    (recap.total_visits > 0 || recap.total_reviews > 0 || recap.total_favorites > 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Year Select Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/profile"
          aria-label="Quay lại trang hồ sơ"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors min-h-[44px] -ml-1 px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
        >
          <ArrowLeft size={16} />
          <span>Quay lại Hồ sơ</span>
        </Link>

        {/* Accessible Year Selector */}
        <div className="relative inline-block self-start sm:self-auto">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="Chọn năm tổng kết"
            className="appearance-none bg-card text-foreground border border-border hover:border-amber-gold/50 font-bold text-xs sm:text-sm rounded-full pl-4 pr-9 py-2 min-h-[44px] cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all"
          >
            {availableYears.map((year) => (
              <option key={year} value={year} className="bg-card text-foreground">
                Năm {year}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <RecapSkeleton />
      ) : !hasActivity ? (
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-card">
          <div className="rounded-2xl bg-secondary/60 p-6 mb-2">
            <EmptyIllustration type="no-reviews" size={160} />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Chưa có hành trình trong năm {selectedYear}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Bạn chưa có lượt ghé thăm hay đánh giá nào được ghi nhận trong năm {selectedYear}. Hãy tiếp tục hành trình khám phá những quán cà phê tuyệt vời trên PhinFind!
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 min-h-[44px] px-6 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95"
          >
            Khám phá quán ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero Preview Card (Theme-Aware: Warm Cream in Light, Dark Roast in Dark) */}
          <RecapHeroCard
            recap={recap}
            displayName={displayName}
            selectedYear={selectedYear}
          />

          {/* Action Buttons Bar: Chia sẻ & Tải ảnh */}
          <div className="mt-8 flex flex-row items-center justify-center gap-3 flex-wrap">
            <ShareMenu
              url={shareUrl || (typeof window !== 'undefined' ? window.location.href : '')}
              title={`Hành trình Cà phê ${selectedYear} của tôi trên PhinFind!`}
              triggerClassName="h-12 min-h-[44px] px-6 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-bold rounded-2xl shadow-sm border-0 cursor-pointer transition-all active:scale-95"
              labelClassName="font-bold text-primary-foreground"
              iconClassName="text-primary-foreground"
            />

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 h-12 min-h-[44px] px-6 rounded-2xl border border-border bg-card hover:bg-secondary text-foreground font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-foreground" />
                  <span>Đang tải ảnh...</span>
                </>
              ) : (
                <>
                  <Download size={16} className="text-foreground" />
                  <span>Tải ảnh về máy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



