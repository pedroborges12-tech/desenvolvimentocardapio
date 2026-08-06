import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';

export const dynamic = 'force-dynamic';

async function getEmployee() {
  const cookieStore = await cookies();
  const session = cookieStore.get('staff_session');
  if (!session?.value) return null;
  return db.employee.findUnique({
    where: { id: session.value },
    select: { id: true, name: true, restaurantId: true, isActive: true },
  });
}

// GET — comandas abertas do funcionário
export async function GET() {
  try {
    const employee = await getEmployee();
    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { employeeId: employee.id, isTabOpen: true },
      include: { items: { orderBy: { id: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar comandas' }, { status: 500 });
  }
}

// POST — criar nova comanda
export async function POST(req: Request) {
  try {
    const employee = await getEmployee();
    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { customerName, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Adicione ao menos um item' }, { status: 400 });
    }

    const restaurant = await ensureRestaurantSeeded();
    const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
    const dbItems = await db.menuItem.findMany({ where: { id: { in: menuItemIds } } });

    let subtotal = 0;
    const orderItemsData = items.map((ci: { menuItemId: string; quantity: number }) => {
      const mi = dbItems.find((m) => m.id === ci.menuItemId);
      if (!mi) throw new Error(`Item ${ci.menuItemId} não encontrado`);
      subtotal += mi.price * ci.quantity;
      return { menuItemId: mi.id, name: mi.name, quantity: ci.quantity, unitPrice: mi.price };
    });

    const order = await db.order.create({
      data: {
        restaurantId: restaurant.id,
        employeeId: employee.id,
        orderSource: 'IN_STORE',
        isTabOpen: true,
        customerName: customerName?.trim() || 'Cliente',
        customerPhone: '',
        deliveryType: 'PICKUP',
        address: 'Pedido no Local',
        subtotal,
        deliveryFee: 0,
        total: subtotal,
        status: 'OPEN',
        paymentMethod: 'IN_STORE',
        paymentProvider: 'none',
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Erro ao criar comanda' },
      { status: 500 }
    );
  }
}

// PATCH — adicionar itens ou fechar comanda
export async function PATCH(req: Request) {
  try {
    const employee = await getEmployee();
    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { orderId, action, items } = await req.json();

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.employeeId !== employee.id) {
      return NextResponse.json({ error: 'Comanda não encontrada' }, { status: 404 });
    }

    if (!order.isTabOpen) {
      return NextResponse.json({ error: 'Comanda já fechada' }, { status: 400 });
    }

    if (action === 'close') {
      const updated = await db.order.update({
        where: { id: orderId },
        data: { isTabOpen: false, status: 'PENDING' },
        include: { items: true },
      });
      return NextResponse.json(updated);
    }

    if (action === 'add_items' && Array.isArray(items) && items.length > 0) {
      const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
      const dbItems = await db.menuItem.findMany({ where: { id: { in: menuItemIds } } });

      let addedSubtotal = 0;
      const newItems = items.map((ci: { menuItemId: string; quantity: number }) => {
        const mi = dbItems.find((m) => m.id === ci.menuItemId);
        if (!mi) throw new Error(`Item ${ci.menuItemId} não encontrado`);
        addedSubtotal += mi.price * ci.quantity;
        return { orderId, menuItemId: mi.id, name: mi.name, quantity: ci.quantity, unitPrice: mi.price };
      });

      await db.orderItem.createMany({ data: newItems });

      const newTotal = order.total + addedSubtotal;
      const updated = await db.order.update({
        where: { id: orderId },
        data: { subtotal: newTotal, total: newTotal },
        include: { items: { orderBy: { id: 'asc' } } },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Erro ao atualizar comanda' },
      { status: 500 }
    );
  }
}
