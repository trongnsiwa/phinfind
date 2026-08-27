import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ImageOverlay } from '@/components/common/ImageOverlay';
import { MainContent } from '@/components/layout/MainContent';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Header />
      <MainContent>{children}</MainContent>
      <BottomNav />
      <ImageOverlay />
    </div>
  );
}
