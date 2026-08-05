'use client';

import React from 'react';
import { Lock, Clock, Calendar } from 'lucide-react';

interface RestaurantClosedBannerProps {
  openingHours: string;
}

export const RestaurantClosedBanner: React.FC<RestaurantClosedBannerProps> = ({ openingHours }) => {
  return (
    <div className="bg-rose-500/10 border-b border-rose-500/30 py-3.5 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-rose-300 font-medium">
        <div className="flex items-center gap-1.5 font-bold">
          <Lock className="w-4 h-4 text-rose-400" />
          <span>Restaurante Fechado no Momento</span>
        </div>
        <span className="hidden sm:inline text-rose-500">•</span>
        <div className="flex items-center gap-1 text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Horário de Funcionamento: <strong>{openingHours}</strong></span>
        </div>
        <span className="text-[11px] text-zinc-400">
          (Você pode visualizar o cardápio, mas os pedidos estarão liberados no horário)
        </span>
      </div>
    </div>
  );
};
