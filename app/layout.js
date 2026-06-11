import './globals.css';
import { Outfit, Inter } from 'next/font/google';

// Carga optimizada de fuentes con next/font para evitar CLS y optimizar LCP
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Blue Reik Store | Tu tienda de Moda Femenina Premium',
  description: 'Descubre nuestra colección exclusiva de vestidos de satén, jerseys de punto trenzado y conjuntos deportivos sin costuras. Envíos express gratis y 50% de descuento solo hoy.',
  metadataBase: new URL('https://www.tu-dominio.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'Blue Reik Store | Tu tienda de Moda Femenina Premium',
    description: 'Colección exclusiva de vestidos de satén, jerseys y conjuntos de alta calidad. Envío gratis solo hoy.',
    url: 'https://www.tu-dominio.com',
    siteName: 'Blue Reik Store',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
