import { db } from '@/lib/db';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'day';

    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED', 'OPEN'] },
        isTabOpen: false,
      },
      select: { total: true, orderSource: true, seqNum: true },
    });

    const deliveryOrders = orders.filter((o) => o.orderSource === 'DELIVERY');
    const inStoreOrders = orders.filter((o) => o.orderSource === 'IN_STORE');

    return corsResponse(
      {
        period,
        totalRevenue: orders.reduce((s, o) => s + o.total, 0),
        totalOrders: orders.length,
        deliveryCount: deliveryOrders.length,
        inStoreCount: inStoreOrders.length,
        deliveryRevenue: deliveryOrders.reduce((s, o) => s + o.total, 0),
        inStoreRevenue: inStoreOrders.reduce((s, o) => s + o.total, 0),
      },
      200,
      req
    );
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return corsResponse({ error: 'Erro ao buscar estatísticas' }, 500, req);
  }
}
