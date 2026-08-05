import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || '123456';

    if (username === expectedUser && password === expectedPass) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias de validade
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
  } catch (error) {
    console.error('Erro no login admin:', error);
    return NextResponse.json({ error: 'Erro ao processar login' }, { status: 500 });
  }
}
