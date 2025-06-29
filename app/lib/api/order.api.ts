import { Order } from "@/app/types/strapi";

// src/lib/api/order.api.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
export interface AddItemsPayload {
  items: {
    productId: number;
    productName: string;
    quantity: number;
    totalPrice: number;
    variations: string;
  }[];
}
export interface ApplyDiscountPayload {
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
}


export async function submitOrder(orderPayload: any) {
  const url = `${STRAPI_URL}/api/orders/submit`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Sipariş gönderilemedi.');
    return data;
  } catch (error) {
    console.error("Error in submitOrder:", error);
    throw error;
  }
}
/**
 * Belirli bir restorana ait, durumu 'open' olan tüm siparişleri getirir.
 * Yetkilendirme gerektirir.
 * @param restaurantId - Restoranın ID'si
 * @param jwt - Yetkilendirme token'ı
 * @returns {Promise<Order[]>} - Açık siparişlerin dizisini döndürür.
 */
export async function getOpenOrdersForRestaurant(
  restaurantId: string | number,
  jwt: string
): Promise<Order[]> {
  const url = `${STRAPI_URL}/api/orders/open-for-restaurant/${restaurantId}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: 'no-store', // Her zaman en güncel veriyi almak için
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Açık siparişler getirilemedi.');
    }

    const data = await res.json();
    // Bizim özel controller'ımız `transformResponse` kullandığı için veri `data` içinde sarmalanmış olabilir.
    return data.data || data;

  } catch (error) {
    console.error("Error in getOpenOrdersForRestaurant:", error);
    return [];
  }
}
/**
 * Mevcut bir siparişe yeni kalemler ekler.
 * @param orderId - Ürün eklenecek siparişin ID'si
 * @param payload - Eklenecek ürünleri içeren obje
 * @param jwt - Yetkilendirme token'ı
 * @returns {Promise<Order>} - Güncellenmiş siparişin tamamını döndürür.
 */
export async function addItemsToOrder(
  orderId: number | string,
  payload: AddItemsPayload,
  jwt: string
): Promise<Order> {
  const url = `${STRAPI_URL}/api/orders/${orderId}/add-items`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Siparişe ürün eklenemedi.');
    }

    // Bizim custom controller'ımız güncellenmiş sipariş objesini döndürür
    return data;

  } catch (error) {
    console.error("Error in addItemsToOrder:", error);
    throw error;
  }
}

export async function payOrderItems(orderId: number, payload: { itemIds: number[], paymentMethod: string }, jwt: string) {
  const url = `${STRAPI_URL}/api/orders/${orderId}/pay-items`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Adisyon kalemi silinemedi');
    }

    return data;

  } catch (error) {
    console.error("Error in payOrderItems:", error);
    throw error;
  }
}

export async function closeOrder(orderId: number, payload: { paymentMethod: string }, jwt: string) {
  const url = `${STRAPI_URL}/api/orders/${orderId}/close`;


  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Adisyon kapatılamadı !');
    }

    return data;

  } catch (error) {
    console.error("Error in closeOrder:", error);
    throw error;
  }
}
export async function applyDiscountToOrder(
  orderId: number | string,
  payload: ApplyDiscountPayload,
  jwt: string
): Promise<Order> {
  const url = `${STRAPI_URL}/api/orders/${orderId}/apply-discount`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'İndirim uygulanamadı.');
    }
    return data.data; // Controller'ımız güncellenmiş siparişi döndürüyor
  } catch (error) {
    console.error("Error in applyDiscountToOrder:", error);
    throw error;
  }
}
