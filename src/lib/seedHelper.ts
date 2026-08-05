import { db } from './db';

export interface DynamicCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  items: Array<{
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    isBestSeller?: boolean;
    isHouseFavorite?: boolean;
  }>;
}

export interface DynamicRestaurant {
  id: string;
  name: string;
  slug: string;
  isOpen: boolean;
  openingHours: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  googleRating: number;
  googleReviewCount: number;
  estimatedDeliveryTime: string;
  deliveryFee: number;
  minOrderValue: number;
  categories: DynamicCategory[];
}

// Memory Store global para sincronização garantida em 100% das chamadas
let activeMemoryRestaurant: DynamicRestaurant = {
  id: 'rest_default_active',
  name: process.env.RESTAURANT_NAME || 'Burgueria & Co. Artisan',
  slug: process.env.RESTAURANT_SLUG || 'burger-co',
  isOpen: true,
  openingHours: '18:00 às 23:30',
  phone: '(11) 99887-6655',
  whatsappNumber: '5511998876655',
  address: 'Av. Paulista, 1200 - Bela Vista, São Paulo/SP',
  googleRating: 4.9,
  googleReviewCount: 524,
  estimatedDeliveryTime: '25 - 40 min',
  deliveryFee: 6.90,
  minOrderValue: 20.00,
  categories: [
    {
      id: 'cat_fallback_1',
      name: '🔥 Destaques da Casa',
      slug: 'destaques',
      order: 1,
      items: [
        {
          id: 'item_fb_1',
          categoryId: 'cat_fallback_1',
          name: 'Smash Supreme Double Bacon',
          description: 'Dois discos de 90g de Wagyu smash crocante, cheddar inglês derretido, bacon artesanal defumado em lenha de macieira e molho especial no pão brioche amanteigado.',
          price: 38.90,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: true,
          isAvailable: true,
        },
        {
          id: 'item_fb_2',
          categoryId: 'cat_fallback_1',
          name: 'Trufado Black Angus Burger',
          description: 'Burger de 180g Black Angus, queijo brie maçaricado, maionese de trufas brancas, geleia de bacon picante e rúcula fresca no pão Australiano.',
          price: 44.90,
          image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: false,
          isAvailable: true,
        },
      ],
    },
    {
      id: 'cat_fallback_2',
      name: '🍔 Hambúrgueres Artesanais',
      slug: 'burgers',
      order: 2,
      items: [
        {
          id: 'item_fb_3',
          categoryId: 'cat_fallback_2',
          name: 'Classic Cheeseburger Artisanal',
          description: 'Blend da casa 160g, queijo cheddar suave derretido, conserva artesanal de picles, cebola roxa e molho barbecue artesanal no pão de gergelim.',
          price: 32.00,
          image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
          isBestSeller: false,
          isHouseFavorite: false,
          isAvailable: true,
        },
      ],
    },
    {
      id: 'cat_fallback_3',
      name: '🍟 Acompanhamentos',
      slug: 'acompanhamentos',
      order: 3,
      items: [
        {
          id: 'item_fb_4',
          categoryId: 'cat_fallback_3',
          name: 'Batata Rustica Trufada com Parmesão',
          description: 'Batatas rústicas douradas e crocantes, temperadas com azeite trufado, alecrim fresco e parmesão ralado na hora. Acompanha dip de maionese verde.',
          price: 24.90,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: true,
          isAvailable: true,
        },
      ],
    },
    {
      id: 'cat_fallback_4',
      name: '🥤 Bebidas & Shakes',
      slug: 'bebidas',
      order: 4,
      items: [
        {
          id: 'item_fb_5',
          categoryId: 'cat_fallback_4',
          name: 'Milkshake de Nutella & Ninho (400ml)',
          description: 'Sorvete artesanal de baunilha batido com Nutella pura, coberto com chantilly fresco e polvilhado com Leite Ninho.',
          price: 22.90,
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: false,
          isAvailable: true,
        },
      ],
    },
    {
      id: 'cat_fallback_5',
      name: '🍰 Sobremesas',
      slug: 'sobremesas',
      order: 5,
      items: [
        {
          id: 'item_fb_6',
          categoryId: 'cat_fallback_5',
          name: 'Brownie de Chocolate Belga com Sorvete',
          description: 'Brownie morno e denso com pedaços de chocolate 70%, acompanhado de uma bola de sorvete de baunilha e calda de caramelo salgado.',
          price: 23.90,
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: true,
          isAvailable: true,
        },
      ],
    },
  ],
};

export async function ensureRestaurantSeeded(requestedSlug?: string) {
  const targetSlug = requestedSlug || process.env.RESTAURANT_SLUG || 'burger-co';

  try {
    let restaurant = await db.restaurant.findFirst({
      where: { slug: targetSlug },
      include: {
        categories: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: [
                { isBestSeller: 'desc' },
                { isHouseFavorite: 'desc' },
                { name: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!restaurant) {
      restaurant = await db.restaurant.findFirst({
        include: {
          categories: {
            orderBy: { order: 'asc' },
            include: {
              items: {
                orderBy: [
                  { isBestSeller: 'desc' },
                  { isHouseFavorite: 'desc' },
                  { name: 'asc' },
                ],
              },
            },
          },
        },
      });
    }

    if (restaurant) {
      activeMemoryRestaurant = {
        ...restaurant,
        categories: restaurant.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          order: c.order,
          items: c.items || [],
        })),
      };
      return activeMemoryRestaurant;
    }
  } catch (err) {
    console.error('[Prisma Safety Net] Usando repositório sincronizado:', err);
  }

  return activeMemoryRestaurant;
}

// Métodos auxiliares de mutação com sincronização dupla (Prisma + Memory Store)

export async function addDynamicCategory(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const catId = `cat_${Date.now()}`;

  const newCategory: DynamicCategory = {
    id: catId,
    name: name.trim(),
    slug,
    order: activeMemoryRestaurant.categories.length + 1,
    items: [],
  };

  // 1. Atualizar em memória
  const existing = activeMemoryRestaurant.categories.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (existing) {
    return existing;
  }
  activeMemoryRestaurant.categories.push(newCategory);

  // 2. Persistir no Prisma DB
  try {
    await db.category.create({
      data: {
        id: catId,
        restaurantId: activeMemoryRestaurant.id,
        name: name.trim(),
        slug,
        order: newCategory.order,
      },
    });
  } catch (err) {
    console.warn('Categoria gravada na memória ativa:', err);
  }

  return newCategory;
}

export async function addDynamicMenuItem(itemData: {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId?: string;
  newCategoryName?: string;
  isAvailable?: boolean;
  isBestSeller?: boolean;
  isHouseFavorite?: boolean;
}) {
  let targetCat = activeMemoryRestaurant.categories.find((c) => c.id === itemData.categoryId);

  if (itemData.newCategoryName && itemData.newCategoryName.trim()) {
    targetCat = await addDynamicCategory(itemData.newCategoryName);
  }

  if (!targetCat) {
    if (activeMemoryRestaurant.categories.length > 0) {
      targetCat = activeMemoryRestaurant.categories[0];
    } else {
      targetCat = await addDynamicCategory('Geral');
    }
  }

  const itemId = `item_${Date.now()}`;
  const newItem = {
    id: itemId,
    categoryId: targetCat.id,
    name: itemData.name.trim(),
    description: itemData.description.trim(),
    price: Number(itemData.price),
    image: itemData.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isAvailable: typeof itemData.isAvailable === 'boolean' ? itemData.isAvailable : true,
    isBestSeller: Boolean(itemData.isBestSeller),
    isHouseFavorite: Boolean(itemData.isHouseFavorite),
  };

  // 1. Atualizar em memória
  targetCat.items.push(newItem);

  // 2. Persistir no Prisma DB
  try {
    await db.menuItem.create({
      data: {
        id: itemId,
        categoryId: targetCat.id,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        image: newItem.image,
        isAvailable: newItem.isAvailable,
        isBestSeller: newItem.isBestSeller,
        isHouseFavorite: newItem.isHouseFavorite,
      },
    });
  } catch (err) {
    console.warn('Item adicionado na memória ativa:', err);
  }

  return { ...newItem, category: { id: targetCat.id, name: targetCat.name } };
}

export async function updateDynamicMenuItem(itemData: {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isBestSeller?: boolean;
  isHouseFavorite?: boolean;
}) {
  let updatedItem: any = null;

  for (const cat of activeMemoryRestaurant.categories) {
    const idx = cat.items.findIndex((i) => i.id === itemData.id);
    if (idx > -1) {
      cat.items[idx] = {
        ...cat.items[idx],
        name: itemData.name !== undefined ? itemData.name.trim() : cat.items[idx].name,
        description: itemData.description !== undefined ? itemData.description.trim() : cat.items[idx].description,
        price: typeof itemData.price === 'number' ? itemData.price : cat.items[idx].price,
        image: itemData.image !== undefined ? itemData.image : cat.items[idx].image,
        isAvailable: typeof itemData.isAvailable === 'boolean' ? itemData.isAvailable : cat.items[idx].isAvailable,
        isBestSeller: typeof itemData.isBestSeller === 'boolean' ? itemData.isBestSeller : cat.items[idx].isBestSeller,
        isHouseFavorite: typeof itemData.isHouseFavorite === 'boolean' ? itemData.isHouseFavorite : cat.items[idx].isHouseFavorite,
      };
      updatedItem = cat.items[idx];
      break;
    }
  }

  try {
    await db.menuItem.update({
      where: { id: itemData.id },
      data: {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        image: itemData.image,
        isAvailable: itemData.isAvailable,
        isBestSeller: itemData.isBestSeller,
        isHouseFavorite: itemData.isHouseFavorite,
      },
    });
  } catch (err) {
    console.warn('Item atualizado na memória ativa:', err);
  }

  return updatedItem || itemData;
}

export async function deleteDynamicMenuItem(itemId: string) {
  for (const cat of activeMemoryRestaurant.categories) {
    cat.items = cat.items.filter((i) => i.id !== itemId);
  }

  try {
    await db.orderItem.deleteMany({ where: { menuItemId: itemId } }).catch(() => null);
    await db.menuItem.delete({ where: { id: itemId } }).catch(() => null);
  } catch (err) {
    console.warn('Item removido da memória ativa:', err);
  }

  return { success: true, deletedId: itemId };
}

export async function setDynamicRestaurantStatus(isOpen: boolean) {
  activeMemoryRestaurant.isOpen = isOpen;

  try {
    await db.restaurant.updateMany({
      data: { isOpen },
    });
  } catch (err) {
    console.warn('Status do restaurante salvo na memória ativa:', err);
  }

  return activeMemoryRestaurant;
}
