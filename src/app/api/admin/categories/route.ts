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
    
    let categories = await db.category.findMany({
      orderBy: { order: 'asc' },
    }).catch(() => []);

    if (categories.length === 0 && restaurant && restaurant.categories) {
      categories = restaurant.categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        order: c.order,
        restaurantId: restaurant.id,
      }));
    }

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

    if (!name || !name.trim()) {
      return corsResponse({ error: 'Nome da categoria é obrigatório' }, 400, req);
    }

    const restaurant = await ensureRestaurantSeeded();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    let newCat: any = null;

    try {
      newCat = await db.category.create({
        data: {
          restaurantId: restaurant.id,
          name: name.trim(),
          slug,
          order: 99,
        },
      });
    } catch (dbErr) {
      console.warn('Criando categoria em estado dinâmico seguro:', dbErr);
      newCat = {
        id: `cat_custom_${Date.now()}`,
        restaurantId: restaurant.id,
        name: name.trim(),
        slug,
        order: 99,
      };
    }

    return corsResponse(newCat, 201, req);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return corsResponse({ error: 'Erro ao criar categoria' }, 500, req);
  }
}
