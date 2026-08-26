import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 gap-3', className)}>
      <div className={cn('relative flex items-center justify-center text-amber-gold', sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full border-2 border-amber-gold/20 border-t-amber-gold animate-spin" />
        <Coffee size={iconSizes[size]} className="animate-pulse text-amber-gold" />
      </div>
      {text && <p className="text-sm font-medium text-[#D0D0D0]/90 animate-pulse font-sans">{text}</p>}
    </div>
  );
}
