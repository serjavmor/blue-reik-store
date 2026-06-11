import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PUT: Actualizar estados de envío o tracking
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    const body = await request.json();

    const { status, shipping_status, tracking_number } = body;

    // Verificar si el pedido existe
    const order = await db.get('SELECT id FROM orders WHERE id = ?', [id]);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Actualizar campos
    await db.run(`
      UPDATE orders 
      SET status = COALESCE(?, status),
          shipping_status = COALESCE(?, shipping_status),
          tracking_number = COALESCE(?, tracking_number)
      WHERE id = ?
    `, [status, shipping_status, tracking_number, id]);

    return NextResponse.json({ success: true, message: 'Pedido actualizado con éxito' });

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return NextResponse.json({ success: false, error: 'Error interno al actualizar el pedido' }, { status: 500 });
  }
}

// DELETE: Eliminar un pedido
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();

    const order = await db.get('SELECT id FROM orders WHERE id = ?', [id]);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
    }

    await db.run('DELETE FROM orders WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Pedido eliminado de la base de datos' });

  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    return NextResponse.json({ success: false, error: 'Error interno al eliminar el pedido' }, { status: 500 });
  }
}
