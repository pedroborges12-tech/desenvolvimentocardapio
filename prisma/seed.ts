import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Limpar dados existentes
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.restaurant.deleteMany({});

  // Criar Restaurante Principal
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Burger & Co. Artisan',
      slug: 'burger-co',
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
  });

  // Criar Categorias
  const catHighlights = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: '🔥 Destaques da Casa',
      slug: 'destaques',
      order: 1,
    },
  });

  const catBurgers = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: '🍔 Hambúrgueres Artesanais',
      slug: 'burgers',
      order: 2,
    },
  });

  const catPortions = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: '🍟 Acompanhamentos',
      slug: 'acompanhamentos',
      order: 3,
    },
  });

  const catDrinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: '🥤 Bebidas & Shakes',
      slug: 'bebidas',
      order: 4,
    },
  });

  const catDesserts = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: '🍰 Sobremesas',
      slug: 'sobremesas',
      order: 5,
    },
  });

  // Itens do Cardápio
  const items = [
    // Destaques / Burgers
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
      categoryId: catBurgers.id,
      name: 'Veggie Crispy Chickpea',
      description: 'Hambúrguer artesanal de grão de bico e cogumelos grelhados, queijo vegano derretido, alface americana, tomate e maionese verde de ervas.',
      price: 34.90,
      image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
      isHouseFavorite: false,
      isAvailable: true,
    },

    // Acompanhamentos
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
      categoryId: catPortions.id,
      name: 'Onion Rings Crocantes',
      description: 'Anéis de cebola empanados na farinha panko super crocante. Acompanha molho aioli de alho assado.',
      price: 21.90,
      image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
      isHouseFavorite: false,
      isAvailable: true,
    },
    {
      categoryId: catPortions.id,
      name: 'Dadinhos de Tapioca com Geleia de Pimenta',
      description: '8 unidades de dadinhos crocantes de queijo coalho e tapioca. Acompanha geleia de pimenta defumada.',
      price: 26.00,
      image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
      isHouseFavorite: false,
      isAvailable: true,
    },

    // Bebidas
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
      categoryId: catDrinks.id,
      name: 'Soda Artesanal de Frutas Vermelhas',
      description: 'Infusão natural de morango, amora e mirtilo com água com gás e xarope de limão siciliano.',
      price: 14.90,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
      isHouseFavorite: false,
      isAvailable: true,
    },
    {
      categoryId: catDrinks.id,
      name: 'Coca-Cola Zero Lata 350ml',
      description: 'Geladíssima',
      price: 7.50,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
      isHouseFavorite: false,
      isAvailable: true,
    },

    // Sobremesas
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
    {
      categoryId: catDesserts.id,
      name: 'Cheesecake de Frutas Vermelhas',
      description: 'Massa crocante de biscoito amanteigado, creme leve de queijo e cobertura de geleia artesanal de frutas silvestres.',
      price: 21.90,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      isBestSeller: false,
      isHouseFavorite: false,
      isAvailable: true,
    },
  ];

  for (const item of items) {
    await prisma.menuItem.create({ data: item });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
