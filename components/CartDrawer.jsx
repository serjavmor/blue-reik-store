'use client';

import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) {
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Formatear precios a CLP
  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`cart-backdrop show`} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className={`cart-drawer show`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--brand-primary)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Tu Carrito ({cartItems.length})</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={48} strokeWidth={1.5} />
            <p>Tu carrito está vacío</p>
            <button onClick={onClose} className="btn btn-secondary">
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--brand-primary)', fontWeight: '700', marginBottom: '8px' }}>
                      {formatCLP(item.price)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.8rem' }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0 12px', fontSize: '0.85rem', fontWeight: '500' }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.8rem' }}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del precio */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Envío:</span>
                <span style={{ color: 'var(--success)', fontWeight: '600' }}>GRATIS (Todo Chile)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
                  {formatCLP(totalPrice)}
                </span>
              </div>
              
              <Link 
                href="/checkout" 
                onClick={onClose}
                className="btn btn-primary btn-block"
                style={{ textDecoration: 'none' }}
              >
                Proceder al Pago <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
