'use client';

import React from 'react';
import { Plus, Minus, Flame, Star } from 'lucide-react';

export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isBestSeller: boolean;
  isHouseFavorite: boolean;
  isAvailable: boolean;
}

interface MenuItemCardProps {
  item: MenuItemData;
  cartQuantity: number;
  onSelectItem: (item: MenuItemData) => void;
  onAddQuick: (item: MenuItemData) => void;
  onRemoveQuick: (itemId: string) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  cartQuantity,
  onSelectItem,
  onAddQuick,
  onRemoveQuick,
}) => {
  return (
    <div
      className={`group relative flex flex-col sm:flex-row bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-500/10 transition-all duration-300 ${
        !item.isAvailable ? 'opacity-60 grayscale' : ''
      }`}
    >
      {/* Product Image */}
      <div
        onClick={() => item.isAvailable && onSelectItem(item)}
        className="relative w-full sm:w-44 h-48 sm:h-auto flex-shrink-0 cursor-pointer overflow-hidden bg-zinc-950"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-md">
              <Flame className="w-3 h-3 fill-zinc-950" />
              Mais Pedido
            </span>
          )}
          {item.isHouseFavorite && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
              <Star className="w-3 h-3 fill-white" />
              Favorito
            </span>
          )}
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
            <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg uppercase">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-3">
        <div onClick={() => item.isAvailable && onSelectItem(item)} className="cursor-pointer space-y-1">
          <h3 className="text-base font-extrabold text-zinc-100 group-hover:text-amber-400 transition">
            {item.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer: Price + Cart Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
          <div>
            <span className="text-xs text-zinc-500 font-medium block">Preço</span>
            <span className="text-lg font-black text-amber-400">
              R$ {item.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {item.isAvailable && (
            <div>
              {cartQuantity === 0 ? (
                <button
                  onClick={() => onSelectItem(item)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Adicionar</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-zinc-800/90 border border-zinc-700 rounded-xl p-1">
                  <button
                    onClick={() => onRemoveQuick(item.id)}
                    className="w-7 h-7 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 flex items-center justify-center font-bold text-xs transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-black text-sm text-amber-400">
                    {cartQuantity}
                  </span>
                  <button
                    onClick={() => onAddQuick(item)}
                    className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
