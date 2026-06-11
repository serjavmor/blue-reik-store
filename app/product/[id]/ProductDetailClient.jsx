'use client';

import { useState } from 'react';
import { Star, ShieldCheck, Truck, RefreshCw, CreditCard, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductDetailClient({ product, reviews, onAddToCart }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAdd = () => {
    // Añadir al carrito con la cantidad seleccionada
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
  };

  // Compra rápida instantánea
  const handleBuyNow = () => {
    const fastCart = [{ ...product, quantity: quantity }];
    localStorage.setItem('aura_cart', JSON.stringify(fastCart));
    router.push('/checkout');
  };

  // Formatear precios a CLP
  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <section style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Enlace de volver */}
        <div style={{ marginBottom: '24px' }}>
          <a href="/" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            ← Volver a la tienda
          </a>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '48px',
          alignItems: 'start',
          marginBottom: '60px'
        }}>
          {/* Columna Izquierda: Imagen del Producto */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ 
              position: 'relative',
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden',
              aspectRatio: '1',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {discountPercentage > 0 && (
                <span className="product-badge" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  Ahorra {discountPercentage}%
                </span>
              )}
              <img 
                src={product.image} 
                alt={product.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Columna Derecha: Detalles del Producto */}
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
              {product.title}
            </h1>

            {/* Valoraciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating || 5) ? '#fbbf24' : 'none'} 
                    stroke={i < Math.floor(product.rating || 5) ? '#fbbf24' : 'currentColor'} 
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{product.rating || 4.8}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>| {reviews.length} valoraciones de clientes</span>
            </div>

            {/* Precios (Price Psychology) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: '12px', 
              padding: '16px', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '24px' 
            }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
                {formatCLP(product.price)}
              </span>
              {product.original_price && (
                <>
                  <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {formatCLP(product.original_price)}
                  </span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '700', 
                    backgroundColor: 'var(--brand-primary)', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '10px',
                    marginLeft: 'auto'
                  }}>
                    ¡OFERTA DEL DÍA!
                  </span>
                </>
              )}
            </div>

            {/* Mensaje de Escasez de Stock (Loss Aversion) */}
            {product.stock <= 5 && (
              <div style={{ 
                backgroundColor: 'var(--accent-urgency-bg)', 
                border: '1px dashed var(--accent-urgency)', 
                color: 'var(--accent-urgency)', 
                padding: '12px 16px', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>🚨</span>
                <span>¡Quedan solo {product.stock} unidades en stock! Más de 15 personas tienen este producto en su carrito ahora mismo.</span>
              </div>
            )}

            {/* Descripción */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Descripción del Producto</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {product.description}
              </p>
            </div>

            {/* Selector de cantidad y botones de compra (Fricción cero) */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Cantidad</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '48px' }}>
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    style={{ padding: '0 16px', backgroundColor: 'var(--bg-secondary)', fontWeight: 'bold' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 16px', minWidth: '40px', textAlign: 'center', fontWeight: '600' }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    style={{ padding: '0 16px', backgroundColor: 'var(--bg-secondary)', fontWeight: 'bold' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'row', gap: '12px', width: '100%', marginTop: '24px' }}>
                {/* Botón Compra Inmediata */}
                <button 
                  onClick={handleBuyNow}
                  className="btn btn-primary"
                  style={{ flex: '1', height: '48px', gap: '8px', fontWeight: '700', fontSize: '0.95rem' }}
                >
                  <Zap size={18} fill="white" /> Compra Inmediata
                </button>
                
                {/* Añadir al Carrito */}
                <button 
                  onClick={handleAdd}
                  className="btn btn-secondary"
                  style={{ height: '48px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Añadir al Carrito"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>

            {/* Garantías de Dropshipping (Confianza extrema) */}
            <div style={{ 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '24px', 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '16px',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Pago Seguro Protegido</strong>
                  <p style={{ marginBottom: '8px' }}>Transacción encriptada a través de la pasarela segura Webpay Plus.</p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '1.2rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>WEBPAY PLUS</span>
                    <span style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold', backgroundColor: '#e1251b', color: 'white' }}>Redcompra</span>
                    <span style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold' }}>Débito / Crédito</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Reseñas / Opiniones */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Opiniones de los Clientes</h2>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aún no hay opiniones de este producto. Sé el primero en valorarlo.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{review.author}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(review.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', marginBottom: '8px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < review.rating ? '#fbbf24' : 'none'} 
                        stroke={i < review.rating ? '#fbbf24' : 'currentColor'} 
                      />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
