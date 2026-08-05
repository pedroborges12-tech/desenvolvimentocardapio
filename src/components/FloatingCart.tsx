'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface FloatingCartProps {
  totalItems: number;
  subtotal: number;
  onOpenCheckout: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({
  totalItems,
  subtotal,
  onOpenCheckout,
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-lg mx-auto pointer-events-none animate-slideUp">
      <div className="pointer-events-auto bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/40 p-3.5 rounded-2xl shadow-2xl shadow-amber-500/15 flex items-center justify-between gap-4 ring-1 ring-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-md">
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-zinc-900">
              {totalItems}
            </span>
          </div>

          <div>
            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Total do Pedido</p>
            <p className="text-lg font-black text-amber-400">
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCheckout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition"
        >
          <span>Finalizar Pedido</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
