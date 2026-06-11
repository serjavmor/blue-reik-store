import { getDb } from '@/lib/db';
import StoreLayout from '@/components/StoreLayout';
import ProductCard from '@/components/ProductCard';

// Forzar renderizado dinámico en el servidor para reflejar nuevos productos importados
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = await getDb();
  const products = await db.all('SELECT * FROM products ORDER BY id DESC');

  return (
    <StoreLayout products={products}>
      <StoreContent products={products} />
    </StoreLayout>
  );
}

// Subcomponente de contenido que recibirá la prop 'onAddToCart' inyectada por StoreLayout
function StoreContent({ products, onAddToCart }) {
  return (
    <>
      {/* Hero Section Premium con Estilo Minimalista y Tono Jocoso */}
      <section style={{ 
        padding: '60px 0 40px 0', 
        textAlign: 'center', 
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '48px'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            color: 'var(--brand-primary)',
            display: 'block',
            marginBottom: '12px'
          }}>
            🔥 SELECCIÓN EXCLUSIVA POR BLUE REIK
          </span>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: '16px',
            lineHeight: '1.15'
          }}>
            Los diseños más atrevidos que tu clóset estaba rogando tener
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            maxWidth: '650px',
            margin: '0 auto 24px auto'
          }}>
            Esta es mi selección personal de ropa favorita: diseños atrevidos, novedosos y tan únicos que tus amigas van a querer copiarte el look (estás advertida). La mejor selección de moda de todo Chile elegida a mano por Blue Reik.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Envío gratis a todo Chile (sin sorpresas al pagar)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Pago 100% seguro con Webpay</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Devoluciones sin dramas</span>
          </div>
        </div>
      </section>

      {/* Sección de Categorías en Carrusel Horizontal */}
      <section className="categories-section">
        <div className="container">
          <h2 className="categories-title">Explorar Categorías</h2>
          <div className="categories-container">
            {/* Pantalones */}
            <div className="category-card" style={{ position: 'relative' }}>
              <img src="/images/aerofit_sportset.png" alt="Pantalones" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65))', zIndex: 2 }}></div>
              <span className="category-name" style={{ position: 'relative', zIndex: 3, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontSize: '0.9rem', fontWeight: '800' }}>Pantalones</span>
            </div>
            
            {/* Vestidos */}
            <div className="category-card" style={{ position: 'relative' }}>
              <img src="/images/satin_flow_dress.png" alt="Vestidos" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65))', zIndex: 2 }}></div>
              <span className="category-name" style={{ position: 'relative', zIndex: 3, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontSize: '0.9rem', fontWeight: '800' }}>Vestidos</span>
            </div>
            
            {/* Faldas */}
            <div className="category-card" style={{ position: 'relative' }}>
              <img src="/images/softcloud_sweater.png" alt="Faldas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65))', zIndex: 2 }}></div>
              <span className="category-name" style={{ position: 'relative', zIndex: 3, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontSize: '0.9rem', fontWeight: '800' }}>Faldas</span>
            </div>
            
            {/* Calzado */}
            <div className="category-card" style={{ position: 'relative' }}>
              <img src="/images/aerofit_sportset.png" alt="Calzado" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65))', zIndex: 2 }}></div>
              <span className="category-name" style={{ position: 'relative', zIndex: 3, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontSize: '0.9rem', fontWeight: '800' }}>Calzado</span>
            </div>
            
            {/* Ropa Interior */}
            <div className="category-card" style={{ position: 'relative' }}>
              <img src="/images/aerofit_sportset.png" alt="Ropa Interior" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65))', zIndex: 2 }}></div>
              <span className="category-name" style={{ position: 'relative', zIndex: 3, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontSize: '0.9rem', fontWeight: '800' }}>Ropa Interior</span>
            </div>
            
            {/* Categoría Ropa Hot con efecto Blur */}
            <div className="category-card category-hot" style={{ position: 'relative' }}>
              <img src="/images/satin_flow_dress.png" alt="Ropa Hot" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              <div className="hot-blur-overlay" style={{ zIndex: 2 }}>
                <span style={{ fontSize: '2rem' }}>🔥</span>
                <span className="hot-name">Ropa Hot</span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: '10px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Privado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Productos */}
      <section style={{ marginBottom: '80px' }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'baseline', 
            marginBottom: '32px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '16px'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Colección Exclusiva</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{products.length} productos disponibles</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '30px' 
          }}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart} 
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
