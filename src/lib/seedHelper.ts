import { db } from './db';

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
  categories: Array<{
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
      isBestSeller: boolean;
      isHouseFavorite: boolean;
    }>;
  }>;
}

const SLUG = process.env.RESTAURANT_SLUG || 'burger-co';

export async function ensureRestaurantSeeded(): Promise<DynamicRestaurant> {
  let restaurant = await db.restaurant.findFirst({
    where: { slug: SLUG },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: [{ isBestSeller: 'desc' }, { isHouseFavorite: 'desc' }, { name: 'asc' }],
          },
        },
      },
    },
  });

  if (!restaurant) {
    restaurant = await db.restaurant.create({
      data: {
        name: process.env.RESTAURANT_NAME || 'Meu Restaurante',
        slug: SLUG,
        isOpen: true,
      },
      include: {
        categories: { include: { items: true } },
      },
    });
  }

  return restaurant as unknown as DynamicRestaurant;
}

export async function ensureRestaurantAdmin(): Promise<DynamicRestaurant> {
  let restaurant = await db.restaurant.findFirst({
    where: { slug: SLUG },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          items: {
            orderBy: [{ isBestSeller: 'desc' }, { isHouseFavorite: 'desc' }, { name: 'asc' }],
          },
        },
      },
    },
  });

  if (!restaurant) {
    restaurant = await db.restaurant.create({
      data: {
        name: process.env.RESTAURANT_NAME || 'Meu Restaurante',
        slug: SLUG,
        isOpen: true,
      },
      include: {
        categories: { include: { items: true } },
      },
    });
  }

  return restaurant as unknown as DynamicRestaurant;
}
