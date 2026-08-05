import { NextResponse } from 'next/server';
import { ensureRestaurantSeeded, addDynamicCategory } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const restaurant = await ensureRestaurantSeeded();
    const categories = (restaurant?.categories || []).map((c: any) => ({
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

    if (!name || !name.trim()) {
      return corsResponse({ error: 'Nome da categoria é obrigatório' }, 400, req);
    }

    const newCategory = await addDynamicCategory(name.trim());
    return corsResponse(newCategory, 201, req);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return corsResponse({ error: 'Erro ao criar categoria' }, 500, req);
  }
}
