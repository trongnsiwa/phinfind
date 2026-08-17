import { CoffeeShop } from '@/types/shop';

interface MapMarkerProps {
  shop: CoffeeShop;
  isSelected?: boolean;
  onClick?: () => void;
}

export function MapMarker({ shop, isSelected = false, onClick }: MapMarkerProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`Coffee shop marker for ${shop.name}`}
      className={`relative group flex items-center justify-center transition-all duration-200 ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border-2 border-white text-sm font-bold ${
          isSelected ? 'bg-secondary text-white ring-4 ring-secondary/30' : 'bg-primary text-white'
        }`}
      >
        ☕
      </div>
    </button>
  );
}
