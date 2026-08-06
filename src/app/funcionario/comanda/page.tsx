'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, LogOut, ChevronDown, ChevronUp, Loader2, CheckCircle, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Comanda {
  id: string;
  seqNum: number;
  customerName: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

type ModalMode = 'new' | 'add';

export default function FuncionarioComanda() {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState('');
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de seleção de produtos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('new');
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Confirmação de fechar comanda
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [authRes, comandasRes] = await Promise.all([
        fetch('/api/staff/check-auth'),
        fetch('/api/staff/orders'),
      ]);

      const authData = await authRes.json();
      if (!authData.authenticated) { router.replace('/funcionario/login'); return; }
      setEmployeeName(authData.employee.name);

      if (comandasRes.ok) setComandas(await comandasRes.json());

      if (categories.length === 0) {
        const menuRes = await fetch('/api/restaurant');
        if (menuRes.ok) {
          const rest = await menuRes.json();
          setCategories(rest.categories || []);
        }
      }
    } catch { router.replace('/funcionario/login'); }
    finally { setLoading(false); }
  }, [router, categories.length]);

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    await fetch('/api/staff/logout', { method: 'POST' });
    router.replace('/funcionario/login');
  };

  const openNewModal = () => {
    setModalMode('new');
    setTargetOrderId(null);
    setCustomerName('');
    setSelectedItems({});
    setModalError('');
    setIsModalOpen(true);
  };

  const openAddModal = (orderId: string) => {
    setModalMode('add');
    setTargetOrderId(orderId);
    setSelectedItems({});
    setModalError('');
    setIsModalOpen(true);
  };

  const adjustItem = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const cur = prev[itemId] ?? 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) { const { [itemId]: _, ...rest } = prev; return rest; }
      return { ...prev, [itemId]: next };
    });
  };

  const totalSelectedItems = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  const handleConfirm = async () => {
    if (totalSelectedItems === 0) { setModalError('Selecione ao menos um item.'); return; }
    setIsSubmitting(true);
    setModalError('');
    try {
      const items = Object.entries(selectedItems).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

      if (modalMode === 'new') {
        const res = await fetch('/api/staff/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerName: customerName.trim() || 'Cliente', items }),
        });
        const data = await res.json();
        if (!res.ok) { setModalError(data.error); return; }
        setComandas((prev) => [...prev, data]);
      } else {
        const res = await fetch('/api/staff/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: targetOrderId, action: 'add_items', items }),
        });
        const data = await res.json();
        if (!res.ok) { setModalError(data.error); return; }
        setComandas((prev) => prev.map((c) => (c.id === targetOrderId ? data : c)));
      }
      setIsModalOpen(false);
    } catch { setModalError('Erro de conexão. Tente novamente.'); }
    finally { setIsSubmitting(false); }
  };

  const handleCloseComanda = async (orderId: string) => {
    try {
      const res = await fetch('/api/staff/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'close' }),
      });
      if (res.ok) {
        setComandas((prev) => prev.filter((c) => c.id !== orderId));
        setClosingOrderId(null);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧾</span>
          <div>
            <p className="text-xs text-zinc-500 leading-none">Olá,</p>
            <p className="text-sm font-black text-white leading-tight">{employeeName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Botão nova comanda */}
        <button
          onClick={openNewModal}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          Nova Comanda
        </button>

        {/* Lista de comandas abertas */}
        {comandas.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Nenhuma comanda aberta no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
              Comandas Abertas ({comandas.length})
            </p>
            {comandas.map((comanda) => (
              <div key={comanda.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Header da comanda */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-mono">#{comanda.seqNum}</span>
                      <span className="text-xs font-black text-white">{comanda.customerName}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {new Date(comanda.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-base font-black text-amber-400">
                    R$ {comanda.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Itens */}
                <div className="px-4 py-3 space-y-1.5">
                  {comanda.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-zinc-300">
                      <span>{item.quantity}× {item.name}</span>
                      <span className="text-zinc-500 font-mono">
                        R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ações */}
                {closingOrderId === comanda.id ? (
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <p className="text-xs text-amber-400 flex-1">Fechar a comanda?</p>
                    <button
                      onClick={() => handleCloseComanda(comanda.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                    >
                      ✓ Fechar
                    </button>
                    <button
                      onClick={() => setClosingOrderId(null)}
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-xl"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="px-4 pb-3 flex gap-2">
                    <button
                      onClick={() => openAddModal(comanda.id)}
                      className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition"
                    >
                      + Adicionar Itens
                    </button>
                    <button
                      onClick={() => setClosingOrderId(comanda.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                      Fechar Comanda
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Seleção de Produtos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90dvh]">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
              <div>
                <h2 className="text-base font-black text-white">
                  {modalMode === 'new' ? 'Nova Comanda' : 'Adicionar Itens'}
                </h2>
                <p className="text-xs text-zinc-500">Selecione os produtos do pedido</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nome (só nova comanda) */}
            {modalMode === 'new' && (
              <div className="px-4 pt-3 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Nome / Nº da mesa (opcional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500 transition"
                />
              </div>
            )}

            {/* Produtos */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{modalError}</div>
              )}
              {categories.map((cat) => {
                const availableItems = cat.items.filter((i) => i.isAvailable);
                if (!availableItems.length) return null;
                return (
                  <div key={cat.id} className="space-y-2">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">{cat.name}</h3>
                    <div className="space-y-1.5">
                      {availableItems.map((item) => {
                        const qty = selectedItems[item.id] ?? 0;
                        return (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-100 truncate">{item.name}</p>
                              <p className="text-xs text-amber-400 font-bold">
                                R$ {item.price.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                              <button
                                onClick={() => adjustItem(item.id, -1)}
                                disabled={qty === 0}
                                className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 font-bold text-sm flex items-center justify-center transition"
                              >-</button>
                              <span className="w-5 text-center text-sm font-black text-white">{qty}</span>
                              <button
                                onClick={() => adjustItem(item.id, 1)}
                                className="w-7 h-7 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold text-sm flex items-center justify-center transition"
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer do modal */}
            <div className="p-4 border-t border-zinc-800 flex-shrink-0">
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || totalSelectedItems === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-40 transition"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSubmitting
                  ? 'Salvando...'
                  : totalSelectedItems === 0
                  ? 'Selecione itens'
                  : `Confirmar (${totalSelectedItems} ${totalSelectedItems === 1 ? 'item' : 'itens'})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
