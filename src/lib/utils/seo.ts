import type { Metadata } from 'next';

const siteConfig = {
  name: 'OliveMarket',
  description: 'Premium extra virgin olive oils from artisan Mediterranean producers. From grove to your table.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://olivemarket.com',
  ogImage: '/og-image.jpg',
  locale: 'en',
  locales: ['en', 'es'],
};

export function generatePageMeta({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const pageTitle = `${title} | ${siteConfig.name}`;
  const pageDescription = description || siteConfig.description;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageImage = image || siteConfig.ogImage;

  return {
    title: pageTitle,
    description: pageDescription,
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: siteConfig.name,
      images: [{ url: pageImage, width: 1200, height: 630, alt: title }],
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        'en': `${siteConfig.url}/en${path}`,
        'es': `${siteConfig.url}/es${path}`,
      },
    },
  };
}

export function generateProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  brand?: string;
  availability?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || siteConfig.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'EUR',
      availability: product.availability || 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: `${siteConfig.url}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@olivemarket.com',
      contactType: 'customer service',
    },
    sameAs: [
      'https://twitter.com/olivemarket',
      'https://instagram.com/olivemarket',
    ],
  };
}

export { siteConfig };
