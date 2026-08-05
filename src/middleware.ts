import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Redireciona para /admin apenas se o projeto for configurado exclusivamente como Admin
  const isAdminOnly = process.env.NEXT_PUBLIC_IS_ADMIN_ONLY === 'true';

  if (isAdminOnly && url.pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
