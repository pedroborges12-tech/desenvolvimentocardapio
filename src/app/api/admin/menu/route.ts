import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.menuItem.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao buscar itens admin:', error);
    return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 });
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

    if (!name || !description || !price || Number(price) <= 0) {
      return NextResponse.json(
        { error: 'Nome, descrição e preço válido são obrigatórios.' },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.findFirst({
      where: { slug: 'burger-co' },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    let targetCategoryId = categoryId;

    if (newCategoryName && newCategoryName.trim()) {
      const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const existingCat = await db.category.findFirst({
        where: { restaurantId: restaurant.id, name: newCategoryName.trim() },
      });

      if (existingCat) {
        targetCategoryId = existingCat.id;
      } else {
        const createdCat = await db.category.create({
          data: {
            restaurantId: restaurant.id,
            name: newCategoryName.trim(),
            slug,
            order: 99,
          },
        });
        targetCategoryId = createdCat.id;
      }
    }

    if (!targetCategoryId) {
      return NextResponse.json({ error: 'Selecione ou informe uma categoria válida.' }, { status: 400 });
    }

    const defaultImage =
      image && image.trim()
        ? image.trim()
        : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80';

    const newItem = await db.menuItem.create({
      data: {
        categoryId: targetCategoryId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        image: defaultImage,
        isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
        isBestSeller: Boolean(isBestSeller),
        isHouseFavorite: Boolean(isHouseFavorite),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar produto' }, { status: 500 });
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
      newCategoryName,
      isAvailable,
      isBestSeller,
      isHouseFavorite,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do item é obrigatório' }, { status: 400 });
    }

    let targetCategoryId = categoryId;

    if (newCategoryName && newCategoryName.trim()) {
      const restaurant = await db.restaurant.findFirst({
        where: { slug: 'burger-co' },
      });

      if (restaurant) {
        const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const existingCat = await db.category.findFirst({
          where: { restaurantId: restaurant.id, name: newCategoryName.trim() },
        });

        if (existingCat) {
          targetCategoryId = existingCat.id;
        } else {
          const createdCat = await db.category.create({
            data: {
              restaurantId: restaurant.id,
              name: newCategoryName.trim(),
              slug,
              order: 99,
            },
          });
          targetCategoryId = createdCat.id;
        }
      }
    }

    const updated = await db.menuItem.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        price: typeof price === 'number' ? price : price ? Number(price) : undefined,
        image: image !== undefined ? String(image).trim() : undefined,
        categoryId: targetCategoryId || undefined,
        isAvailable: typeof isAvailable === 'boolean' ? isAvailable : undefined,
        isBestSeller: typeof isBestSeller === 'boolean' ? isBestSeller : undefined,
        isHouseFavorite: typeof isHouseFavorite === 'boolean' ? isHouseFavorite : undefined,
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar item do cardápio:', error);
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do item é obrigatório para exclusão' }, { status: 400 });
    }

    // Remover relacionamentos de OrderItem se existirem para permitir exclusão limpa
    await db.orderItem.deleteMany({
      where: { menuItemId: id },
    });

    await db.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Erro ao excluir item do cardápio:', error);
    return NextResponse.json({ error: 'Erro ao excluir item' }, { status: 500 });
  }
}
