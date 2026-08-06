import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { ensureRestaurantSeeded } from '@/lib/seedHelper';
import { createHash } from 'crypto';

function hashPassword(p: string) {
  return createHash('sha256').update(p + 'staff-cardapio').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const restaurant = await ensureRestaurantSeeded();

    const employee = await db.employee.findFirst({
      where: { restaurantId: restaurant.id, username: username?.toLowerCase() },
    });

    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: 'Usuário não encontrado ou inativo' }, { status: 401 });
    }

    const hashed = hashPassword(password);
    if (employee.password !== hashed && employee.password !== password) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('staff_session', employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return NextResponse.json({ success: true, name: employee.name, id: employee.id });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
