import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    const dateStr = new Date(order.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const isPaid = order.status === 'PAID';

    // Gerar string formatada em texto puro compatível com impressoras térmicas ESC/POS
    const lines: string[] = [];
    lines.push('========================================');
    lines.push(`       ${(order.restaurant?.name || 'BURGER & CO.').toUpperCase()}`);
    lines.push('       COMPROVANTE DE PEDIDO');
    lines.push('========================================');
    lines.push(`PEDIDO: #${order.orderNumber}`);
    lines.push(`DATA: ${dateStr}`);
    lines.push('----------------------------------------');
    lines.push(`CLIENTE: ${order.customerName}`);
    lines.push(`TELEFONE: ${order.customerPhone}`);
    lines.push(`TIPO: ${order.deliveryType === 'DELIVERY' ? 'DELIVERY / ENTREGA' : 'RETIRADA NO BALCAO'}`);
    if (order.deliveryType === 'DELIVERY' && order.address) {
      lines.push(`ENDERECO: ${order.address}`);
    }
    lines.push('----------------------------------------');
    lines.push('[!] PAGAMENTO E COBRANCA:');
    lines.push(`METODO: ${order.paymentMethod}`);
    if (isPaid) {
      lines.push('>>> PAGO ONLINE (NAO COBRAR) <<<');
    } else {
      lines.push(`>>> COBRAR NA ENTREGA: R$ ${order.total.toFixed(2).replace('.', ',')} <<<`);
    }
    lines.push('----------------------------------------');
    lines.push('QTD ITEM                       VALOR');
    lines.push('----------------------------------------');

    order.items.forEach((item) => {
      const lineItem = `${item.quantity}x ${item.name}`.padEnd(30, ' ');
      const valStr = `R$ ${(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}`;
      lines.push(`${lineItem} ${valStr}`);
      if (item.notes) {
        lines.push(`   * Obs: ${item.notes}`);
      }
    });

    lines.push('----------------------------------------');
    lines.push(`SUBTOTAL:            R$ ${order.subtotal.toFixed(2).replace('.', ',')}`);
    if (order.deliveryFee > 0) {
      lines.push(`TAXA DE ENTREGA:     R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}`);
    }
    lines.push(`TOTAL DO PEDIDO:     R$ ${order.total.toFixed(2).replace('.', ',')}`);
    lines.push('========================================');
    lines.push('       OBRIGADO PELA PREFERENCIA!       ');
    lines.push('\n\n\n'); // Espaço para corte de papel

    const plainText = lines.join('\n');

    return new NextResponse(plainText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar cupom térmico ESC/POS:', error);
    return NextResponse.json({ error: 'Erro ao gerar cupom' }, { status: 500 });
  }
}
