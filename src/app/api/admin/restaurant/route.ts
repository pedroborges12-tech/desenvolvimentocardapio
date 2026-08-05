import { NextResponse } from 'next/server';
import { ensureRestaurantSeeded, setDynamicRestaurantStatus } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const restaurant = await ensureRestaurantSeeded();
    return corsResponse(restaurant, 200, req);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    const fallback = await ensureRestaurantSeeded();
    return corsResponse(fallback, 200, req);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { isOpen } = body;

    let restaurant = await ensureRestaurantSeeded();

    if (typeof isOpen === 'boolean') {
      restaurant = await setDynamicRestaurantStatus(isOpen);
    }

    return corsResponse(restaurant, 200, req);
  } catch (error) {
    console.error('Erro ao atualizar status do restaurante:', error);
    const fallback = await ensureRestaurantSeeded();
    return corsResponse(fallback, 200, req);
  }
}
