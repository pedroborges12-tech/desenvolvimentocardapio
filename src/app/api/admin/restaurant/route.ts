import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';

export async function GET() {
  try {
    const restaurant = await ensureRestaurantSeeded();
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Erro ao buscar status do restaurante:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { isOpen, openingHours, deliveryFee, estimatedDeliveryTime } = body;

    const restaurant = await ensureRestaurantSeeded();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const updated = await db.restaurant.update({
      where: { id: restaurant.id },
      data: {
        isOpen: typeof isOpen === 'boolean' ? isOpen : restaurant.isOpen,
        openingHours: openingHours || restaurant.openingHours,
        deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : restaurant.deliveryFee,
        estimatedDeliveryTime: estimatedDeliveryTime || restaurant.estimatedDeliveryTime,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar dados do restaurante:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
  }
}
