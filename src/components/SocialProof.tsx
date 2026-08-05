'use client';

import React from 'react';
import { Star, ShoppingBag, ThumbsUp, Heart } from 'lucide-react';

export const SocialProof: React.FC = () => {
  return (
    <section className="bg-zinc-950 py-6 border-b border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold text-zinc-100 text-sm">
                <span>Nota 4.9 no Google</span>
                <span className="text-xs text-amber-400">★★★★★</span>
              </div>
              <p className="text-xs text-zinc-400">Mais de 520 avaliações de clientes satisfeitos.</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm">
                +140 pedidos entregues hoje
              </p>
              <p className="text-xs text-zinc-400">Preparo ágil e rastreamento em tempo real.</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 flex-shrink-0">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm">&quot;Melhor hambúrguer de SP!&quot;</p>
              <p className="text-xs text-zinc-400">&mdash; Lucas M., cliente verificado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
