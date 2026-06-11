import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST: Crear un nuevo producto (Panel Admin)
export async function POST(request) {
  try {
    const db = await getDb();
    const body = await request.json();

    const { 
      title, 
      description, 
      price, 
      original_price, 
      image, 
      provider_url, 
      provider,
      stock 
    } = body;

    // Validación básica
    if (!title || !price || !image) {
      return NextResponse.json({ success: false, error: 'Título, precio e imagen son obligatorios' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = original_price ? parseFloat(original_price) : parsedPrice * 1.8;
    const parsedStock = stock ? parseInt(stock) : 5;

    // Insertar en base de datos
    const result = await db.run(`
      INSERT INTO products (
        title, description, price, original_price, image, provider_url, provider, stock, rating, reviews_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, 
      description || '', 
      parsedPrice, 
      parsedOriginalPrice, 
      image, 
      provider_url || '', 
      provider || 'Otros',
      parsedStock,
      4.8, // Calificación inicial mock para conversión
      1 // reviews count inicial
    ]);

    const productId = result.lastID;

    // Crear una review inicial automática para este producto para optimizar conversiones
    await db.run(`
      INSERT INTO reviews (product_id, author, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [
      productId,
      'Cliente Confirmado',
      5,
      '¡Increíble la horma y lo bien que queda puesto! Es una prenda con un diseño súper novedoso y atrevido, justo lo que buscaba. Todo el proceso de compra con Webpay estuvo correcto y me respondieron de inmediato cuando consulté por chat. El número de seguimiento funcionó perfecto en Starken y no tuve ningún problema para rastrear el paquete. ¡Recomiendo totalmente la selección de Blue Reik!'
    ]);

    return NextResponse.json({ 
      success: true, 
      productId, 
      message: 'Producto creado y publicado con éxito en el catálogo' 
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ success: false, error: 'Error interno al registrar el producto' }, { status: 500 });
  }
}
