import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const restaurant = await ensureRestaurantSeeded();
    if (!restaurant) {
      return corsResponse({ error: 'Restaurante não encontrado' }, 404);
    }

    const orders = await db.order.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });
    return corsResponse(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos admin:', error);
    return corsResponse({ error: 'Erro ao buscar pedidos' }, 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return corsResponse({ error: 'orderId e status são obrigatórios' }, 400);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return corsResponse(updated);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return corsResponse({ error: 'Erro ao atualizar pedido' }, 500);
  }
}
