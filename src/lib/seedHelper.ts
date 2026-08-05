import { db } from './db';

const MOCK_RESTAURANT_FALLBACK = {
  id: 'rest_demo_fallback',
  name: process.env.RESTAURANT_NAME || 'Burger & Co. Artisan',
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
      id: 'cat_1',
      name: '🔥 Destaques da Casa',
      slug: 'destaques',
      order: 1,
      items: [
        {
          id: 'item_1',
          name: 'Smash Supreme Double Bacon',
          description: 'Dois discos de 90g de Wagyu smash crocante, cheddar inglês derretido, bacon artesanal defumado em lenha de macieira e molho especial no pão brioche amanteigado.',
          price: 38.90,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: true,
          isAvailable: true,
        },
        {
          id: 'item_2',
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
      id: 'cat_2',
      name: '🍔 Hambúrgueres Artesanais',
      slug: 'burgers',
      order: 2,
      items: [
        {
          id: 'item_3',
          name: 'Classic Cheeseburger Artisanal',
          description: 'Blend da casa 160g, queijo cheddar suave derretido, conserva artesanal de picles, cebola roxa e molho barbecue artesanal no pão de gergelim.',
          price: 32.00,
          image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
          isBestSeller: false,
          isHouseFavorite: false,
          isAvailable: true,
        },
        {
          id: 'item_4',
          name: 'Gorgonzola & Caramelized Onion',
          description: 'Blend de Fraldinha 180g, creme de queijo gorgonzola morno, cebola caramelizada ao vinho tinto e bacon em cubos no pão de brioche.',
          price: 39.90,
          image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
          isBestSeller: false,
          isHouseFavorite: true,
          isAvailable: true,
        },
      ],
    },
    {
      id: 'cat_3',
      name: '🍟 Acompanhamentos',
      slug: 'acompanhamentos',
      order: 3,
      items: [
        {
          id: 'item_5',
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
      id: 'cat_4',
      name: '🥤 Bebidas & Shakes',
      slug: 'bebidas',
      order: 4,
      items: [
        {
          id: 'item_6',
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
      id: 'cat_5',
      name: '🍰 Sobremesas',
      slug: 'sobremesas',
      order: 5,
      items: [
        {
          id: 'item_7',
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

export async function ensureRestaurantSeeded() {
  const targetSlug = process.env.RESTAURANT_SLUG || 'burger-co';

  try {
    // Verificar se o restaurante já existe
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

    // Se não existir no banco, tentar criar
    if (!restaurant) {
      console.log(`[AutoSeed] Restaurante '${targetSlug}' não encontrado. Populando dados...`);

      restaurant = await db.restaurant.create({
        data: {
          name: process.env.RESTAURANT_NAME || 'Burger & Co. Artisan',
          slug: targetSlug,
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
        },
        include: {
          categories: {
            include: { items: true },
          },
        },
      });

      const catHighlights = await db.category.create({
        data: { restaurantId: restaurant.id, name: '🔥 Destaques da Casa', slug: 'destaques', order: 1 },
      });
      const catBurgers = await db.category.create({
        data: { restaurantId: restaurant.id, name: '🍔 Hambúrgueres Artesanais', slug: 'burgers', order: 2 },
      });
      const catPortions = await db.category.create({
        data: { restaurantId: restaurant.id, name: '🍟 Acompanhamentos', slug: 'acompanhamentos', order: 3 },
      });
      const catDrinks = await db.category.create({
        data: { restaurantId: restaurant.id, name: '🥤 Bebidas & Shakes', slug: 'bebidas', order: 4 },
      });
      const catDesserts = await db.category.create({
        data: { restaurantId: restaurant.id, name: '🍰 Sobremesas', slug: 'sobremesas', order: 5 },
      });

      const items = [
        {
          categoryId: catHighlights.id,
          name: 'Smash Supreme Double Bacon',
          description: 'Dois discos de 90g de Wagyu smash crocante, cheddar inglês derretido, bacon artesanal defumado em lenha de macieira e molho especial no pão brioche amanteigado.',
          price: 38.90,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: true,
          isAvailable: true,
        },
        {
          categoryId: catHighlights.id,
          name: 'Trufado Black Angus Burger',
          description: 'Burger de 180g Black Angus, queijo brie maçaricado, maionese de trufas brancas, geleia de bacon picante e rúcula fresca no pão Australiano.',
          price: 44.90,
          image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: false,
          isAvailable: true,
        },
        {
          categoryId: catBurgers.id,
          name: 'Classic Cheeseburger Artisanal',
          description: 'Blend da casa 160g, queijo cheddar suave derretido, conserva artesanal de picles, cebola roxa e molho barbecue artesanal no pão de gergelim.',
          price: 32.00,
          image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
          isBestSeller: false,
          isHouseFavorite: false,
          isAvailable: true,
        },
        {
          categoryId: catBurgers.id,
          name: 'Gorgonzola & Caramelized Onion',
          description: 'Blend de Fraldinha 180g, creme de queijo gorgonzola morno, cebola caramelizada ao vinho tinto e bacon em cubos no pão de brioche.',
          price: 39.90,
          image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
          isBestSeller: false,
          isHouseFavorite: true,
          isAvailable: true,
        },
        {
          categoryId: catPortions.id,
          name: 'Batata Rustica Trufada com Parmesão',
          description: 'Batatas rústicas douradas e crocantes, temperadas com azeite trufado, alecrim fresco e parmesão ralado na hora. Acompanha dip de maionese verde.',
          price: 24.90,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: true,
          isAvailable: true,
        },
        {
          categoryId: catDrinks.id,
          name: 'Milkshake de Nutella & Ninho (400ml)',
          description: 'Sorvete artesanal de baunilha batido com Nutella pura, coberto com chantilly fresco e polvilhado com Leite Ninho.',
          price: 22.90,
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: false,
          isAvailable: true,
        },
        {
          categoryId: catDesserts.id,
          name: 'Brownie de Chocolate Belga com Sorvete',
          description: 'Brownie morno e denso com pedaços de chocolate 70%, acompanhado de uma bola de sorvete de baunilha e calda de caramelo salgado.',
          price: 23.90,
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
          isBestSeller: true,
          isHouseFavorite: true,
          isAvailable: true,
        },
      ];

      for (const item of items) {
        await db.menuItem.create({ data: item });
      }

      restaurant = await db.restaurant.findFirst({
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
    }

    if (restaurant) {
      return restaurant;
    }
  } catch (err) {
    console.error('[AutoSeed Fallback] Erro ao acessar ou criar no banco:', err);
  }

  // Fallback 100% à prova de falhas: se o banco falhar ou estiver somente leitura no Vercel
  return MOCK_RESTAURANT_FALLBACK;
}
