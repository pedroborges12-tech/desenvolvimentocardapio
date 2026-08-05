'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { BannerHero } from '@/components/BannerHero';
import { SocialProof } from '@/components/SocialProof';
import { CategoryNav } from '@/components/CategoryNav';
import { MenuItemCard, MenuItemData } from '@/components/MenuItemCard';
import { ItemModal } from '@/components/ItemModal';
import { FloatingCart } from '@/components/FloatingCart';
import { CheckoutModal, CartItem } from '@/components/CheckoutModal';
import { PixModal } from '@/components/PixModal';
import { OrderConfirmationModal } from '@/components/OrderConfirmationModal';
import { RestaurantClosedBanner } from '@/components/RestaurantClosedBanner';

interface RestaurantData {
  id: string;
  name: string;
  isOpen: boolean;
  openingHours: string;
  googleRating: number;
  googleReviewCount: number;
  estimatedDeliveryTime: string;
  deliveryFee: number;
  minOrderValue: number;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    items: MenuItemData[];
  }>;
}

export default function Home() {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados dos modais e carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // Modal Pix e Confirmação
  const [pixModalData, setPixModalData] = useState<{
    orderId: string;
    orderNumber: string;
    total: number;
    pixQrCode?: string;
    pixCopyPaste?: string;
  } | null>(null);

  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryType: string;
    address?: string;
    total: number;
    estimatedDeliveryTime?: string;
    items: Array<{ name: string; quantity: number; unitPrice: number; notes?: string }>;
  } | null>(null);

  // Carregar dados da API
  useEffect(() => {
    const isAdminOnly =
      process.env.NEXT_PUBLIC_IS_ADMIN_ONLY === 'true' ||
      (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0);

    if (isAdminOnly) {
      window.location.href = '/admin';
      return;
    }

    async function fetchRestaurant() {
      try {
        const res = await fetch('/api/restaurant');
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        }
      } catch (err) {
        console.error('Erro ao carregar restaurante:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, []);

  // Totalizadores do Carrinho
  const totalCartItems = useMemo(
    () => cart.reduce((acc, curr) => acc + curr.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0),
    [cart]
  );

  // Manipulação de Carrinho
  const handleAddToCart = (item: MenuItemData, quantity: number, notes: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.item.id === item.id && i.notes === notes);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { item, quantity, notes }];
    });
  };

  const handleAddQuick = (item: MenuItemData) => {
    handleAddToCart(item, 1, '');
  };

  const handleRemoveQuick = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === itemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((i) => (i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prev.filter((i) => i.item.id !== itemId);
    });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.item.id !== itemId));
    } else {
      setCart((prev) => prev.map((i) => (i.item.id === itemId ? { ...i, quantity: newQty } : i)));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  // Submeter Checkout 1-Step
  const handleSubmitCheckout = async (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'DELIVERY' | 'PICKUP';
    address: string;
    paymentMethod: 'PIX' | 'CREDIT_CARD';
    notes: string;
  }) => {
    setIsSubmittingCheckout(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          items: cart.map((c) => ({
            menuItemId: c.item.id,
            quantity: c.quantity,
            notes: c.notes,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar checkout');
      }

      setIsCheckoutOpen(false);
      setCart([]);

      if (orderData.paymentMethod === 'PIX') {
        setPixModalData({
          orderId: data.order.id,
          orderNumber: data.order.orderNumber,
          total: data.order.total,
          pixQrCode: data.charge.pixQrCode,
          pixCopyPaste: data.charge.pixCopyPaste,
        });
      } else {
        setConfirmedOrder(data.order);
      }
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center animate-bounce text-2xl shadow-lg shadow-amber-500/20">
          🍔
        </div>
        <p className="text-xs font-bold text-zinc-400 animate-pulse">Carregando cardápio gourmet...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Restaurante não encontrado.
      </div>
    );
  }

  // Filtragem de Produtos
  const filteredCategories = restaurant.categories
    .map((cat) => {
      let items = cat.items;
      if (activeCategoryId !== 'all' && cat.id !== activeCategoryId) {
        items = [];
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(
          (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
        );
      }
      return { ...cat, items };
    })
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 pb-28">
      {/* 1. Header */}
      <Header
        restaurantName={restaurant.name}
        isOpen={restaurant.isOpen}
        openingHours={restaurant.openingHours}
        googleRating={restaurant.googleRating}
        googleReviewCount={restaurant.googleReviewCount}
        cartCount={totalCartItems}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCheckoutOpen(true)}
      />

      {/* 2. Restaurant Closed Banner (if applicable) */}
      {!restaurant.isOpen && <RestaurantClosedBanner openingHours={restaurant.openingHours} />}

      {/* 3. Hero & Urgency Banner */}
      <BannerHero
        estimatedDeliveryTime={restaurant.estimatedDeliveryTime}
        deliveryFee={restaurant.deliveryFee}
        minOrderValue={restaurant.minOrderValue}
      />

      {/* 4. Social Proof Bar */}
      <SocialProof />

      {/* 5. Category Navigation & Realtime Search */}
      <CategoryNav
        categories={restaurant.categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 6. Menu Section */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-zinc-200">Nenhum item encontrado</h3>
            <p className="text-xs text-zinc-500">Tente buscar por outro termo ou selecione uma categoria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategoryId('all');
              }}
              className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl shadow-md"
            >
              Ver Todo o Cardápio
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {cat.name}
                </h2>
                <span className="text-xs text-zinc-500 font-medium">
                  {cat.items.length} {cat.items.length === 1 ? 'opção' : 'opções'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {cat.items.map((item) => {
                  const cartEntry = cart.find((c) => c.item.id === item.id);
                  const cartQty = cartEntry ? cartEntry.quantity : 0;
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      cartQuantity={cartQty}
                      onSelectItem={setSelectedItem}
                      onAddQuick={handleAddQuick}
                      onRemoveQuick={handleRemoveQuick}
                    />
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* 7. Floating Cart Bar */}
      <FloatingCart
        totalItems={totalCartItems}
        subtotal={cartSubtotal}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 8. Item Details & Observation Modal */}
      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 9. 1-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        deliveryFee={restaurant.deliveryFee}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSubmitCheckout={handleSubmitCheckout}
        isSubmitting={isSubmittingCheckout}
      />

      {/* 10. Pix Payment Modal */}
      {pixModalData && (
        <PixModal
          isOpen={!!pixModalData}
          orderId={pixModalData.orderId}
          orderNumber={pixModalData.orderNumber}
          total={pixModalData.total}
          pixQrCode={pixModalData.pixQrCode}
          pixCopyPaste={pixModalData.pixCopyPaste}
          onClose={() => setPixModalData(null)}
          onPaymentConfirmed={async () => {
            const res = await fetch(`/api/orders/${pixModalData.orderId}`);
            if (res.ok) {
              const data = await res.json();
              setConfirmedOrder(data);
            }
            setPixModalData(null);
          }}
        />
      )}

      {/* 11. Order Confirmation & WhatsApp Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrder}
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />
    </div>
  );
}
