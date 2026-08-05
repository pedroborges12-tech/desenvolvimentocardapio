'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Check, X, Image as ImageIcon, Flame, Star, Upload, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isBestSeller?: boolean;
  isHouseFavorite?: boolean;
  categoryId: string;
  category: { name: string };
}

const PRESET_IMAGES = [
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Batata Rústica', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bebida', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sobremesa', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80' },
];

export default function AdminMenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(getApiUrl('/api/admin/check-auth'));
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/admin/login');
          return;
        }
        fetchMenu();
      } catch (err) {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, [router]);

  // Edição Rápida de Preço inline
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editPriceInline, setEditPriceInline] = useState<number>(0);

  // Estado do Modal (Novo vs Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmação de Exclusão
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Campos do Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [categoryId, setCategoryId] = useState('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isHouseFavorite, setIsHouseFavorite] = useState(false);

  const fetchMenu = async () => {
    try {
      const [resItems, resCats] = await Promise.all([
        fetch(getApiUrl('/api/admin/menu')),
        fetch(getApiUrl('/api/admin/categories')),
      ]);

      if (resItems.ok) {
        const dataItems = await resItems.json();
        setItems(dataItems);
      }

      if (resCats.ok) {
        const dataCats = await resCats.json();
        setCategories(dataCats);
      }
    } catch (err) {
      console.error('Erro ao carregar cardápio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Alternar Estoque (Atalho Rápido no Card)
  const toggleAvailability = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: !currentStatus } : i))
    );

    await fetch(getApiUrl('/api/admin/menu'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isAvailable: !currentStatus }),
    });
  };

  // Salvar Preço Inline (Atalho Rápido no Card)
  const handleSavePriceInline = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await fetch(getApiUrl('/api/admin/menu'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, price: Number(editPriceInline) }),
    });
    setInlineEditingId(null);
    fetchMenu();
  };

  // Resetar Formulário
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImage(PRESET_IMAGES[0].url);
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
    setIsAvailable(true);
    setIsBestSeller(false);
    setIsHouseFavorite(false);
    setErrorMsg('');
    setEditingItem(null);
    setIsConfirmingDelete(false);
  };

  // Abrir Modal de Novo Produto
  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição ao Clicar no Card
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setImage(item.image);
    setCategoryId(item.categoryId);
    setIsAvailable(item.isAvailable);
    setIsBestSeller(Boolean(item.isBestSeller));
    setIsHouseFavorite(Boolean(item.isHouseFavorite));
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
    setErrorMsg('');
    setIsConfirmingDelete(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Salvar Produto (Novo ou Edição)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Informe o nome do produto.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Informe a descrição do produto.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg('Informe um preço válido maior que R$ 0,00.');
      return;
    }
    if (isCreatingNewCategory && !newCategoryName.trim()) {
      setErrorMsg('Informe o nome da nova categoria.');
      return;
    }
    if (!isCreatingNewCategory && !categoryId) {
      setErrorMsg('Selecione uma categoria para o produto.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isEdit = Boolean(editingItem);
      const url = getApiUrl('/api/admin/menu');
      const method = isEdit ? 'PATCH' : 'POST';

      const payload = {
        id: editingItem?.id,
        name,
        description,
        price: Number(price),
        image,
        categoryId: isCreatingNewCategory ? undefined : categoryId,
        newCategoryName: isCreatingNewCategory ? newCategoryName : undefined,
        isAvailable,
        isBestSeller,
        isHouseFavorite,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar produto.');
      }

      handleCloseModal();
      fetchMenu(); // Atualizar lista completa imediatamente
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir Produto com Confirmação
  const handleDeleteProduct = async () => {
    if (!editingItem) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl(`/api/admin/menu?id=${editingItem.id}`), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir produto.');
      }

      setItems((prev) => prev.filter((i) => i.id !== editingItem.id));
      handleCloseModal();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
        Carregando itens do cardápio...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Fixo / Sticky */}
        <div className="sticky top-4 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2.5 rounded-2xl bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">Gestão do Cardápio</h1>
              <p className="text-xs text-zinc-400">Clique em qualquer produto para editar ou excluir</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Adicionar Produto</span>
          </button>
        </div>

        {/* Lista de Produtos (Cards Clicáveis) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-sm font-extrabold text-zinc-300 uppercase tracking-wider">
              Produtos Cadastrados ({items.length})
            </h2>
            <span className="text-xs text-zinc-500">💡 Clique no card para editar dados completos</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenEditModal(item)}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/50 cursor-pointer transition-all shadow-md gap-4"
              >
                {/* Dados Principais do Card */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800 group-hover:scale-105 transition-transform">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        {item.category.name}
                      </span>
                      {item.isBestSeller && (
                        <span className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-amber-500" /> Mais Pedido
                        </span>
                      )}
                      {item.isHouseFavorite && (
                        <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-rose-400" /> Favorito
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition">
                        {item.name}
                      </h3>
                      <Edit3 className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1 max-w-md">{item.description}</p>
                  </div>
                </div>

                {/* Atalhos Rápidos (Preço e Toggle de Estoque) com stopPropagation */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800/60 pt-3 sm:pt-0"
                >
                  {/* Edição Rápida de Preço */}
                  {inlineEditingId === item.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-amber-400 font-bold">R$</span>
                      <input
                        type="number"
                        step="0.10"
                        value={editPriceInline}
                        onChange={(e) => setEditPriceInline(parseFloat(e.target.value))}
                        className="w-24 bg-zinc-900 border border-amber-500 rounded-xl px-2 py-1 text-xs text-amber-400 font-bold outline-none"
                      />
                      <button
                        onClick={(e) => handleSavePriceInline(e, item.id)}
                        className="p-2 rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setInlineEditingId(item.id);
                        setEditPriceInline(item.price);
                      }}
                      className="cursor-pointer hover:bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80 text-right transition"
                      title="Clique aqui para editar apenas o preço"
                    >
                      <span className="text-[10px] text-zinc-500 block">Preço (clique p/ editar)</span>
                      <span className="text-sm font-black text-amber-400">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  {/* Toggle Rápido de Estoque */}
                  <button
                    onClick={(e) => toggleAvailability(e, item.id, item.isAvailable)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      item.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    {item.isAvailable ? 'Em Estoque' : 'Fora de Estoque'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Formulário Completo (Adicionar / Editar Produto) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header do Modal */}
            <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  {editingItem ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[3]" />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {editingItem ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {editingItem ? `Alterar dados do produto ${editingItem.name}` : 'Preencha as informações para publicar no cardápio'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Caixa de Confirmação de Exclusão */}
              {isConfirmingDelete && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-left space-y-3 animate-scaleUp">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Confirmar Exclusão de Produto</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Tem certeza que deseja excluir <strong className="text-white">&quot;{name}&quot;</strong>? Essa ação excluirá o produto permanentemente e não poderá ser desfeita.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                    >
                      {isSubmitting ? 'Excluindo...' : 'Sim, Excluir Produto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-bold text-xs border border-zinc-800 transition"
                    >
                      Cancelar Exclusão
                    </button>
                  </div>
                </div>
              )}

              {/* Preview e Upload da Foto */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Foto do Produto
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700 flex-shrink-0">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Carregar Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <p className="text-[11px] text-zinc-500">Ou escolha uma imagem de exemplo:</p>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 transition ${
                            image === preset.url
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Categoria *
                </label>
                {!isCreatingNewCategory ? (
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      if (e.target.value === 'NEW_CATEGORY') {
                        setIsCreatingNewCategory(true);
                      } else {
                        setCategoryId(e.target.value);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500 transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="NEW_CATEGORY">+ Criar nova categoria...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Sobremesas Especiais..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-amber-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCategory(false)}
                      className="px-3 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold"
                    >
                      Voltar
                    </button>
                  </div>
                )}
              </div>

              {/* Nome do Produto */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Smash Burger Double Bacon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Descrição Curta *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva os ingredientes saborosos deste produto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              {/* Preço e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="34.90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-bold outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Status de Estoque
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition ${
                      isAvailable
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500 text-rose-400'
                    }`}
                  >
                    <span>{isAvailable ? 'Em Estoque' : 'Fora de Estoque'}</span>
                    <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-0"
                  />
                  <span>🔥 Marcar como &quot;Mais Pedido&quot;</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHouseFavorite}
                    onChange={(e) => setIsHouseFavorite(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-800 text-rose-500 focus:ring-0"
                  />
                  <span>⭐ Marcar como &quot;Favorito&quot;</span>
                </label>
              </div>
            </form>

            {/* Footer do Modal */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
              <div>
                {editingItem && !isConfirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Excluir Produto</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 transition"
                >
                  {isSubmitting ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{editingItem ? 'Salvar Alterações' : 'Salvar Produto'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
