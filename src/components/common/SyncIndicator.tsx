'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloudOff, Loader2, CheckCircle2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOnlineStatus } from '@/lib/offline/useOnlineStatus';
import { count, flushQueue } from '@/lib/offline/queue';
import { cn } from '@/lib/utils';

export function SyncIndicator() {
  const { isOnline, wasOffline, reset } = useOnlineStatus();
  const queryClient = useQueryClient();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSyncedSuccess, setShowSyncedSuccess] = useState<boolean>(false);
  const [isOfflineDismissed, setIsOfflineDismissed] = useState<boolean>(false);

  const isSyncingRef = useRef(false);

  // Check pending actions count
  const refreshCount = useCallback(async () => {
    try {
      const c = await count();
      setPendingCount(c);
      return c;
    } catch {
      return 0;
    }
  }, []);

  // Flush pending queue
  const handleFlush = useCallback(async () => {
    if (isSyncingRef.current || !navigator.onLine) return;

    const currentCount = await refreshCount();
    if (currentCount === 0) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const { succeeded, failed } = await flushQueue();
      await refreshCount();

      if (succeeded > 0) {
        toast.success(`Đã đồng bộ ${succeeded} thao tác`, {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        });

        // Invalidate relevant React Query caches
        queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'visits'] });
        queryClient.invalidateQueries({ queryKey: ['shops', 'reviews'] });
        queryClient.invalidateQueries({ queryKey: ['shops'] });

        setShowSyncedSuccess(true);
        setTimeout(() => {
          setShowSyncedSuccess(false);
        }, 2000);
      }

      if (failed > 0) {
        toast.error('Một số thao tác không thể đồng bộ', {
          description: 'Vui lòng kiểm tra lại các thao tác gần đây của bạn.',
        });
      }
    } catch (err) {
      console.warn('[SyncIndicator] Error during queue flush:', err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [queryClient, refreshCount]);

  // Initial check on mount
  useEffect(() => {
    refreshCount().then((c) => {
      if (c > 0 && navigator.onLine) {
        handleFlush();
      }
    });
  }, [handleFlush, refreshCount]);

  // Re-enable offline pill if we disconnect again
  useEffect(() => {
    if (!isOnline) {
      setIsOfflineDismissed(false);
    }
  }, [isOnline]);

  // Trigger flush when returning online
  useEffect(() => {
    if (isOnline && wasOffline) {
      reset();
      handleFlush();
    }
  }, [isOnline, wasOffline, reset, handleFlush]);

  // Polling interval: 5 seconds only when offline or queue is not empty
  useEffect(() => {
    const shouldPoll = !isOnline || pendingCount > 0 || isSyncing;
    if (!shouldPoll) return;

    const timer = setInterval(() => {
      refreshCount().then((c) => {
        if (c > 0 && isOnline && !isSyncingRef.current) {
          handleFlush();
        }
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isOnline, pendingCount, isSyncing, refreshCount, handleFlush]);

  // Render logic
  // 1. Success state
  if (showSyncedSuccess) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-md backdrop-blur-md">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>Đã đồng bộ</span>
        </div>
      </div>
    );
  }

  // 2. Syncing state
  if (isSyncing || (isOnline && pendingCount > 0)) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-gold/10 border border-amber-gold/30 text-amber-gold text-xs font-medium shadow-md backdrop-blur-md">
          <Loader2 size={14} className="animate-spin text-amber-gold" />
          <span>Đang đồng bộ {pendingCount > 0 ? `${pendingCount} ` : ''}thao tác...</span>
        </div>
      </div>
    );
  }

  // 3. Offline state
  if (!isOnline && !isOfflineDismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-muted/90 border border-border/80 text-muted-foreground text-xs font-medium shadow-md backdrop-blur-md'
          )}
        >
          <CloudOff size={14} className="text-muted-foreground" />
          <span>Ngoại tuyến</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-gold/15 text-amber-gold">
              {pendingCount} chờ đồng bộ
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsOfflineDismissed(true)}
            aria-label="Đóng thông báo ngoại tuyến"
            className="p-0.5 rounded-full hover:bg-background/60 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
