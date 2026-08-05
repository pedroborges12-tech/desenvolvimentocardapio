import { NextResponse } from 'next/server';
import {
  ensureRestaurantSeeded,
  addDynamicMenuItem,
  updateDynamicMenuItem,
  deleteDynamicMenuItem,
} from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const restaurant = await ensureRestaurantSeeded();
    
    let items: Array<any> = [];

    if (restaurant && restaurant.categories && Array.isArray(restaurant.categories)) {
      items = restaurant.categories.flatMap((cat: any) =>
        (cat.items || []).map((item: any) => ({
          ...item,
          categoryId: item.categoryId || cat.id,
          category: item.category || { id: cat.id, name: cat.name },
        }))
      );
    }

    return corsResponse(items, 200, req);
  } catch (error) {
    console.error('Erro ao buscar itens admin:', error);
    return corsResponse([], 200, req);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      image,
      categoryId,
      newCategoryName,
      isAvailable,
      isBestSeller,
      isHouseFavorite,
    } = body;

    if (!name || !description || price === undefined || Number(price) <= 0) {
      return corsResponse(
        { error: 'Nome, descrição e preço válido são obrigatórios.' },
        400,
        req
      );
    }

    const newItem = await addDynamicMenuItem({
      name,
      description,
      price: Number(price),
      image,
      categoryId,
      newCategoryName,
      isAvailable,
      isBestSeller,
      isHouseFavorite,
    });

    return corsResponse(newItem, 201, req);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return corsResponse({ error: 'Erro ao cadastrar produto' }, 500, req);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      description,
      price,
      image,
      categoryId,
      isAvailable,
      isBestSeller,
      isHouseFavorite,
    } = body;

    if (!id) {
      return corsResponse({ error: 'ID do item é obrigatório' }, 400, req);
    }

    const updatedItem = await updateDynamicMenuItem({
      id,
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      image,
      categoryId,
      isAvailable,
      isBestSeller,
      isHouseFavorite,
    });

    return corsResponse(updatedItem, 200, req);
  } catch (error) {
    console.error('Erro ao atualizar item do cardápio:', error);
    return corsResponse({ error: 'Erro ao atualizar item' }, 500, req);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return corsResponse({ error: 'ID do item é obrigatório para exclusão' }, 400, req);
    }

    const result = await deleteDynamicMenuItem(id);
    return corsResponse(result, 200, req);
  } catch (error) {
    console.error('Erro ao excluir item do cardápio:', error);
    return corsResponse({ error: 'Erro ao excluir item' }, 500, req);
  }
}
