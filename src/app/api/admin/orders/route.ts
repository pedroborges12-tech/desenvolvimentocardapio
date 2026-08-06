import { db } from '@/lib/db';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const orders = await db.order.findMany({
      orderBy: { seqNum: 'desc' },
      include: { items: true },
      where: { isTabOpen: false },
    });
    return corsResponse(orders, 200, req);
  } catch (error) {
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
    return corsResponse({ error: 'Erro ao atualizar' }, 500, req);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return corsResponse({ error: 'ID obrigatório' }, 400, req);

    await db.orderItem.deleteMany({ where: { orderId: id } });
    await db.order.delete({ where: { id } });

    return corsResponse({ success: true }, 200, req);
  } catch (error) {
    return corsResponse({ error: 'Erro ao excluir pedido' }, 500, req);
  }
}
