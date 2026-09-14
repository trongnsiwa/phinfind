'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AddShopStepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function AddShopStepIndicator({
  currentStep,
  totalSteps = 5,
  onStepClick,
  className,
}: AddShopStepIndicatorProps) {
  return (
    // RESPONSIVE: Mobile-only sticky step indicator strip below header
    <div
      className={cn(
        'md:hidden sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border/40 px-4 py-2 flex items-center justify-between select-none shadow-2xs',
        className
      )}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Tiến trình: Bước ${currentStep}/${totalSteps}`}
    >
      {/* 5 Progress Dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, idx) => {
          const stepNum = idx + 1;
          const isCurrent = stepNum === currentStep;
          const isFilled = stepNum <= currentStep;

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => onStepClick?.(stepNum)}
              aria-label={`Đến bước ${stepNum}`}
              className={cn(
                'transition-all duration-300 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold',
                isCurrent
                  ? 'w-5 h-2 bg-amber-gold shadow-xs'
                  : isFilled
                    ? 'w-2 h-2 bg-amber-gold/80'
                    : 'w-2 h-2 bg-border hover:bg-muted-foreground/40'
              )}
            />
          );
        })}
      </div>

      {/* Current Step Label on the Right */}
      <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
        Bước <span className="text-foreground font-bold">{currentStep}</span>/{totalSteps}
      </span>
    </div>
  );
}
