// src/lib/api/order.api.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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