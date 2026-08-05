import { NextResponse } from 'next/server';
import { getActivePaymentProvider } from '@/lib/payments';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const provider = getActivePaymentProvider();

    const webhookResult = await provider.webhookHandler(payload);

    if (webhookResult.handled && webhookResult.paymentId && webhookResult.status === 'PAID') {
      await db.order.updateMany({
        where: { paymentId: webhookResult.paymentId },
        data: { status: 'PAID' },
      });
    }

    return NextResponse.json({ received: true, handled: webhookResult.handled });
  } catch (error) {
    console.error('Erro no webhook de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
