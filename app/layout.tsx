import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PhinFind - Khám phá Cà phê Việt',
  description: 'Khám phá những quán cà phê tuyệt vời nhất gần bạn với bản đồ tương tác và đánh giá chi tiết',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PhinFind',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#101010',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-phin-200">
        <ReactQueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
