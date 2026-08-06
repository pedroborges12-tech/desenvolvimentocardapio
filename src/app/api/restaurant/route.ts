import { ensureRestaurantSeeded } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const restaurant = await ensureRestaurantSeeded();
    return corsResponse(restaurant, 200, req);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    return corsResponse({ error: 'Erro interno' }, 500, req);
  }
}
