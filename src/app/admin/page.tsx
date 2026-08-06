'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store, Utensils, RefreshCw, Phone, MapPin, Printer, LogOut,
  Trash2, BarChart2, ChevronDown, Users, UserPlus, X, Loader2,
  TrendingUp, ShoppingBag, Bike, Check, AlertTriangle, Eye, EyeOff,
} from 'lucide-react';
import { ThermalReceipt, PrintableOrder } from '@/components/ThermalReceipt';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface Order {
  id: string;
  seqNum: number;
  orderNumber: string;
  orderSource: string;
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

interface Employee {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  deliveryCount: number;
  inStoreCount: number;
  deliveryRevenue: number;
  inStoreRevenue: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [printingOrders, setPrintingOrders] = useState<PrintableOrder[]>([]);

  // Exclusão de pedidos
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Stats
  const [showStats, setShowStats] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Funcionários
  const [showEmployees, setShowEmployees] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpUser, setNewEmpUser] = useState('');
  const [newEmpPass, setNewEmpPass] = useState('');
  const [showEmpPass, setShowEmpPass] = useState(false);
  const [empError, setEmpError] = useState('');
  const [empSubmitting, setEmpSubmitting] = useState(false);
  const [deletingEmpId, setDeletingEmpId] = useState<string | null>(null);

  // ─── Auth & Fetch ──────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    try {
      const [resOrders, resRest] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/restaurant'),
      ]);
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resRest.ok) {
        const d = await resRest.json();
        setIsOpen(d.isOpen);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch('/api/admin/check-auth')
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) { router.push('/admin/login'); return; }
        fetchDashboard();
      })
      .catch(() => router.push('/admin/login'));
  }, [router, fetchDashboard]);

  useEffect(() => {
    const interval = setInterval(fetchDashboard, 8000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async (period: string) => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?period=${period}`);
      if (res.ok) setStats(await res.json());
    } finally { setStatsLoading(false); }
  }, []);

  useEffect(() => {
    if (showStats) fetchStats(statsPeriod);
  }, [showStats, statsPeriod, fetchStats]);

  // ─── Employees ───────────────────────────────────────────────────────────────

  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    try {
      const res = await fetch('/api/admin/employees');
      if (res.ok) setEmployees(await res.json());
    } finally { setEmpLoading(false); }
  }, []);

  useEffect(() => { if (showEmployees) fetchEmployees(); }, [showEmployees, fetchEmployees]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmpError('');
    setEmpSubmitting(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEmpName, username: newEmpUser, password: newEmpPass }),
      });
      const data = await res.json();
      if (!res.ok) { setEmpError(data.error); return; }
      setEmployees((prev) => [...prev, data]);
      setNewEmpName(''); setNewEmpUser(''); setNewEmpPass('');
    } catch { setEmpError('Erro ao criar funcionário'); }
    finally { setEmpSubmitting(false); }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await fetch(`/api/admin/employees?id=${id}`, { method: 'DELETE' });
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setDeletingEmpId(null);
    } catch {}
  };

  // ─── Restaurant ──────────────────────────────────────────────────────────────

  const toggleRestaurantOpen = async () => {
    const next = !isOpen;
    setIsOpen(next);
    await fetch('/api/admin/restaurant', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen: next }),
    });
  };

  // ─── Orders ──────────────────────────────────────────────────────────────────

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    fetchDashboard();
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/admin/orders?id=${orderId}`, { method: 'DELETE' });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setDeletingOrderId(null);
    } catch {}
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handlePrintSingle = (order: Order) => {
    setPrintingOrders([order]);
    setTimeout(() => window.print(), 150);
  };

  const handlePrintAll = () => {
    if (!orders.length) return;
    setPrintingOrders(orders);
    setTimeout(() => window.print(), 150);
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const statusBadge = (status: string) => {
    if (status === 'PAID') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (status === 'PREPARING') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    if (status === 'DELIVERED') return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    if (status === 'CANCELLED') return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (status === 'OPEN') return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    return 'bg-zinc-800 text-zinc-300';
  };

  const periodLabel = { day: 'Hoje', week: '7 dias', month: 'Este mês', year: 'Este ano' };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ThermalReceipt orders={printingOrders} />

      <div className="no-print min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Top Header ──────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Store className="w-6 h-6 text-amber-500" />
                Painel de Pedidos & Gestão
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Acompanhe pedidos em tempo real e gerencie seu restaurante.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/admin/menu" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition">
                <Utensils className="w-4 h-4 text-amber-400" /> Editar Cardápio
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
              <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-rose-500/10 hover:text-rose-400 text-xs font-bold text-zinc-400 transition" title="Sair">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

          {/* ── Stats Panel ─────────────────────────────────────────────────── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <button
              onClick={() => setShowStats(!showStats)}
              className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/30 transition"
            >
              <span className="flex items-center gap-2 text-sm font-extrabold text-zinc-300 uppercase tracking-wider">
                <BarChart2 className="w-4 h-4 text-amber-400" /> Estatísticas de Vendas
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showStats ? 'rotate-180' : ''}`} />
            </button>

            {showStats && (
              <div className="px-5 pb-5 border-t border-zinc-800 space-y-4">
                {/* Period selector */}
                <div className="flex gap-2 pt-4 overflow-x-auto">
                  {(['day', 'week', 'month', 'year'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setStatsPeriod(p)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition ${
                        statsPeriod === p
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {periodLabel[p]}
                    </button>
                  ))}
                </div>

                {statsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 col-span-2 sm:col-span-1">
                      <p className="text-xs text-zinc-500">Receita Total</p>
                      <p className="text-2xl font-black text-amber-400 mt-1">
                        R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-1">{stats.totalOrders} pedido(s)</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Bike className="w-3 h-3 text-blue-400" /> Delivery
                      </p>
                      <p className="text-lg font-black text-white mt-1">
                        R$ {stats.deliveryRevenue.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-1">{stats.deliveryCount} pedido(s)</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-emerald-400" /> Na Loja
                      </p>
                      <p className="text-lg font-black text-white mt-1">
                        R$ {stats.inStoreRevenue.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-1">{stats.inStoreCount} pedido(s)</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-4">Sem dados para o período selecionado.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Orders Header + List ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pedidos Recebidos
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold">{orders.length}</span>
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintAll} disabled={!orders.length} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold disabled:opacity-40 transition">
                  <Printer className="w-4 h-4" /> Imprimir Todos
                </button>
                <button onClick={fetchDashboard} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition">
                  <RefreshCw className="w-3.5 h-3.5" /> Atualizar
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
                  const isInStore = order.orderSource === 'IN_STORE';
                  const isPaid = order.status === 'PAID';

                  return (
                    <div key={order.id} className={`group relative bg-zinc-900 border rounded-2xl p-5 space-y-4 shadow-lg transition ${
                      isInStore ? 'border-purple-500/30 hover:border-purple-500/50' : 'border-zinc-800/90 hover:border-zinc-700'
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between border-b border-zinc-800 pb-3 gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-zinc-600 font-mono bg-zinc-950 px-1.5 py-0.5 rounded-md border border-zinc-800">
                              #{order.seqNum}
                            </span>
                            {isInStore && (
                              <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShoppingBag className="w-2.5 h-2.5" /> Na Loja
                              </span>
                            )}
                            {!isInStore && (
                              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Bike className="w-2.5 h-2.5" /> Delivery
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-black text-amber-400 font-mono truncate mt-0.5">
                            #{order.orderNumber.slice(0, 12)}…
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge(order.status)}`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => setDeletingOrderId(deletingOrderId === order.id ? null : order.id)}
                            className="w-7 h-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-zinc-600 flex items-center justify-center transition"
                            title="Excluir pedido"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="text-xs space-y-1 text-zinc-300">
                        <p className="font-bold text-white text-sm">{order.customerName}</p>
                        {order.customerPhone && (
                          <p className="flex items-center gap-1 text-zinc-400">
                            <Phone className="w-3.5 h-3.5 text-amber-400" /> {order.customerPhone}
                          </p>
                        )}
                        {order.address && order.address !== 'Pedido no Local' && (
                          <p className="flex items-center gap-1 text-zinc-400">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" /> {order.address}
                          </p>
                        )}
                        {isInStore && (
                          <p className="flex items-center gap-1 text-purple-400 font-medium">
                            <ShoppingBag className="w-3 h-3" /> Pedido presencial na loja
                          </p>
                        )}
                      </div>

                      {/* Payment badge */}
                      <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">
                          {isInStore ? 'Pagamento: ' : 'Pagamento: '}
                          <strong>{isInStore ? 'Na loja' : order.paymentMethod}</strong>
                        </span>
                        {!isInStore && (
                          <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {isPaid ? 'NÃO COBRAR (PAGO)' : `COBRAR R$ ${order.total.toFixed(2).replace('.', ',')}`}
                          </span>
                        )}
                        {isInStore && (
                          <span className="px-2 py-0.5 rounded-md font-black text-[10px] text-amber-400 border border-amber-500/30 bg-amber-500/10">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>

                      {/* Items */}
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="space-y-0.5">
                            <div className="flex justify-between text-zinc-300">
                              <span className="font-medium">{item.quantity}x {item.name}</span>
                              <span className="font-mono">R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                            </div>
                            {item.notes && <p className="text-[11px] text-amber-400/90 pl-3">Obs: {item.notes}</p>}
                          </div>
                        ))}
                        <div className="pt-2 border-t border-zinc-800 flex justify-between font-black text-amber-400 text-sm">
                          <span>Total:</span>
                          <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => handlePrintSingle(order)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition">
                          <Printer className="w-3.5 h-3.5 text-amber-400" /> Imprimir
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="flex-1 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition">
                          Em Preparo
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition">
                          Concluído
                        </button>
                      </div>

                      {/* Delete confirmation */}
                      {deletingOrderId === order.id && (
                        <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2">
                          <p className="text-xs text-rose-300 font-medium">⚠️ Excluir permanentemente?</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteOrder(order.id)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition">
                              Excluir
                            </button>
                            <button onClick={() => setDeletingOrderId(null)} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-lg transition">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Employee Management ──────────────────────────────────────────── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <button
              onClick={() => setShowEmployees(!showEmployees)}
              className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/30 transition"
            >
              <span className="flex items-center gap-2 text-sm font-extrabold text-zinc-300 uppercase tracking-wider">
                <Users className="w-4 h-4 text-blue-400" /> Funcionários
                <span className="text-zinc-500 font-normal normal-case text-xs">({employees.length})</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showEmployees ? 'rotate-180' : ''}`} />
            </button>

            {showEmployees && (
              <div className="border-t border-zinc-800 p-5 space-y-5">
                {/* Create form */}
                <form onSubmit={handleCreateEmployee} className="space-y-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                  <p className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-3.5 h-3.5 text-blue-400" /> Cadastrar novo funcionário
                  </p>
                  {empError && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{empError}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      required
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 transition"
                    />
                    <input
                      type="text"
                      placeholder="Usuário (ex: joao)"
                      value={newEmpUser}
                      onChange={(e) => setNewEmpUser(e.target.value)}
                      required
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 transition"
                    />
                    <div className="relative">
                      <input
                        type={showEmpPass ? 'text' : 'password'}
                        placeholder="Senha"
                        value={newEmpPass}
                        onChange={(e) => setNewEmpPass(e.target.value)}
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-8 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 transition"
                      />
                      <button type="button" onClick={() => setShowEmpPass(!showEmpPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500">
                        {showEmpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={empSubmitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition disabled:opacity-50"
                  >
                    {empSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    Criar Funcionário
                  </button>
                </form>

                {/* List */}
                {empLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
                ) : employees.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">Nenhum funcionário cadastrado ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {employees.map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{emp.name}</p>
                          <p className="text-xs text-zinc-500">@{emp.username}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            emp.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-zinc-500 bg-zinc-800 border-zinc-700'
                          }`}>{emp.isActive ? 'Ativo' : 'Inativo'}</span>

                          {deletingEmpId === emp.id ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleDeleteEmployee(emp.id)} className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg">Sim</button>
                              <button onClick={() => setDeletingEmpId(null)} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] rounded-lg">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeletingEmpId(emp.id)} className="w-7 h-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-zinc-600 flex items-center justify-center transition">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
