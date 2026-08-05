import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActivePaymentProvider } from '@/lib/payments';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        restaurant: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Se o pedido estiver como PENDING e possuir um ID de pagamento, consulta o status no gateway
    if (order.status === 'PENDING' && order.paymentId) {
      const provider = getActivePaymentProvider();
      const statusRes = await provider.getStatus(order.paymentId);

      if (statusRes.status === 'PAID') {
        const updatedOrder = await db.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
          include: {
            items: true,
            restaurant: true,
          },
        });
        return NextResponse.json(updatedOrder);
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erro ao consultar pedido:', error);
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
  }
}
