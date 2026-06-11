'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import SocialProofToast from './SocialProofToast';
import { Flame } from 'lucide-react';

export default function StoreLayout({ children, products }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false); // Para evitar problemas de hidratación en SSR

  // Cargar carrito de LocalStorage al montar en el cliente
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('aura_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error al parsear el carrito de localStorage:', e);
      }
    }
  }, []);

  // Guardar carrito en LocalStorage al cambiar
  const saveCart = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem('aura_cart', JSON.stringify(newItems));
  };

  // Temporizador persistente de 5 horas en LocalStorage (Loss Aversion)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fiveHoursInMs = 5 * 60 * 60 * 1000;
    
    // 1. Obtener o calcular el timestamp de finalización de forma segura
    let endTime;
    const storedEndTime = localStorage.getItem('aura_timer_end');
    
    if (storedEndTime) {
      endTime = parseInt(storedEndTime, 10);
    }

    // Si no existe, es inválido o ya expiró, creamos uno nuevo
    if (!endTime || isNaN(endTime) || endTime < Date.now()) {
      endTime = Date.now() + fiveHoursInMs;
      localStorage.setItem('aura_timer_end', endTime.toString());
    }

    // 2. Función para actualizar el estado del temporizador
    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        // Expiró: Generamos un nuevo ciclo de 5 horas
        const newEndTime = Date.now() + fiveHoursInMs;
        localStorage.setItem('aura_timer_end', newEndTime.toString());
        endTime = newEndTime;
        setTimeLeft({ hours: 5, minutes: 0, seconds: 0 });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTimeLeft({ hours, minutes, seconds });
      }
    };

    // Actualizar inmediatamente
    updateTimer();

    // Actualizar cada segundo
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isMounted]); // Ejecutar cuando el componente se monte en el navegador

  const handleAddToCart = (product) => {
    const existingIndex = cartItems.findIndex((item) => item.id === product.id);
    let newItems = [];
    
    if (existingIndex > -1) {
      newItems = [...cartItems];
      newItems[existingIndex].quantity += 1;
    } else {
      newItems = [...cartItems, { ...product, quantity: 1 }];
    }
    
    saveCart(newItems);
    setIsCartOpen(true); // Abrir carrito automáticamente al añadir
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    const newItems = cartItems.map((item) => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newItems);
  };

  const handleRemoveItem = (productId) => {
    const newItems = cartItems.filter((item) => item.id !== productId);
    saveCart(newItems);
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Formatear temporizador: "HH:MM:SS"
  const formatTimer = () => {
    const h = timeLeft.hours.toString().padStart(2, '0');
    const m = timeLeft.minutes.toString().padStart(2, '0');
    const s = timeLeft.seconds.toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Exponer métodos de carrito a los componentes hijos inyectados por React
  const childrenWithCartProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onAddToCart: handleAddToCart });
    }
    return child;
  });

  return (
    <>
      {/* Banner de Urgencia Superior (Loss Aversion) */}
      <div className="urgency-banner">
        <Flame size={16} fill="white" />
        <span>¡Envío GRATIS y 50% de descuento solo por hoy! La oferta termina en</span>
        {/* Evitar parpadeos de hidratación mostrando un placeholder hasta montar en el cliente */}
        <span className="urgency-timer">{isMounted ? formatTimer() : '05:00:00'}</span>
      </div>

      <Navbar 
        cartCount={totalCount} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <main>{childrenWithCartProps}</main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <SocialProofToast products={products} />
    </>
  );
}

import React from 'react';
export { React };
