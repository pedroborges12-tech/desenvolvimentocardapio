import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('staff_session');

    if (!session?.value) {
      return NextResponse.json({ authenticated: false });
    }

    const employee = await db.employee.findUnique({
      where: { id: session.value },
      select: { id: true, name: true, isActive: true },
    });

    if (!employee || !employee.isActive) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, employee });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
