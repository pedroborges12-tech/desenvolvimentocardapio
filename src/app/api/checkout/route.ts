import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActivePaymentProvider } from '@/lib/payments';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export async function OPTIONS() {
  return handleOptions();
}

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
      return corsResponse({ error: 'Preencha todos os campos obrigatórios e adicione ao menos um item.' }, 400);
    }

    const restaurant = await ensureRestaurantSeeded();

    if (!restaurant) {
      return corsResponse({ error: 'Restaurante não encontrado' }, 404);
    }

    if (!restaurant.isOpen) {
      return corsResponse({ error: 'O restaurante está fechado no momento e não está aceitando novos pedidos.' }, 400);
    }

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

    return corsResponse({
      order: updatedOrder,
      charge: chargeResult,
    });
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    return corsResponse({ error: (error as Error).message || 'Erro ao processar pedido' }, 500);
  }
}
