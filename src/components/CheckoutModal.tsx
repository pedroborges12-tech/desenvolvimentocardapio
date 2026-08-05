'use client';

import React, { useState } from 'react';
import { X, Trash2, QrCode, CreditCard, Truck, Store, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { MenuItemData } from './MenuItemCard';

export interface CartItem {
  item: MenuItemData;
  quantity: number;
  notes?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryFee: number;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSubmitCheckout: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'DELIVERY' | 'PICKUP';
    address: string;
    paymentMethod: 'PIX' | 'CREDIT_CARD';
    notes: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryFee,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitCheckout,
  isSubmitting,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const currentDeliveryFee = deliveryType === 'DELIVERY' ? deliveryFee : 0;
  const total = subtotal + currentDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Por favor, informe seu nome.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setErrorMsg('Informe um telefone/WhatsApp válido.');
      return;
    }
    if (deliveryType === 'DELIVERY' && (!street.trim() || !number.trim())) {
      setErrorMsg('Preencha o endereço de entrega completo (Rua e Número).');
      return;
    }

    const fullAddress = deliveryType === 'DELIVERY'
      ? `${street}, ${number} ${neighborhood ? `- ${neighborhood}` : ''} ${complement ? `(${complement})` : ''}`
      : 'Retirada no Local';

    try {
      await onSubmitCheckout({
        customerName,
        customerPhone,
        deliveryType,
        address: fullAddress,
        paymentMethod,
        notes,
      });
    } catch (err) {
      setErrorMsg((err as Error).message || 'Erro ao processar checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              🛒
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Checkout Rápido (1 Etapa)</h2>
              <p className="text-xs text-zinc-400">Revise os itens e informe seus dados para pagar</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Items Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              1. Itens do Pedido ({items.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map(({ item, quantity, notes: itemNotes }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-extrabold text-zinc-200 truncate">{item.name}</p>
                      {itemNotes && <p className="text-[11px] text-amber-400/90 truncate">Obs: {itemNotes}</p>}
                      <p className="text-zinc-400 font-medium">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-amber-400 text-xs">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                        className="w-6 h-6 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment Type */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              2. Forma de Entrega
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('DELIVERY')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition ${
                  deliveryType === 'DELIVERY'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <Truck className="w-4 h-4" />
                <div className="text-left">
                  <p className="font-black">Entrega Delivery</p>
                  <p className="text-[10px] text-zinc-500 font-normal">
                    {deliveryFee === 0 ? 'Frete Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('PICKUP')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition ${
                  deliveryType === 'PICKUP'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <Store className="w-4 h-4" />
                <div className="text-left">
                  <p className="font-black">Retirar no Balcão</p>
                  <p className="text-[10px] text-zinc-500 font-normal">Sem taxa</p>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Details & Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              3. Dados do Cliente {deliveryType === 'DELIVERY' ? '& Endereço' : ''}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Celular / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-8888"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 transition"
                />
              </div>

              {deliveryType === 'DELIVERY' && (
                <>
                  <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] text-zinc-400 mb-1">Rua / Avenida *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Av. Paulista"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Número *</label>
                      <input
                        type="text"
                        required
                        placeholder="1200"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Bela Vista"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Complemento / Ref.</label>
                    <input
                      type="text"
                      placeholder="Apto 42, Bloco B"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              4. Forma de Pagamento
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition ${
                  paymentMethod === 'PIX'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="font-black text-emerald-400">Pix Instantâneo</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Aprovação Imediata</p>
                </div>
                <span className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[9px] uppercase">
                  RÁPIDO
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-black">Cartão de Crédito</p>
                  <p className="text-[10px] text-zinc-500 font-normal">Até 3x sem juros</p>
                </div>
              </button>
            </div>
          </div>

          {/* Order Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Observações Gerais do Pedido
            </label>
            <input
              type="text"
              placeholder="Ex: Tocar a campainha, deixar na portaria..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 transition"
            />
          </div>
        </form>

        {/* Total & Submit Footer */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal dos Itens</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Taxa de Entrega</span>
              <span>
                {currentDeliveryFee === 0 ? (
                  <strong className="text-emerald-400">GRÁTIS</strong>
                ) : (
                  `R$ ${currentDeliveryFee.toFixed(2).replace('.', ',')}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
              <span>Total a Pagar</span>
              <span className="text-amber-400 text-lg">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Gerando Pagamento Seguro...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Confirmar e Pagar R$ {total.toFixed(2).replace('.', ',')}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
