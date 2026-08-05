import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const restaurant = await db.restaurant.findFirst({
      where: { slug: 'burger-co' },
      include: {
        categories: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: [
                { isBestSeller: 'desc' },
                { isHouseFavorite: 'desc' },
                { name: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
