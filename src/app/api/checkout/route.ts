import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActivePaymentProvider } from '@/lib/payments';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      deliveryType,
      address,
      paymentMethod,
      notes,
      items,
    } = body;

    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios e adicione ao menos um item.' }, { status: 400 });
    }

    // Buscar restaurante com garantia de auto-seed
    const restaurant = await ensureRestaurantSeeded();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    if (!restaurant.isOpen) {
      return NextResponse.json({ error: 'O restaurante está fechado no momento e não está aceitando novos pedidos.' }, { status: 400 });
    }

    // Buscar itens do banco de dados e calcular valores seguros
    const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
    const dbMenuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    let subtotal = 0;
    const orderItemsData = items.map((cartItem: { menuItemId: string; quantity: number; notes?: string }) => {
      const menuItem = dbMenuItems.find((dbItem) => dbItem.id === cartItem.menuItemId);
      if (!menuItem) {
        throw new Error(`Item ${cartItem.menuItemId} não encontrado no cardápio.`);
      }
      const itemSubtotal = menuItem.price * cartItem.quantity;
      subtotal += itemSubtotal;

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: cartItem.quantity,
        unitPrice: menuItem.price,
        notes: cartItem.notes || null,
      };
    });

    const deliveryFee = deliveryType === 'DELIVERY' ? restaurant.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    // Criar o Pedido no SQLite com status PENDING
    const order = await db.order.create({
      data: {
        restaurantId: restaurant.id,
        customerName,
        customerPhone,
        deliveryType,
        address: deliveryType === 'DELIVERY' ? address : 'Retirada no Local',
        subtotal,
        deliveryFee,
        total,
        notes,
        status: 'PENDING',
        paymentMethod,
        paymentProvider: getActivePaymentProvider().providerKey,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // Processar Cobrança usando o Adapter Ativo
    const provider = getActivePaymentProvider();
    const chargeResult = await provider.createCharge({
      orderId: order.id,
      amount: total,
      description: `Pedido #${order.orderNumber} - ${restaurant.name}`,
      paymentMethod: paymentMethod === 'PIX' ? 'PIX' : 'CREDIT_CARD',
      customer: {
        name: customerName,
        phone: customerPhone,
      },
    });

    // Atualizar dados de pagamento no pedido
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        paymentId: chargeResult.paymentId,
        pixQrCode: chargeResult.pixQrCode || null,
        pixCopyPaste: chargeResult.pixCopyPaste || null,
        status: chargeResult.status === 'PAID' ? 'PAID' : 'PENDING',
      },
      include: {
        items: true,
        restaurant: true,
      },
    });

    return NextResponse.json({
      order: updatedOrder,
      charge: chargeResult,
    });
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    return NextResponse.json({ error: (error as Error).message || 'Erro ao processar pedido' }, { status: 500 });
  }
}
