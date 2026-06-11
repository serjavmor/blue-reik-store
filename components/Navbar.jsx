'use client';

import Link from 'next/link';
import { ShoppingBag, ShieldAlert } from 'lucide-react';

export default function Navbar({ cartCount, onCartClick }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          <span style={{ fontSize: '1.8rem' }}>✦</span> Blue Reik Store
        </Link>
        
        <nav>
          <ul className="navbar-nav">
            <li>
              <Link href="/" className="navbar-link">
                Tienda
              </Link>
            </li>
            <li>
              <button 
                onClick={onCartClick} 
                className="btn btn-secondary" 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  position: 'relative' 
                }}
              >
                <ShoppingBag size={18} />
                <span>Carrito</span>
                {cartCount > 0 && (
                  <span 
                    style={{ 
                      position: 'absolute', 
                      top: '-6px', 
                      right: '-6px', 
                      backgroundColor: 'var(--brand-primary)', 
                      color: 'white', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      borderRadius: '50%', 
                      width: '20px', 
                      height: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
