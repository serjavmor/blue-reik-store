import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Recuperar todas las órdenes (para el panel de administración)
export async function GET() {
  try {
    const db = await getDb();
    
    // Obtener las órdenes con los datos del producto asociado
    const orders = await db.all(`
      SELECT o.*, p.title as product_title, p.image as product_image, p.provider_url as product_provider_url
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.id DESC
    `);
    
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear una nueva orden (Checkout cliente)
export async function POST(request) {
  try {
    const db = await getDb();
    const body = await request.json();
    
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      address, 
      city, 
      country, 
      product_id, 
      quantity 
    } = body;

    // Validación básica
    if (!customer_name || !customer_email || !address || !city || !country || !product_id) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Obtener el precio del producto para calcular el total
    const product = await db.get('SELECT price, stock FROM products WHERE id = ?', [product_id]);
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
    }

    const qty = quantity ? parseInt(quantity) : 1;
    const totalPrice = product.price * qty;

    // Insertar la orden
    const result = await db.run(`
      INSERT INTO orders (
        customer_name, customer_email, customer_phone, address, city, country, product_id, quantity, total_price, status, shipping_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer_name, 
      customer_email, 
      customer_phone || '', 
      address, 
      city, 
      country, 
      product_id, 
      qty, 
      totalPrice, 
      'Completado', // Pago simulado exitoso -> pasa directo a Completado
      'No Enviado'
    ]);

    const orderId = result.lastID;

    // Descontar stock del producto (si hay stock disponible)
    const newStock = Math.max(0, product.stock - qty);
    await db.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, product_id]);

    return NextResponse.json({ 
      success: true, 
      orderId, 
      total_price: totalPrice,
      message: 'Pedido registrado con éxito en la base de datos' 
    });

  } catch (error) {
    console.error('Error al crear orden:', error);
    return NextResponse.json({ success: false, error: 'Error interno al procesar el pedido' }, { status: 500 });
  }
}
