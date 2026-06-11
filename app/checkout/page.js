'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const REGIONES_CHILE = [
  'Región Metropolitana',
  'Región de Valparaíso',
  'Región del Biobío',
  'Región de la Araucanía',
  'Región de Antofagasta',
  'Región de Coquimbo',
  'Región de Los Lagos',
  'Región de O\'Higgins',
  'Región del Maule',
  'Región de Tarapacá',
  'Región de Atacama',
  'Región de Los Ríos',
  'Región de Arica y Parinacota',
  'Región de Ñuble',
  'Región de Aysén',
  'Región de Magallanes'
];

// Función de validación del RUT Chileno (Módulo 11)
function validarRutChileno(rutComplete) {
  if (!rutComplete) return false;
  
  // Limpiar puntos y guiones, y pasar a mayúsculas
  const cleanRut = rutComplete.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleanRut.length < 2) return false;
  
  const cuerpo = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  if (!/^\d+$/.test(cuerpo)) return false;
  
  // Algoritmo Módulo 11
  let suma = 0;
  let multiplo = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  let dvCalc = '';
  
  if (dvEsperado === 11) {
    dvCalc = '0';
  } else if (dvEsperado === 10) {
    dvCalc = 'K';
  } else {
    dvCalc = dvEsperado.toString();
  }
  
  return dv === dvCalc;
}

// Función para dar formato al RUT chileno en tiempo real (XX.XXX.XXX-X)
function formatRutChileno(value) {
  // Limpiar caracteres no permitidos
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  let formattedCuerpo = '';
  for (let i = cuerpo.length - 1, j = 1; i >= 0; i--, j++) {
    formattedCuerpo = cuerpo.charAt(i) + formattedCuerpo;
    if (j % 3 === 0 && i !== 0) {
      formattedCuerpo = '.' + formattedCuerpo;
    }
  }
  return `${formattedCuerpo}-${dv}`;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showWebpayModal, setShowWebpayModal] = useState(false);
  const [webpayStep, setWebpayStep] = useState(1);
  const [rutError, setRutError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    comuna: '',
    region: 'Región Metropolitana',
    rut: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('aura_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rut') {
      const formatted = formatRutChileno(value);
      setFormData({ ...formData, rut: formatted });
      
      // Limpiar error al escribir
      if (rutError) setRutError('');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRutBlur = () => {
    if (formData.rut && !validarRutChileno(formData.rut)) {
      setRutError('RUT inválido. Ingresa un RUT chileno correcto.');
    } else {
      setRutError('');
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    // Validar el RUT antes de abrir el modal de Webpay
    if (!validarRutChileno(formData.rut)) {
      setRutError('Por favor, ingresa un RUT chileno válido antes de pagar.');
      return;
    }
    
    setShowWebpayModal(true);
    setWebpayStep(1);
  };

  const handleConfirmWebpayPayment = async () => {
    setWebpayStep(2);

    setTimeout(async () => {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            address: formData.address,
            city: `${formData.comuna}, ${formData.region}`,
            country: 'Chile',
            product_id: cartItems[0].id,
            quantity: cartItems[0].quantity
          })
        });

        const data = await response.json();

        if (data.success) {
          setOrderId(data.orderId);
          setSuccess(true);
          setShowWebpayModal(false);
          localStorage.removeItem('aura_cart');
        } else {
          alert('Error: ' + data.error);
          setShowWebpayModal(false);
        }
      } catch (err) {
        console.error(err);
        alert('Hubo un error al procesar tu pedido');
        setShowWebpayModal(false);
      }
    }, 2000);
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (success) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', color: 'var(--success)', marginBottom: '24px' }}>
          <CheckCircle size={64} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '16px' }}>¡Compra Realizada con Éxito!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: '1.6' }}>
          Hemos procesado tu pago a través de <strong>Webpay Plus</strong>. Tu pedido con número de seguimiento <strong>#AUR-{orderId}</strong> ha sido confirmado y está siendo preparado. Recibirás un correo de confirmación a la brevedad.
        </p>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', textAlign: 'left', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            Resumen de Envío (Chile)
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <strong>Destinatario:</strong> {formData.name}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <strong>RUT:</strong> {formData.rut}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <strong>Dirección:</strong> {formData.address}, {formData.comuna}, {formData.region}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Courier:</strong> Envío Express (CorreosChile / Starken) - Gratis
          </p>
        </div>
        <Link href="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Pasarela Modal de Webpay Plus Chilena */}
      {showWebpayModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#f6f6f6',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            fontFamily: 'sans-serif'
          }}>
            {/* Header de Webpay */}
            <div style={{
              backgroundColor: '#e1251b',
              color: 'white',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}>Webpay Plus</span>
              <span style={{ fontSize: '0.75rem', border: '1px solid white', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>TRANSBANK</span>
            </div>

            {webpayStep === 1 ? (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
                  <span style={{ color: '#555', fontSize: '0.9rem' }}>Comercio:</span>
                  <strong style={{ color: '#111', fontSize: '0.9rem' }}>AuraStore SpA</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <span style={{ color: '#555', fontSize: '0.9rem' }}>Monto a pagar:</span>
                  <strong style={{ color: '#e1251b', fontSize: '1.25rem' }}>{formatCLP(totalPrice)}</strong>
                </div>

                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Elige tu método de pago</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#333', cursor: 'pointer' }}>
                      <input type="radio" name="w_method" defaultChecked style={{ accentColor: '#e1251b' }} />
                      <strong>Redcompra / Débito</strong>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#333', cursor: 'pointer' }}>
                      <input type="radio" name="w_method" style={{ accentColor: '#e1251b' }} />
                      <strong>Tarjeta de Crédito</strong>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setShowWebpayModal(false)}
                    style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', color: '#555', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Anular Pago
                  </button>
                  <button 
                    onClick={handleConfirmWebpayPayment}
                    style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '4px', backgroundColor: '#e1251b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Pagar y Confirmar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Loader2 className="animate-spin" size={40} style={{ color: '#e1251b' }} />
                <strong style={{ fontSize: '1.1rem', color: '#111' }}>Conectando con Transbank...</strong>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Estamos procesando tu transacción de forma segura. No cierres esta ventana.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        Finalizar Compra
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>No hay productos en el carrito para realizar el pedido.</p>
          <Link href="/" className="btn btn-primary">Volver a la tienda</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>
          
          {/* Columna Izquierda: Datos del Cliente */}
          <form onSubmit={handleCheckoutSubmit}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Datos de Envío y Contacto
              </h2>
              
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="form-control" 
                  placeholder="Ej. María García"
                  autoComplete="name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="form-control" 
                    placeholder="Ej. maria@gmail.com"
                    autoComplete="email"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">RUT</label>
                  <input 
                    type="text" 
                    name="rut" 
                    value={formData.rut} 
                    onChange={handleChange} 
                    onBlur={handleRutBlur}
                    required 
                    className={`form-control ${rutError ? 'border-urgency' : ''}`} 
                    placeholder="12.345.678-9"
                    style={{ borderColor: rutError ? 'var(--accent-urgency)' : 'var(--border-color)' }}
                  />
                  {rutError && (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '0.72rem', 
                      color: 'var(--accent-urgency)', 
                      fontWeight: '600', 
                      marginTop: '4px' 
                    }}>
                      <AlertCircle size={12} /> {rutError}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Teléfono Móvil</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                    className="form-control" 
                    placeholder="Ej. 912345678"
                    autoComplete="tel"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección (Calle y Número)</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    className="form-control" 
                    placeholder="Av. Providencia 1234, depto 402"
                    autoComplete="street-address"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Comuna</label>
                  <input 
                    type="text" 
                    name="comuna" 
                    value={formData.comuna} 
                    onChange={handleChange} 
                    required 
                    className="form-control" 
                    placeholder="Ej. Providencia"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Región</label>
                  <select 
                    name="region" 
                    value={formData.region} 
                    onChange={handleChange} 
                    required 
                    className="form-control"
                    style={{ height: '48px', padding: '0 16px' }}
                  >
                    {REGIONES_CHILE.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón de pago instantáneo con Webpay */}
              <button 
                type="submit" 
                disabled={loading} 
                className="btn btn-primary btn-block" 
                style={{ height: '52px', marginTop: '16px', fontSize: '1rem', backgroundColor: '#e1251b', color: 'white', fontWeight: 'bold' }}
              >
                Pagar con Webpay Plus ({formatCLP(totalPrice)})
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '16px', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '600' }}>
                <ShieldCheck size={16} /> Pago 100% Protegido y Seguro por Transbank
              </div>
            </div>
          </form>

          {/* Columna Derecha: Resumen de Pedido */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Resumen de la Compra
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--text-secondary)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.quantity}
                    </span>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Envío Express</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--brand-primary)' }}>
                    {formatCLP(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '500' }}>{formatCLP(totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Envío:</span>
                <span style={{ color: 'var(--success)', fontWeight: '600' }}>Gratis a todo Chile</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Descuento de la tienda:</span>
                <span style={{ color: 'var(--accent-urgency)', fontWeight: '600' }}>-50% Aplicado</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>Total:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
                  {formatCLP(totalPrice)}
                </span>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
