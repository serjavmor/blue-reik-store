'use client';

import Link from 'next/link';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, onAddToCart }) {
  const router = useRouter();

  // Calcular porcentaje de descuento para incentivar la compra
  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  // Formatear precios a formato de Pesos Chilenos (CLP)
  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Flujo de compra rápida instantánea
  const handleBuyNow = (e) => {
    e.preventDefault();
    
    // Crear un carrito con únicamente este producto
    const fastCart = [{ ...product, quantity: 1 }];
    localStorage.setItem('aura_cart', JSON.stringify(fastCart));
    
    // Disparar evento para actualizar navbar si es necesario (el navbar lee de localStorage al montar)
    // Redirigir directamente al checkout
    router.push('/checkout');
  };

  return (
    <article className="product-card">
      {discountPercentage > 0 && (
        <span className="product-badge">
          -{discountPercentage}%
        </span>
      )}
      
      <Link href={`/product/${product.id}`} className="product-img-wrapper">
        <img 
          src={product.image} 
          alt={product.title} 
          className="product-img"
          loading="lazy"
        />
      </Link>
      
      <div className="product-info">
        <Link href={`/product/${product.id}`}>
          <h3 className="product-title">{product.title}</h3>
        </Link>
        
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              fill={i < Math.floor(product.rating || 5) ? '#fbbf24' : 'none'} 
              stroke={i < Math.floor(product.rating || 5) ? '#fbbf24' : 'currentColor'} 
            />
          ))}
          <span className="product-rating-count">({product.reviews_count || 12})</span>
        </div>

        <div className="product-price-row" style={{ marginBottom: '12px' }}>
          <span className="product-price">{formatCLP(product.price)}</span>
          {product.original_price && (
            <span className="product-original-price">{formatCLP(product.original_price)}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          {/* Botón Compra Inmediata */}
          <button 
            onClick={handleBuyNow}
            className="btn btn-primary"
            style={{ 
              flex: '1', 
              padding: '10px 8px', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.78rem',
              fontWeight: '700',
              backgroundColor: 'var(--brand-primary)',
              gap: '4px' 
            }}
          >
            <Zap size={14} fill="white" /> Compra Rápida
          </button>
          
          {/* Añadir al Carrito (icono) */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className="btn btn-secondary"
            style={{ 
              padding: '10px 12px', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Añadir al carrito"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
