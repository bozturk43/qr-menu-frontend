// src/lib/api/product.api.ts

import type { NewProductData, Product, UpdateProductData } from "@/app/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Yeni bir ürün oluşturur.
 */
export async function createProduct(productData: NewProductData, jwt: string): Promise<Product> {
  const createUrl = `${STRAPI_URL}/api/products`;

  try {
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: productData }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Ürün oluşturulamadı.');
    }
    return data.data;
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}
/**
 * Mevcut bir ürünü günceller.
 */
export async function updateProduct(
  id: number,
  productData: UpdateProductData,
  jwt: string
): Promise<Product> {
  const updateUrl = `${STRAPI_URL}/api/products/${id}/custom-update`;

  try {
    const res = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: productData }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Ürün güncellenemedi.');
    }
    return data.data;
  } catch (error) {
    console.error("Error in updateProduct:", error);
    throw error;
  }
}
/**
 * Mevcut bir ürünü güvenli bir şekilde siler.
 */
export async function deleteProduct(id: number, jwt: string): Promise<any> {
  const deleteUrl = `${STRAPI_URL}/api/products/${id}/safe-delete`;

  try {
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Ürün silinemedi.');
    }
    return res.json();
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw error;
  }
}
export async function updateProductOrder(
  orderedProducts: { id: number; display_order: number }[],
  jwt: string
) {
  const updateUrl = `${STRAPI_URL}/api/products/batch-update-order`;
  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ products: orderedProducts }),
  });
  if (!res.ok) throw new Error('Ürün sıralaması güncellenemedi.');
  return res.json();
}