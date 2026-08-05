import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { corsResponse, handleOptions } from '@/lib/api';

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || '123456';

    if (username === expectedUser && password === expectedPass) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: true,
        sameSite: 'none', // Necessário para cookies de sessão entre domínios no Vercel
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias de validade
      });

      return corsResponse({ success: true }, 200, req);
    }

    return corsResponse({ error: 'Usuário ou senha incorretos' }, 401, req);
  } catch (error) {
    console.error('Erro no login admin:', error);
    return corsResponse({ error: 'Erro ao processar login' }, 500, req);
  }
}
