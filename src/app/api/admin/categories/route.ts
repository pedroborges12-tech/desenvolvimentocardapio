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
    const categories = restaurant.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      order: c.order,
    }));
    return corsResponse(categories, 200, req);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return corsResponse([], 200, req);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return corsResponse({ error: 'Nome da categoria é obrigatório' }, 400, req);
    }

    const restaurant = await ensureRestaurantAdmin();
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const maxOrder = await db.category.aggregate({ _max: { order: true } });

    const newCat = await db.category.create({
      data: {
        restaurantId: restaurant.id,
        name: name.trim(),
        slug,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    return corsResponse(newCat, 201, req);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return corsResponse({ error: 'Erro ao criar categoria' }, 500, req);
  }
}
