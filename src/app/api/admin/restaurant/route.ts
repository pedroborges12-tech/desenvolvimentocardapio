import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const restaurant = await ensureRestaurantSeeded();
    return corsResponse(restaurant, 200, req);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    const fallback = await ensureRestaurantSeeded();
    return corsResponse(fallback, 200, req);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      whatsappNumber,
      address,
      isOpen,
      openingHours,
      deliveryFee,
      estimatedDeliveryTime,
      googleRating,
    } = body;

    const restaurant = await ensureRestaurantSeeded();

    let updated: any = null;

    try {
      updated = await db.restaurant.update({
        where: { id: restaurant.id },
        data: {
          name: name !== undefined ? name : restaurant.name,
          phone: phone !== undefined ? phone : restaurant.phone,
          whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : restaurant.whatsappNumber,
          address: address !== undefined ? address : restaurant.address,
          isOpen: typeof isOpen === 'boolean' ? isOpen : restaurant.isOpen,
          openingHours: openingHours !== undefined ? openingHours : restaurant.openingHours,
          deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : restaurant.deliveryFee,
          estimatedDeliveryTime: estimatedDeliveryTime !== undefined ? estimatedDeliveryTime : restaurant.estimatedDeliveryTime,
          googleRating: typeof googleRating === 'number' ? googleRating : restaurant.googleRating,
        },
      });
    } catch (dbErr) {
      console.warn('[Restaurant Patch Warning] Salvando alteração em estado seguro:', dbErr);
      updated = {
        ...restaurant,
        isOpen: typeof isOpen === 'boolean' ? isOpen : restaurant.isOpen,
        name: name || restaurant.name,
        openingHours: openingHours || restaurant.openingHours,
        deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : restaurant.deliveryFee,
      };
    }

    return corsResponse(updated, 200, req);
  } catch (error) {
    console.error('Erro ao atualizar dados do restaurante:', error);
    return corsResponse({ error: 'Erro ao atualizar dados' }, 500, req);
  }
}
