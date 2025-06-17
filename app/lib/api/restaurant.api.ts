// src/lib/api/restaurant.api.ts

import { NewRestaurantData, Restaurant, StrapiCollection, UpdateRestaurantData } from "@/app/types/strapi";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getRestaurantBySlug(slug: string): Promise<StrapiCollection<Restaurant> | null> {
  const populateQuery = {
    logo: true,
    selected_theme: true,
    categories: {
      populate: {
        image: true,
        products: {
          populate: {
            images: true,
            allergens: {
              populate: ['icon']
            }
          }
        }
      }
    }
  };
  const queryString = qs.stringify({
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: populateQuery,
  }, {
    encodeValuesOnly: true,
  });

  const apiUrl = `${STRAPI_URL}/api/restaurants?${queryString}`;

  try {
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch restaurant: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }
    return data.data[0];

  } catch (error) {
    console.error('An error occurred in getRestaurantBySlug:', error);
    return null;
  }
}
/**
 * ID'ye göre tek bir restoranın tüm ilişkili verilerini getirir.
 * Bu fonksiyon yetkilendirme gerektirir.
 * @param id - Getirilecek restoranın ID'si.
 * @param jwt - Kullanıcının yetkilendirme token'ı.
 * @returns {Promise<Restaurant | null>} - Restoran bulunursa verisini döndürür.
 */
export async function getRestaurantById(
  id: string | number,
  jwt: string
): Promise<Restaurant | null> {

  // populateQuery nesnesini güncelliyoruz.
  const populateQuery = {
    logo: true, // 1. seviye: Restoranın logosu
    selected_theme:true,
    categories: { // 1. seviye: Restoranın kategorileri
      populate: { // 2. seviye: Her bir kategorinin içini doldur
        image: true, // Kategorinin kendi resmi
        products: { // 2. seviye: Her bir kategorinin ürünleri
          populate: { // 3. seviye: Her bir ürünün içini doldur
            images: true,   // Ürünün resimleri
            allergens: {  // Ürünün alerjenleri
              populate: { // 4. seviye: Her bir alerjenin içini doldur
                icon: true // Alerjenin ikonu (varsa)
              }
            }
          }
        }
      }
    }
  };

  const queryString = qs.stringify({
    filters: {
      id: {
        $eq: id,
      },
    },
    populate: populateQuery,
  }, {
    encodeValuesOnly: true,
  });

  const apiUrl = `${STRAPI_URL}/api/restaurants?${queryString}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      // Hata detayını görmek için
      const errorData = await res.json();
      console.error("API Error on getRestaurantById:", JSON.stringify(errorData, null, 2));
      throw new Error(`Failed to fetch restaurant: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data[0];

  } catch (error) {
    console.error('An error occurred in getRestaurantById:', error);
    return null;
  }
}
/**
 * Belirli bir kullanıcı ID'sine ait, sadece yayınlanmış restoranları getirir.
 * Önce tüm restoranları çeker, sonra kod içinde filtreler.
 * @param userId - Restoranları getirilecek kullanıcının ID'si.
 * @param jwt - Yetkilendirme token'ı.
 * @returns {Promise<Restaurant[]>} - Restoran dizisini döndürür.
 */
export async function getRestaurantsByOwner(
  userId: number | string,
  jwt: string
): Promise<Restaurant[]> {

  // FİLTRELERİ TAMAMEN KALDIRIYORUZ!
  const queryString = qs.stringify({
    // Sadece yayınlanmış olanları ve sahiplerini getirmesini istiyoruz.
    filters: {
      publishedAt: {
        $notNull: true,
      },
    },
    populate: {
      logo: true,
      owner: true, // SAHİP BİLGİSİNİ İSTİYORUZ
    }
  }, {
    encodeValuesOnly: true,
  });

  const apiUrl = `${STRAPI_URL}/api/restaurants?${queryString}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", JSON.stringify(errorData, null, 2));
      throw new Error('Restoranlar getirilemedi.');
    }

    const responseData = await res.json();
    const allRestaurants: Restaurant[] = responseData.data;

    if (!allRestaurants) {
      return [];
    }

    // FİLTRELEMEYİ KENDİ KODUMUZDA YAPIYORUZ
    const userRestaurants = allRestaurants.filter(restaurant => {
      // Her restoranın sahibinin ID'sini, bizim istediğimiz userId ile karşılaştır
      return restaurant.owner?.id === userId;
    });

    return userRestaurants;

  } catch (error) {
    console.error("Error in getRestaurantsByOwner:", error);
    return [];
  }
}
/**
 * Yeni bir restoran oluşturur.
 */
export async function createRestaurant(
  restaurantData: NewRestaurantData,
  jwt: string
): Promise<Restaurant> {
  const createUrl = `${STRAPI_URL}/api/restaurants`;

  try {
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      // Strapi, veriyi bir 'data' objesi içinde bekler
      body: JSON.stringify({ data: restaurantData }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Restoran oluşturulamadı.');
    }
    return data.data;
  } catch (error) {
    console.error("Error in createRestaurant:", error);
    throw error;
  }
}
/**
 * Mevcut bir restoranın bilgilerini günceller.
 */
export async function updateRestaurant(
  restaurantId: number | string,
  restaurantData: UpdateRestaurantData,
  jwt: string
): Promise<Restaurant> {
  // Daha önce yazdığımız customUpdate endpoint'ini kullanabiliriz
  // veya Strapi'nin standart PUT endpoint'ini kullanabiliriz.
  // Standart olan daha basit.
  console.log(restaurantData);
  const updateUrl = `${STRAPI_URL}/api/restaurants/${restaurantId}/custom-update`;

  try {
    const res = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      // Strapi, standart PUT'ta veriyi 'data' objesi içinde bekler
      body: JSON.stringify({ data: restaurantData }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Restoran güncellenemedi.');
    }
    return data.data;
  } catch (error) {
    console.error("Error in updateRestaurant:", error);
    throw error;
  }
}