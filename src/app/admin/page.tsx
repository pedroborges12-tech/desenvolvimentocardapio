'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Utensils, Clock, CheckCircle, AlertCircle, RefreshCw, Phone, MapPin, Printer } from 'lucide-react';
import { ThermalReceipt, PrintableOrder } from '@/components/ThermalReceipt';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: string;
  address?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Estado dos pedidos sendo impressos
  const [printingOrders, setPrintingOrders] = useState<PrintableOrder[]>([]);

  const fetchDashboard = async () => {
    try {
      const [resOrders, resRest] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/restaurant'),
      ]);

      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);
      }
      if (resRest.ok) {
        const dataRest = await resRest.json();
        setIsOpen(dataRest.isOpen);
      }
    } catch (err) {
      console.error('Erro ao buscar dados admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleRestaurantOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    await fetch('/api/admin/restaurant', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen: nextState }),
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    fetchDashboard();
  };

  // Função para imprimir pedido único
  const handlePrintSingle = (order: Order) => {
    setPrintingOrders([order]);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Função para imprimir todos os pedidos em lote
  const handlePrintAll = () => {
    if (orders.length === 0) return;
    setPrintingOrders(orders);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
        Carregando painel do restaurante...
      </div>
    );
  }

  return (
    <>
      {/* Componente Térmico de Impressão (Só aparece no comando window.print) */}
      <ThermalReceipt orders={printingOrders} />

      {/* Interface Principal (Oculta durante a impressão com a classe no-print) */}
      <div className="no-print min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Store className="w-6 h-6 text-amber-500" />
                <span>Painel de Pedidos & Gestão</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Acompanhe pedidos em tempo real, imprima cupons térmicos e altere a disponibilidade.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/admin/menu"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition"
              >
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Editar Cardápio</span>
              </Link>

              <button
                onClick={toggleRestaurantOpen}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition ${
                  isOpen
                    ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/20'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-zinc-950' : 'bg-white'}`} />
                {isOpen ? 'Restaurante Aberto' : 'Restaurante Fechado'}
              </button>
            </div>
          </div>

          {/* Orders List Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Pedidos Recebidos</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold">
                  {orders.length}
                </span>
              </h2>

              <div className="flex items-center gap-2">
                {/* Botão Imprimir Todos */}
                <button
                  onClick={handlePrintAll}
                  disabled={orders.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Imprimir todos os cupons em lote para impressora térmica"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Todos</span>
                </button>

                <button
                  onClick={fetchDashboard}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-zinc-500 text-xs">
                Nenhum pedido recebido até o momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order) => {
                  let statusBadgeColor = 'bg-zinc-800 text-zinc-300';
                  if (order.status === 'PAID') statusBadgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                  if (order.status === 'PREPARING') statusBadgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                  if (order.status === 'DELIVERED') statusBadgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
                  if (order.status === 'CANCELLED') statusBadgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/40';

                  const isPaid = order.status === 'PAID';

                  return (
                    <div
                      key={order.id}
                      className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-5 space-y-4 shadow-lg hover:border-zinc-700 transition"
                    >
                      {/* Header Order */}
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div>
                          <span className="text-xs text-zinc-400">Pedido</span>
                          <h3 className="text-base font-black text-amber-400 font-mono">#{order.orderNumber}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadgeColor}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Customer info */}
                      <div className="text-xs space-y-1 text-zinc-300">
                        <p className="font-bold text-white text-sm">{order.customerName}</p>
                        <p className="flex items-center gap-1 text-zinc-400">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          {order.customerPhone}
                        </p>
                        <p className="flex items-center gap-1 text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          {order.address}
                        </p>
                      </div>

                      {/* Payment Badge Highlight */}
                      <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Pagamento: <strong>{order.paymentMethod}</strong></span>
                        <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isPaid ? 'NÃO COBRAR (PAGO)' : `COBRAR R$ ${order.total.toFixed(2).replace('.', ',')}`}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="space-y-0.5">
                            <div className="flex justify-between text-zinc-300">
                              <span className="font-medium">{item.quantity}x {item.name}</span>
                              <span className="font-mono">R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                            </div>
                            {item.notes && (
                              <p className="text-[11px] text-amber-400/90 pl-3">Obs: {item.notes}</p>
                            )}
                          </div>
                        ))}
                        <div className="pt-2 border-t border-zinc-800 flex justify-between font-black text-amber-400 text-sm">
                          <span>Total:</span>
                          <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {/* Botão Imprimir Individual */}
                        <button
                          onClick={() => handlePrintSingle(order)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition"
                          title="Imprimir cupom térmico para este pedido"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Imprimir</span>
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="flex-1 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition"
                        >
                          Em Preparo
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition"
                        >
                          Concluído
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
