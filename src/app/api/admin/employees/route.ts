import { db } from '@/lib/db';
import { ensureRestaurantAdmin } from '@/lib/seedHelper';
import { corsResponse, handleOptions } from '@/lib/api';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(p: string) {
  return createHash('sha256').update(p + 'staff-cardapio').digest('hex');
}

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: Request) {
  try {
    const restaurant = await ensureRestaurantAdmin();
    const employees = await db.employee.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true, username: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    return corsResponse(employees, 200, req);
  } catch (error) {
    return corsResponse({ error: 'Erro ao buscar funcionários' }, 500, req);
  }
}

export async function POST(req: Request) {
  try {
    const { name, username, password } = await req.json();

    if (!name?.trim() || !username?.trim() || !password?.trim()) {
      return corsResponse({ error: 'Nome, usuário e senha são obrigatórios' }, 400, req);
    }

    const restaurant = await ensureRestaurantAdmin();

    const existing = await db.employee.findFirst({
      where: { restaurantId: restaurant.id, username: username.trim().toLowerCase() },
    });

    if (existing) {
      return corsResponse({ error: 'Já existe um funcionário com este usuário' }, 400, req);
    }

    const employee = await db.employee.create({
      data: {
        restaurantId: restaurant.id,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: hashPassword(password),
        isActive: true,
      },
      select: { id: true, name: true, username: true, isActive: true, createdAt: true },
    });

    return corsResponse(employee, 201, req);
  } catch (error) {
    return corsResponse({ error: 'Erro ao criar funcionário' }, 500, req);
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json();
    if (!id) return corsResponse({ error: 'ID obrigatório' }, 400, req);

    const updated = await db.employee.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, username: true, isActive: true },
    });

    return corsResponse(updated, 200, req);
  } catch (error) {
    return corsResponse({ error: 'Erro ao atualizar funcionário' }, 500, req);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return corsResponse({ error: 'ID obrigatório' }, 400, req);
    await db.employee.delete({ where: { id } });
    return corsResponse({ success: true }, 200, req);
  } catch (error) {
    return corsResponse({ error: 'Erro ao excluir funcionário' }, 500, req);
  }
}
