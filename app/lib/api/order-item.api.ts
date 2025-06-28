// app/lib/api/order-item.api.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function deleteOrderItem(itemId: number, jwt: string): Promise<any> {
  const url = `${STRAPI_URL}/api/order-items/${itemId}/safe-delete`;
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Sipariş kalemi silinemedi.');
    }
    return res.json();
  } catch (error) {
    throw error;
  }
}