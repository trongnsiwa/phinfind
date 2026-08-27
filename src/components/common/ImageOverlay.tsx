'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

export function ImageOverlay() {
  const isOpen = useUIStore((state) => state.imagePreview.isOpen);
  const images = useUIStore((state) => state.imagePreview.images);
  const currentIndex = useUIStore((state) => state.imagePreview.currentIndex);
  const closeImagePreview = useUIStore((state) => state.closeImagePreview);
  const nextImagePreview = useUIStore((state) => state.nextImagePreview);
  const prevImagePreview = useUIStore((state) => state.prevImagePreview);
  const setImagePreviewIndex = useUIStore((state) => state.setImagePreviewIndex);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Touch gesture tracking for swipe navigation and dismiss
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset loading & error states when index changes
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setHasError(false);
    }
  }, [isOpen, currentIndex]);

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeImagePreview();
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        nextImagePreview();
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        prevImagePreview();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, closeImagePreview, nextImagePreview, prevImagePreview]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 50;

    // Vertical swipe down to close
    if (deltaY > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
      closeImagePreview();
      return;
    }

    // Horizontal swipe for next/prev
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        nextImagePreview();
      } else {
        prevImagePreview();
      }
    }
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        e.stopPropagation();
        closeImagePreview();
      }
    },
    [closeImagePreview]
  );

  if (!mounted) return null;

  const currentImage = images && images.length > 0 ? images[currentIndex] || images[0] : null;
  const hasMultiple = Boolean(images && images.length > 1);

  return createPortal(
    <AnimatePresence>
      {isOpen && images && images.length > 0 && (
        <motion.div
          key="image-overlay-root"
          role="dialog"
          aria-modal="true"
          aria-label="Bộ sưu tập ảnh toàn màn hình"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleBackdropClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl text-white select-none pointer-events-auto"
        >
          {/* Top Header Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-4 z-20 pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              {hasMultiple && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
                  {currentIndex + 1} / {images.length}
                </span>
              )}
              {currentImage?.category && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-gold/20 text-amber-gold border border-amber-gold/40 backdrop-blur-md capitalize">
                  {currentImage.category}
                </span>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeImagePreview();
              }}
              aria-label="Đóng trình xem ảnh"
              className="h-11 w-11 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition-all border border-white/15 backdrop-blur-md shadow-xl cursor-pointer z-30 pointer-events-auto"
            >
              <X size={22} />
            </button>
          </motion.div>

          {/* Main Image Stage */}
          <div
            onClick={handleBackdropClick}
            className="relative flex-1 w-full flex items-center justify-center px-4 sm:px-12 py-2 overflow-hidden"
          >
            {/* Loading Spinner */}
            {loading && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#A0A0A0] pointer-events-none">
                <Loader2 size={36} className="animate-spin text-amber-gold" />
                <span className="text-xs text-[#D0D0D0]">Đang tải hình ảnh...</span>
              </div>
            )}

            {/* Error State */}
            {hasError ? (
              <div className="flex flex-col items-center justify-center gap-2 text-[#A0A0A0] py-12">
                <ImageIcon size={48} className="text-amber-gold/60" />
                <p className="text-sm font-medium text-[#D0D0D0]">Không thể tải hình ảnh</p>
              </div>
            ) : (
              <motion.img
                key={currentImage?.url}
                src={currentImage?.url}
                alt={currentImage?.title || `Ảnh ${currentIndex + 1}`}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: loading ? 0.95 : 1, opacity: loading ? 0 : 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setHasError(true);
                }}
                className="max-h-[76vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-2xl pointer-events-auto"
              />
            )}

            {/* Prev / Next Navigation Arrows */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImagePreview();
                  }}
                  aria-label="Ảnh trước"
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center transition-all border border-white/15 backdrop-blur-md shadow-xl z-20 cursor-pointer pointer-events-auto"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImagePreview();
                  }}
                  aria-label="Ảnh tiếp theo"
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center transition-all border border-white/15 backdrop-blur-md shadow-xl z-20 cursor-pointer pointer-events-auto"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Info Bar & Thumbnail Strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center gap-3 px-4 sm:px-6 py-4 z-20 pointer-events-auto"
          >
            {currentImage?.title && (
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs text-[#D0D0D0] font-medium text-center max-w-md line-clamp-1 shadow-md">
                {currentImage.title}
              </div>
            )}

            {/* Thumbnail Strip */}
            {hasMultiple && (
              <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 px-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.url + idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreviewIndex(idx);
                    }}
                    className={cn(
                      'relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer pointer-events-auto',
                      idx === currentIndex
                        ? 'border-amber-gold scale-105 shadow-md shadow-amber-gold/20'
                        : 'border-white/10 opacity-50 hover:opacity-80 hover:border-white/30'
                    )}
                  >
                    <img src={img.url} alt={`Ảnh thu nhỏ ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
