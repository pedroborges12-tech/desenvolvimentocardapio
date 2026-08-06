import { db } from '@/lib/db';
import { ensureRestaurantAdmin } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return corsResponse(orders, 200, req);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
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
    });

    return corsResponse(updated, 200, req);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return corsResponse({ error: 'Erro ao atualizar' }, 500, req);
  }
}
