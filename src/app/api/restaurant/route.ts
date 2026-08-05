import { NextResponse } from 'next/server';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const restaurant = await ensureRestaurantSeeded();

    if (!restaurant) {
      return corsResponse({ error: 'Restaurante não encontrado' }, 404);
    }

    return corsResponse(restaurant);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    return corsResponse({ error: 'Erro interno no servidor' }, 500);
  }
}
