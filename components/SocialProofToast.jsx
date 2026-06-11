'use client';

import { useState, useEffect } from 'react';

const mockNames = ['Sofía', 'Lucía', 'Marta', 'Valeria', 'Daniela', 'Elena', 'Laura', 'Carmen', 'Paula', 'Sara'];
const mockCities = ['Santiago', 'Concepción', 'Viña del Mar', 'Valparaíso', 'Antofagasta', 'La Serena', 'Temuco', 'Iquique', 'Rancagua', 'Talca'];
const mockTimes = ['hace 2 minutos', 'hace 5 minutos', 'hace 1 minuto', 'hace 7 minutos', 'hace 3 minutos'];

export default function SocialProofToast({ products }) {
  const [show, setShow] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (!products || products.length === 0) return;

    // Retardo inicial antes de la primera notificación
    const initialTimeout = setTimeout(() => {
      triggerNotification();
    }, 5000);

    // Bucle para repetir las notificaciones de forma periódica
    const interval = setInterval(() => {
      triggerNotification();
    }, 25000); // Cada 25 segundos se muestra una notificación diferente

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products]);

  const triggerNotification = () => {
    // Cerrar la notificación anterior primero
    setShow(false);

    // Esperar a que se oculte y luego mostrar la nueva
    setTimeout(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomCity = mockCities[Math.floor(Math.random() * mockCities.length)];
      const randomTime = mockTimes[Math.floor(Math.random() * mockTimes.length)];

      setCurrentNotification({
        product: randomProduct,
        name: randomName,
        city: randomCity,
        time: randomTime
      });

      setShow(true);

      // Ocultar automáticamente después de 6 segundos
      setTimeout(() => {
        setShow(false);
      }, 6000);

    }, 400);
  };

  if (!currentNotification) return null;

  return (
    <div className={`social-proof-toast ${show ? 'show' : ''}`}>
      <img 
        src={currentNotification.product.image} 
        alt={currentNotification.product.title} 
        className="social-proof-img"
      />
      <div className="social-proof-text">
        <strong>{currentNotification.name}</strong> de {currentNotification.city} <br />
        compró <strong>{currentNotification.product.title}</strong> <br />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentNotification.time}</span>
      </div>
    </div>
  );
}
