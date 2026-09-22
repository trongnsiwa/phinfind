import type { Metadata, Viewport } from 'next';
import './globals.css';

import { Inter } from 'next/font/google';

import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildWebSiteJsonLd, buildOrganizationJsonLd } from '@/lib/seo/jsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const PRODUCTION_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  applicationName: 'PhinFind',
  title: {
    default: 'PhinFind - Khám phá Cà phê Việt',
    template: '%s | PhinFind'
  },
  description:
    'Khám phá những quán cà phê tuyệt vời nhất gần bạn với bản đồ tương tác và đánh giá chi tiết',
  keywords: [
    'quán cà phê',
    'cà phê Việt',
    'bản đồ cà phê',
    'tìm quán cà phê gần đây',
    'coffee shop Vietnam',
    'PhinFind'
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon-48x48.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'PhinFind - Khám phá Cà phê Việt',
    description:
      'Khám phá những quán cà phê tuyệt vời nhất gần bạn với bản đồ tương tác và đánh giá chi tiết',
    url: PRODUCTION_URL,
    siteName: 'PhinFind',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/logo-512.png',
        width: 512,
        height: 512,
        alt: 'PhinFind - Bản đồ Cà phê Việt'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@phinfind',
    title: 'PhinFind - Khám phá Cà phê Việt',
    description:
      'Khám phá những quán cà phê tuyệt vời nhất gần bạn với bản đồ tương tác và đánh giá chi tiết',
    images: ['/logo-512.png']
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PhinFind'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: '#F9F6F0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = buildWebSiteJsonLd(PRODUCTION_URL);
  const organizationJsonLd = buildOrganizationJsonLd(PRODUCTION_URL);

  return (
    <html lang='vi' className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <JsonLd data={[websiteJsonLd, organizationJsonLd]} />
        <link rel='icon' type='image/png' sizes='48x48' href='/favicon-48x48.png' />
        <link rel='icon' type='image/png' sizes='192x192' href='/logo-192.png' />
        <link rel='icon' type='image/png' sizes='512x512' href='/logo-512.png' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel='shortcut icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        {/* Unregister service workers and clear caches in development to ensure fresh server HTML */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    regs.forEach(function(r) { r.unregister(); });
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(function(keys) {
                    keys.forEach(function(k) { caches.delete(k); });
                  });
                }
              `
            }}
          />
        )}
      </head>
      <body className='min-h-screen bg-background text-foreground antialiased selection:bg-phin-200'>
        <ThemeProvider>
          <ReactQueryProvider>
            {children}
            <Toaster position='top-right' richColors />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
