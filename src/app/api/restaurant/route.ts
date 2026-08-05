import { NextResponse } from 'next/server';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';

export async function GET() {
  try {
    const restaurant = await ensureRestaurantSeeded();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
