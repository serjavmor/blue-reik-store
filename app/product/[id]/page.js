import { getDb } from '@/lib/db';
import StoreLayout from '@/components/StoreLayout';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Generar metadatos para SEO de forma dinámica
export async function generateMetadata({ params }) {
  const { id } = await params;
  const db = await getDb();
  const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

  if (!product) {
    return {
      title: 'Producto no encontrado | Blue Reik Store',
      description: 'El producto que buscas no está disponible.'
    };
  }

  return {
    title: `${product.title} | Blue Reik Store`,
    description: product.description ? product.description.substring(0, 160) : '',
    alternates: {
      canonical: `https://www.tu-dominio.com/product/${product.id}`
    },
    openGraph: {
      title: `${product.title} | Blue Reik Store`,
      description: product.description ? product.description.substring(0, 160) : '',
      images: [
        {
          url: product.image.startsWith('http') ? product.image : `https://www.tu-dominio.com${product.image}`,
          width: 800,
          height: 800,
          alt: product.title
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const db = await getDb();
  
  // Consultar producto y reviews
  const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
  
  if (!product) {
    notFound();
  }

  const reviews = await db.all('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC', [id]);
  const allProducts = await db.all('SELECT * FROM products');

  // Insertar datos estructurados JSON-LD Schema.org para SEO en buscadores
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.title,
    'image': product.image.startsWith('http') ? product.image : `https://www.tu-dominio.com${product.image}`,
    'description': product.description,
    'offers': {
      '@type': 'Offer',
      'price': product.price,
      'priceCurrency': 'USD',
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.rating || 4.8,
      'reviewCount': product.reviews_count || 12
    }
  };

  return (
    <>
      {/* Estructura JSON-LD inyectada en la cabecera para Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <StoreLayout products={allProducts}>
        <ProductDetailClient product={product} reviews={reviews} />
      </StoreLayout>
    </>
  );
}
