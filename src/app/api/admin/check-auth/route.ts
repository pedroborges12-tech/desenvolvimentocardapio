import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    const authenticated = session?.value === 'authenticated';

    return NextResponse.json({ authenticated });
  } catch (error) {
    console.error('Erro na checagem de autenticação:', error);
    return NextResponse.json({ authenticated: false });
  }
}
