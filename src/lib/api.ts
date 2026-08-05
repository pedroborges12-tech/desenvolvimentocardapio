import { NextResponse } from 'next/server';

/**
 * Retorna a URL completa da API.
 * Se NEXT_PUBLIC_API_URL estiver configurada (ex: no site do Painel Admin separado),
 * ele fará as chamadas para a URL do site do Cardápio.
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Remover barras duplicadas
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}

/**
 * Cabeçalhos padrão de CORS para permitir que o site do Painel Admin (deploy 2)
 * faça requisições para o site do Cardápio (deploy 1) no Vercel.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export function corsResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
