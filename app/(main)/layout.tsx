import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ImageOverlay } from '@/components/common/ImageOverlay';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-dark-bg text-cream-white">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</main>
      <BottomNav />
      <ImageOverlay />
    </div>
  );
}
