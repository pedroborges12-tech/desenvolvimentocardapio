'use client';

import React from 'react';
import { ShieldCheck, Zap, Flame, Truck } from 'lucide-react';

interface BannerHeroProps {
  restaurantName: string;
  estimatedDeliveryTime: string;
  deliveryFee: number;
  minOrderValue: number;
  highlightItem?: {
    name: string;
    description: string;
    price: number;
    image: string;
  };
}

export const BannerHero: React.FC<BannerHeroProps> = ({
  restaurantName,
  estimatedDeliveryTime,
  deliveryFee,
  minOrderValue,
  highlightItem,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-b border-zinc-800/60 pt-6 pb-8">
      {/* Background Subtle Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Main Copy */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
              <span>Cardápio Oficial de {restaurantName}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Faça seu Pedido Online,<br />
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-amber-500 bg-clip-text text-transparent">
                Receba Rápido e Quentinho
              </span>
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Escolha os produtos abaixo, monte seu pedido em segundos e receba direto na sua porta com total praticidade.
            </p>

            {/* Badges / Metadados do Restaurante */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[10px]">Tempo Estimado</p>
                  <p className="font-bold text-zinc-100">{estimatedDeliveryTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[10px]">Taxa de Entrega</p>
                  <p className="font-bold text-emerald-400">
                    {deliveryFee === 0 ? 'GRÁTIS' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                  </p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-zinc-400 text-[10px]">Pedido Mínimo</p>
                  <p className="font-bold text-zinc-100">R$ {minOrderValue.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Destaque Dinâmico (somente se houver item de destaque cadastrado no banco) */}
          {highlightItem && (
            <div className="w-full md:w-80 flex-shrink-0 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 p-4 sm:p-5 rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px] tracking-wider uppercase">
                  DESTAQUE
                </span>
                <span className="text-xs text-amber-400 font-medium">🔥 Mais Pedido</span>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Recomendação do Chef</p>
                <h3 className="text-lg font-extrabold text-white line-clamp-1">{highlightItem.name}</h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">R$ {highlightItem.price.toFixed(2).replace('.', ',')}</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-tight line-clamp-2">
                {highlightItem.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
