'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  Clock, 
  Download, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'import'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Estado para la importación
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedProduct, setImportedProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [importError, setImportError] = useState('');

  // Estados para actualizar el tracking de órdenes
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [trackingNum, setTrackingNum] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- LÓGICA DE IMPORTACIÓN ---
  const handleAnalyzeUrl = async () => {
    if (!importUrl) return;
    setImporting(true);
    setImportError('');
    setImportedProduct(null);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: importUrl })
      });

      const data = await res.json();

      if (data.success) {
        // Adaptar precio extraído en USD a CLP multiplicado por un factor de tipo de cambio estimado
        // por ejemplo, multiplicar USD por 930 CLP y redondear al millar/centena más cercano
        const usdPrice = data.product.price;
        const clpEstimatedPrice = usdPrice ? Math.round((usdPrice * 930) / 100) * 100 : '';
        
        setImportedProduct({
          ...data.product,
          price: clpEstimatedPrice,
          original_price: clpEstimatedPrice ? clpEstimatedPrice * 2 : '' // Precio original doble
        });
      } else {
        setImportError(data.error);
        if (data.fallback) {
          setImportedProduct({
            title: '',
            description: '',
            price: '',
            original_price: '',
            image: '',
            provider_url: importUrl,
            provider: data.provider || 'Desconocido',
            stock: 5
          });
        }
      }
    } catch (e) {
      setImportError('Error de red al intentar conectarse al servidor.');
    } finally {
      setImporting(false);
    }
  };

  const handleSaveImportedProduct = async () => {
    if (!importedProduct) return;
    setSavingProduct(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importedProduct)
      });

      const data = await res.json();

      if (data.success) {
        alert('¡Producto importado y publicado con éxito en tu tienda!');
        setImportedProduct(null);
        setImportUrl('');
        setActiveTab('orders'); // Volver a las ventas
        fetchOrders();
      } else {
        alert('Error al guardar el producto: ' + data.error);
      }
    } catch (e) {
      alert('Error de red al intentar guardar.');
    } finally {
      setSavingProduct(false);
    }
  };

  // --- GESTIÓN DE ENVÍOS (TRACKING) ---
  const handleSaveTracking = async (orderId) => {
    if (!trackingNum) return;
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracking_number: trackingNum,
          shipping_status: 'En Camino'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Número de seguimiento guardado y estado actualizado a "En Camino".');
        setEditingOrderId(null);
        setTrackingNum('');
        fetchOrders(); // Recargar órdenes
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Error de red al actualizar.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido de la base de datos?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('Pedido eliminado con éxito.');
        fetchOrders();
      }
    } catch (e) {
      alert('Error al eliminar.');
    }
  };

  // KPIs Financieros
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);
  const pendingOrders = orders.filter(o => o.shipping_status === 'No Enviado').length;
  const shippedOrders = orders.filter(o => o.shipping_status === 'En Camino' || o.shipping_status === 'Entregado').length;

  // Formatear CLP
  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Panel de Administración</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dropshipping Store Control (Chile)</p>
        </div>
        <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
          Ver Tienda Pública →
        </Link>
      </div>

      {/* KPIs Financieros (Dashboard) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '24px', 
        marginBottom: '40px' 
      }}>
        {/* Ventas */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', padding: '12px', borderRadius: '50%' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Ingresos Totales (CLP)</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px' }}>{formatCLP(totalRevenue)}</h3>
          </div>
        </div>

        {/* Pedidos */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '12px', borderRadius: '50%' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pedidos Totales</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '4px' }}>{orders.length}</h3>
          </div>
        </div>

        {/* Pendientes */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--accent-urgency-bg)', color: 'var(--accent-urgency)', padding: '12px', borderRadius: '50%' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Por Procesar</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-urgency)' }}>{pendingOrders}</h3>
          </div>
        </div>

        {/* Enviados */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '12px', borderRadius: '50%' }}>
            <Truck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Enviados</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '4px', color: 'var(--success)' }}>{shippedOrders}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px', paddingBottom: '1px' }}>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ 
            padding: '12px 20px', 
            fontWeight: '600', 
            fontSize: '0.95rem',
            color: activeTab === 'orders' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'orders' ? '3px solid var(--brand-primary)' : '3px solid transparent',
            marginBottom: '-2px'
          }}
        >
          Ventas y Envíos ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('import')}
          style={{ 
            padding: '12px 20px', 
            fontWeight: '600', 
            fontSize: '0.95rem',
            color: activeTab === 'import' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'import' ? '3px solid var(--brand-primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={16} /> Importar Producto
        </button>
      </div>

      {/* TAB: ORDENES / VENTAS */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Listado de Ventas Recientes</h2>
          
          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>Cargando ventas...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              No hay ventas registradas todavía. ¡Haz una compra de prueba en el checkout!
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    <th style={{ padding: '16px' }}>Pedido</th>
                    <th style={{ padding: '16px' }}>Cliente</th>
                    <th style={{ padding: '16px' }}>Producto</th>
                    <th style={{ padding: '16px' }}>Total</th>
                    <th style={{ padding: '16px' }}>Estado Envío</th>
                    <th style={{ padding: '16px' }}>Gestión Dropshipping</th>
                    <th style={{ padding: '16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', verticalAlign: 'top' }}>
                      {/* Pedido ID */}
                      <td style={{ padding: '16px', fontWeight: '700' }}>
                        #AUR-{order.id}
                        <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      
                      {/* Cliente */}
                      <td style={{ padding: '16px' }}>
                        <strong>{order.customer_name}</strong>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                          {order.customer_email} <br />
                          {order.customer_phone} <br />
                          {order.address}, {order.city}, {order.country}
                        </div>
                      </td>
                      
                      {/* Producto */}
                      <td style={{ padding: '16px', display: 'flex', gap: '8px', alignItems: 'center', border: 'none' }}>
                        {order.product_image && (
                          <img 
                            src={order.product_image} 
                            alt={order.product_title} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                          />
                        )}
                        <div>
                          <span style={{ fontWeight: '500' }}>{order.product_title || 'Producto Eliminado'}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Qty: {order.quantity}</div>
                        </div>
                      </td>
                      
                      {/* Total */}
                      <td style={{ padding: '16px', fontWeight: '700', color: 'var(--brand-primary)' }}>
                        {formatCLP(order.total_price || 0)}
                      </td>
                      
                      {/* Estado Envío */}
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          backgroundColor: order.shipping_status === 'No Enviado' ? 'var(--accent-urgency-bg)' : 'var(--success-bg)',
                          color: order.shipping_status === 'No Enviado' ? 'var(--accent-urgency)' : 'var(--success)'
                        }}>
                          {order.shipping_status}
                        </span>
                        {order.tracking_number && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Track: <strong>{order.tracking_number}</strong>
                          </div>
                        )}
                      </td>
                      
                      {/* Gestión Dropshipping */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Botón Comprar en Proveedor */}
                          {order.product_provider_url ? (
                            <a 
                              href={order.product_provider_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.75rem', 
                                borderRadius: '4px',
                                gap: '4px',
                                display: 'inline-flex',
                                width: 'fit-content'
                              }}
                            >
                              Comprar en AliExpress/Temu <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cargado manualmente</span>
                          )}

                          {/* Input Tracking */}
                          {editingOrderId === order.id ? (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                placeholder="ID de Tracking" 
                                value={trackingNum} 
                                onChange={(e) => setTrackingNum(e.target.value)}
                                className="form-control"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', width: '130px' }}
                              />
                              <button 
                                onClick={() => handleSaveTracking(order.id)}
                                className="btn btn-primary"
                                style={{ padding: '4px 8px', height: '28px', display: 'flex', alignItems: 'center' }}
                              >
                                <Save size={12} />
                              </button>
                              <button 
                                onClick={() => setEditingOrderId(null)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', height: '28px', display: 'flex', alignItems: 'center' }}
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingOrderId(order.id);
                                setTrackingNum(order.tracking_number || '');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', width: 'fit-content' }}
                            >
                              {order.tracking_number ? 'Editar Tracking' : 'Añadir Tracking'}
                            </button>
                          )}
                        </div>
                      </td>
                      
                      {/* Borrar */}
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: IMPORTAR PRODUCTO */}
      {activeTab === 'import' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Importador Asistido de Catálogo
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
              Pega el enlace del producto de **AliExpress**, **Temu** o **Shein**. El sistema leerá automáticamente la información en dólares e intentará hacer la conversión automática a pesos chilenos (CLP) para publicarlo en un click.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="url" 
                placeholder="Ej. https://es.aliexpress.com/item/1005001234.html" 
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="form-control"
                style={{ flexGrow: 1, height: '48px' }}
              />
              <button 
                onClick={handleAnalyzeUrl}
                disabled={importing || !importUrl}
                className="btn btn-primary"
                style={{ height: '48px', padding: '0 24px', gap: '8px', minWidth: '150px' }}
              >
                {importing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Analizando...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Analizar Enlace
                  </>
                )}
              </button>
            </div>

            {importError && (
              <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: 'var(--accent-urgency-bg)', border: '1px dashed var(--accent-urgency)', color: 'var(--accent-urgency)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                {importError}
              </div>
            )}
          </div>

          {/* Formulario Asistido / Edición Preliminar */}
          {importedProduct && (
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Edición de Producto Importado
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '20px' }}>
                {/* Imagen Previa */}
                <div>
                  <span className="form-label">Imagen del Producto</span>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {importedProduct.image ? (
                      <img src={importedProduct.image} alt="Previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin imagen</span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="URL de la imagen" 
                    value={importedProduct.image}
                    onChange={(e) => setImportedProduct({ ...importedProduct, image: e.target.value })}
                    className="form-control"
                    style={{ marginTop: '8px', fontSize: '0.75rem', padding: '8px' }}
                  />
                </div>

                {/* Datos */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Título del Producto</label>
                    <input 
                      type="text" 
                      value={importedProduct.title}
                      onChange={(e) => setImportedProduct({ ...importedProduct, title: e.target.value })}
                      className="form-control"
                      placeholder="Título llamativo para tu tienda"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Precio de Venta (CLP)</label>
                      <input 
                        type="number" 
                        value={importedProduct.price}
                        onChange={(e) => setImportedProduct({ ...importedProduct, price: e.target.value })}
                        className="form-control"
                        placeholder="Ej. 29990"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Precio de Anclaje (CLP)</label>
                      <input 
                        type="number" 
                        value={importedProduct.original_price}
                        onChange={(e) => setImportedProduct({ ...importedProduct, original_price: e.target.value })}
                        className="form-control"
                        placeholder="Ej. 59990"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea 
                  rows="4" 
                  value={importedProduct.description}
                  onChange={(e) => setImportedProduct({ ...importedProduct, description: e.target.value })}
                  className="form-control"
                  placeholder="Escribe una descripción persuasiva..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Stock disponible (Urgencia)</label>
                  <input 
                    type="number" 
                    value={importedProduct.stock}
                    onChange={(e) => setImportedProduct({ ...importedProduct, stock: e.target.value })}
                    className="form-control"
                    placeholder="Ej. 3 para urgencia"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Proveedor</label>
                  <input 
                    type="text" 
                    value={importedProduct.provider}
                    disabled
                    className="form-control"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setImportedProduct(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveImportedProduct}
                  disabled={savingProduct || !importedProduct.title || !importedProduct.price || !importedProduct.image}
                  className="btn btn-primary"
                  style={{ gap: '8px' }}
                >
                  {savingProduct ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  Guardar y Publicar en Tienda
                </button>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
