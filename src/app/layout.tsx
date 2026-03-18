import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: {
    default: 'OliveMarket – Premium Olive Oil Marketplace',
    template: '%s | OliveMarket',
  },
  description:
    'Discover and buy premium extra virgin olive oil directly from artisan producers across the Mediterranean. From Spain, Italy, Greece, and Portugal to your table.',
  keywords: [
    'olive oil',
    'extra virgin',
    'EVOO',
    'premium olive oil',
    'organic olive oil',
    'Mediterranean',
    'marketplace',
    'artisan',
    'producers',
  ],
  openGraph: {
    type: 'website',
    siteName: 'OliveMarket',
    title: 'OliveMarket – Premium Olive Oil Marketplace',
    description: 'Discover and buy premium extra virgin olive oil directly from artisan producers.',
    locale: 'en_US',
    alternateLocale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OliveMarket – Premium Olive Oil Marketplace',
    description: 'Discover and buy premium extra virgin olive oil directly from artisan producers.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1 pt-[calc(4rem+28px)] lg:pt-[calc(5rem+28px)]">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
