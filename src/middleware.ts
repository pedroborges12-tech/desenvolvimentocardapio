import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Se o deploy for o do Painel Admin (NEXT_PUBLIC_IS_ADMIN_ONLY=true ou se tiver NEXT_PUBLIC_API_URL)
  const isAdminOnly =
    process.env.NEXT_PUBLIC_IS_ADMIN_ONLY === 'true' ||
    (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0);

  if (isAdminOnly && url.pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
