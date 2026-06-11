export default function robots() {
  const baseUrl = 'https://www.tu-dominio.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/_next/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
