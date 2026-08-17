import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function LocationButton({ onClick, isLoading = false }: LocationButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={isLoading}
      aria-label="Re-center map on current location"
      className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-sm shadow-md hover:bg-phin-50 text-primary border-phin-200 w-10 h-10 rounded-xl"
    >
      <Navigation size={18} className="text-primary" />
    </Button>
  );
}
