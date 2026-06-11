import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = 'https://www.tu-dominio.com';
  
  // URL de la portada
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    }
  ];

  try {
    const db = await getDb();
    // Obtener todos los productos para el sitemap dinámico
    const products = await db.all('SELECT id, created_at FROM products');

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    }));

    return [...staticUrls, ...productUrls];
  } catch (error) {
    console.error('Error al generar sitemap:', error);
    return staticUrls;
  }
}
