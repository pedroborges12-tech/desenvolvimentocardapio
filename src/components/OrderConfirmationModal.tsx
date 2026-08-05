'use client';

import React from 'react';
import { CheckCircle2, MessageCircle, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryType: string;
    address?: string;
    total: number;
    estimatedDeliveryTime?: string;
    items: Array<{ name: string; quantity: number; unitPrice: number; notes?: string }>;
  } | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  order,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  // Montar mensagem formatada para envio direto via WhatsApp
  const itemsText = order.items
    .map((i) => `• ${i.quantity}x ${i.name} (R$ ${(i.unitPrice * i.quantity).toFixed(2).replace('.', ',')})${i.notes ? `\n  Obs: ${i.notes}` : ''}`)
    .join('\n');

  const waMessage = `*NOVO PEDIDO CONFIRMADO!* 🍔🎉\n\n` +
    `*Pedido:* #${order.orderNumber}\n` +
    `*Cliente:* ${order.customerName}\n` +
    `*Telefone:* ${order.customerPhone}\n` +
    `*Tipo:* ${order.deliveryType === 'DELIVERY' ? 'Entrega Delivery' : 'Retirada no Balcão'}\n` +
    `*Endereço:* ${order.address || 'N/A'}\n\n` +
    `*ITENS:* \n${itemsText}\n\n` +
    `*TOTAL:* R$ ${order.total.toFixed(2).replace('.', ',')}\n` +
    `*Status:* Pagamento Confirmado / Em Preparo`;

  const waLink = `https://wa.me/5511998876655?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Order Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white">Pedido Realizado com Sucesso!</h2>
          <p className="text-xs text-zinc-400">
            Número do Pedido: <strong className="text-amber-400 font-mono text-sm">#{order.orderNumber}</strong>
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Tempo Estimado:
            </span>
            <strong className="text-zinc-100 font-bold">{order.estimatedDeliveryTime || '30 - 45 min'}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              Entrega / Destino:
            </span>
            <span className="text-zinc-200 truncate max-w-[200px] font-medium">{order.address}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-sm">
            <span className="font-extrabold text-zinc-300">Total Pago:</span>
            <span className="font-black text-emerald-400">R$ {order.total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition"
          >
            <MessageCircle className="w-5 h-5 fill-zinc-950 text-emerald-500" />
            <span>Acompanhar / Enviar no WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Cardápio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
