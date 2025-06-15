// src/lib/api/product.api.ts

import type { NewProductData, Product, UpdateProductData } from "@/app/types/strapi";
import { uploadFile } from './category.api'; // Resim yükleme fonksiyonunu yeniden kullanacağız

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