'use client';

import React from 'react';
import { ShoppingBag, Star, Clock, MapPin, PhoneCall } from 'lucide-react';

interface HeaderProps {
  restaurantName: string;
  isOpen: boolean;
  openingHours: string;
  googleRating: number;
  googleReviewCount: number;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  restaurantName,
  isOpen,
  openingHours,
  googleRating,
  googleReviewCount,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
            🍔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-zinc-100 tracking-tight">
                {restaurantName}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOpen
                    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {isOpen ? 'Aberto Agora' : 'Fechado'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
              <div className="flex items-center gap-1 text-amber-400 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span>{googleRating.toFixed(1)}</span>
                <span className="text-zinc-500">({googleReviewCount})</span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="hidden sm:flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://wa.me/5511998876655"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Contato</span>
          </a>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Ver Carrinho</span>
            {cartCount > 0 && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full bg-zinc-950 text-amber-400 font-extrabold text-xs">
                {cartCount} • R$ {cartTotal.toFixed(2).replace('.', ',')}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
