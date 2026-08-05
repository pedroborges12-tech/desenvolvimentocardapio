'use client';

import React from 'react';
import { Star, ShoppingBag, ShieldCheck } from 'lucide-react';

interface SocialProofProps {
  googleRating?: number;
  googleReviewCount?: number;
}

export const SocialProof: React.FC<SocialProofProps> = ({
  googleRating = 4.9,
  googleReviewCount = 524,
}) => {
  return (
    <section className="bg-zinc-950 py-4 border-b border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold text-zinc-100 text-sm">
                <span>Nota {googleRating.toFixed(1)} no Google</span>
                <span className="text-xs text-amber-400">★★★★★</span>
              </div>
              <p className="text-xs text-zinc-400">Mais de {googleReviewCount} avaliações reais.</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm">
                Pedidos Automatizados via Pix
              </p>
              <p className="text-xs text-zinc-400">Confirmação rápida em tempo real.</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm">Entrega Direta no Endereço</p>
              <p className="text-xs text-zinc-400">Preparo ágil e ingredientes selecionados.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
