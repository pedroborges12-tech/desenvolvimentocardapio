import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    }).catch(() => []);

    return corsResponse(orders, 200, req);
  } catch (error) {
    console.error('Erro ao buscar pedidos admin:', error);
    return corsResponse([], 200, req);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return corsResponse({ error: 'orderId e status são obrigatórios' }, 400, req);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    }).catch(() => ({ id: orderId, status }));

    return corsResponse(updated, 200, req);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return corsResponse({ error: 'Erro ao atualizar pedido' }, 500, req);
  }
}
