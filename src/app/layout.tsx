import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Burger & Co. Artisan | Cardápio Digital & Pedidos Online',
  description: 'Faça seu pedido online no Burger & Co. Artisan. Hambúrgueres artesanais de Wagyu e Black Angus com entrega rápida e pagamento Pix automatizado.',
  openGraph: {
    title: 'Burger & Co. Artisan | Hambúrgueres Artesanais Gourmet',
    description: 'Peça os melhores hambúrgueres artesanais com entrega rápida na sua casa.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Burger & Co. Artisan',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Paulista, 1200',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    servesCuisine: 'Hambúrguer Gourmet / Americana',
    priceRange: '$$',
    telephone: '+5511998876655',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '524',
    },
  };

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
