import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { corsResponse, handleOptions } from '@/lib/api';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return corsResponse({ success: true }, 200, req);
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
    return corsResponse({ error: 'Erro no logout' }, 500, req);
  }
}
