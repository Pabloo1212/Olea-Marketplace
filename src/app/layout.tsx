import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: {
    default: 'Comprar Aceite de Oliva Virgen Extra Online | OliveMarket',
    template: '%s | OliveMarket',
  },
  description:
    'Aceite de oliva virgen extra directo del productor. AOVE premium, ecológico y artesanal de España, Italia y Grecia. Envío a toda Europa. Compra ahora.',
  keywords: [
    'comprar aceite de oliva virgen extra online',
    'aceite de oliva premium',
    'AOVE artesanal',
    'aceite de oliva ecológico',
    'aceite oliva directo del productor',
    'productores aceite de oliva',
    'olive oil marketplace',
    'extra virgin olive oil',
  ],
  openGraph: {
    type: 'website',
    siteName: 'OliveMarket',
    title: 'OliveMarket — Aceite de Oliva Virgen Extra Premium',
    description: 'Compra AOVE premium directo del productor artesanal. España, Italia, Grecia y Portugal.',
    locale: 'es_ES',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OliveMarket — Aceite de Oliva Virgen Extra Premium',
    description: 'Compra AOVE premium directo del productor artesanal.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://olea-marketplace.vercel.app',
  },
};

// JSON-LD structured data for search engines and AI
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://olea-marketplace.vercel.app/#organization',
      name: 'OliveMarket',
      url: 'https://olea-marketplace.vercel.app',
      description:
        'Marketplace de aceite de oliva virgen extra premium directo del productor',
      foundingDate: '2025',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Spanish', 'English', 'Italian', 'Portuguese'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://olea-marketplace.vercel.app/#website',
      url: 'https://olea-marketplace.vercel.app',
      name: 'OliveMarket',
      publisher: {
        '@id': 'https://olea-marketplace.vercel.app/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target:
          'https://olea-marketplace.vercel.app/olive-oils?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Qué es el aceite de oliva virgen extra?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El aceite de oliva virgen extra (AOVE) es el zumo natural de la aceituna obtenido exclusivamente por procedimientos mecánicos, sin calor excesivo ni disolventes químicos. Debe tener una acidez inferior al 0,8% y superar un panel de cata oficial.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Es seguro comprar aceite de oliva online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, siempre que compres en plataformas con trazabilidad verificable. OliveMarket garantiza que cada aceite proviene directamente del productor, con envío asegurado y pago cifrado SSL/TLS.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto dura el aceite de oliva virgen extra?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Un AOVE bien conservado mantiene sus propiedades durante 12-18 meses desde la fecha de cosecha. Almacénalo en lugar fresco (14-18°C), oscuro y con la botella cerrada.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Puedo vender mi aceite de oliva en OliveMarket?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Crea un perfil de productor gratuito, sube tus productos y empieza a vender directamente a consumidores de toda Europa sin cuotas de alta.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta el aceite de oliva virgen extra de calidad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El precio justo de un AOVE premium oscila entre 8€ y 25€ por litro, dependiendo de la variedad, producción limitada y certificaciones. En OliveMarket encuentras opciones desde 8€/litro.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
