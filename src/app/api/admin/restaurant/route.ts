import { db } from '@/lib/db';
import { ensureRestaurantAdmin } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const restaurant = await ensureRestaurantAdmin();
    return corsResponse(restaurant, 200, req);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    return corsResponse({ error: 'Erro interno' }, 500, req);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const restaurant = await ensureRestaurantAdmin();

    const updated = await db.restaurant.update({
      where: { id: restaurant.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.whatsappNumber !== undefined && { whatsappNumber: body.whatsappNumber }),
        ...(body.address !== undefined && { address: body.address }),
        ...(typeof body.isOpen === 'boolean' && { isOpen: body.isOpen }),
        ...(body.openingHours !== undefined && { openingHours: body.openingHours }),
        ...(body.deliveryFee !== undefined && { deliveryFee: Number(body.deliveryFee) }),
        ...(body.estimatedDeliveryTime !== undefined && { estimatedDeliveryTime: body.estimatedDeliveryTime }),
        ...(body.googleRating !== undefined && { googleRating: Number(body.googleRating) }),
      },
    });

    return corsResponse(updated, 200, req);
  } catch (error) {
    console.error('Erro ao atualizar restaurante:', error);
    return corsResponse({ error: 'Erro ao atualizar' }, 500, req);
  }
}
