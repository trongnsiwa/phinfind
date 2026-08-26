import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

export function LocationButton({ onClick, isLoading = false, className }: LocationButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={isLoading}
      aria-label="Định vị lại bản đồ theo vị trí GPS hiện tại"
      className={cn(
        'absolute bottom-5 right-4 sm:bottom-6 sm:right-6 z-[400] h-11 w-11 rounded-full bg-[#101010]/90 backdrop-blur-md border border-[#2A2A2A]/80 text-sky-400 hover:text-sky-300 hover:bg-[#141414] hover:border-sky-400/50 shadow-xl shadow-black/50 transition-all duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
        className
      )}
    >
      <Navigation size={18} className="fill-sky-400/20 text-sky-400" />
    </Button>
  );
}
