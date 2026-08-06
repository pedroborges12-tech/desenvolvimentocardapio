import { NextResponse } from 'next/server';
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
    const items = restaurant.categories.flatMap((cat) =>
      cat.items.map((item) => ({
        ...item,
        category: { id: cat.id, name: cat.name },
      }))
    );
    return corsResponse(items, 200, req);
  } catch (error) {
    console.error('Erro ao buscar itens admin:', error);
    return corsResponse({ error: 'Erro ao buscar itens' }, 500, req);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, image, categoryId, newCategoryName, isAvailable, isBestSeller, isHouseFavorite } = body;

    if (!name?.trim() || !description?.trim() || !price || Number(price) <= 0) {
      return corsResponse({ error: 'Nome, descrição e preço válido são obrigatórios.' }, 400, req);
    }

    const restaurant = await ensureRestaurantAdmin();

    let targetCategoryId = categoryId;

    if (newCategoryName?.trim()) {
      const existing = await db.category.findFirst({ where: { name: newCategoryName.trim() } });
      if (existing) {
        targetCategoryId = existing.id;
      } else {
        const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
        const maxOrder = await db.category.aggregate({ _max: { order: true } });
        const created = await db.category.create({
          data: {
            restaurantId: restaurant.id,
            name: newCategoryName.trim(),
            slug,
            order: (maxOrder._max.order ?? 0) + 1,
          },
        });
        targetCategoryId = created.id;
      }
    }

    if (!targetCategoryId && restaurant.categories.length > 0) {
      targetCategoryId = restaurant.categories[0].id;
    }

    const newItem = await db.menuItem.create({
      data: {
        categoryId: targetCategoryId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image: image?.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
        isBestSeller: Boolean(isBestSeller),
        isHouseFavorite: Boolean(isHouseFavorite),
      },
      include: { category: true },
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
    const { id, name, description, price, image, categoryId, isAvailable, isBestSeller, isHouseFavorite } = body;

    if (!id) {
      return corsResponse({ error: 'ID do item é obrigatório' }, 400, req);
    }

    const updated = await db.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(image !== undefined && { image }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isBestSeller !== undefined && { isBestSeller }),
        ...(isHouseFavorite !== undefined && { isHouseFavorite }),
      },
      include: { category: true },
    });

    return corsResponse(updated, 200, req);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return corsResponse({ error: 'Erro ao atualizar item' }, 500, req);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return corsResponse({ error: 'ID obrigatório' }, 400, req);
    }

    await db.orderItem.deleteMany({ where: { menuItemId: id } });
    await db.menuItem.delete({ where: { id } });

    return corsResponse({ success: true }, 200, req);
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    return corsResponse({ error: 'Erro ao excluir item' }, 500, req);
  }
}
