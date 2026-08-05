import { NextResponse } from 'next/server';

/**
 * Retorna a URL completa da API.
 * Se NEXT_PUBLIC_API_URL estiver configurada (ex: no site do Painel Admin separado),
 * ele fará as chamadas para a URL do site do Cardápio.
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}

/**
 * Cabeçalhos dinâmicos de CORS para permitir requisições seguras vindas de
 * https://admin-cardapio-psi.vercel.app ou qualquer domínio do admin.
 */
export function getCorsHeaders(req?: Request) {
  const requestOrigin = req ? req.headers.get('origin') : null;
  const allowedOrigin =
    requestOrigin ||
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    'https://admin-cardapio-psi.vercel.app';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cookie',
  };
}

export function corsResponse(data: unknown, status = 200, req?: Request) {
  return NextResponse.json(data, {
    status,
    headers: getCorsHeaders(req),
  });
}

export function handleOptions(req?: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}
