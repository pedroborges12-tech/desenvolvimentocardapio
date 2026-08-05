import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { corsResponse, handleOptions } from '@/lib/api';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    const authenticated = session?.value === 'authenticated';

    return corsResponse({ authenticated }, 200, req);
  } catch (error) {
    console.error('Erro na checagem de autenticação:', error);
    return corsResponse({ authenticated: false }, 200, req);
  }
}
