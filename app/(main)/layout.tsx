import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ImageOverlay } from '@/components/common/ImageOverlay';
import { MainContent } from '@/components/layout/MainContent';
import { SyncIndicator } from '@/components/common/SyncIndicator';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <MainContent>{children}</MainContent>
      <BottomNav />
      <SyncIndicator />
      <ImageOverlay />
    </div>
  );
}
