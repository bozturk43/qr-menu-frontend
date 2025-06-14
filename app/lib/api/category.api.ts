// src/lib/api/category.api.ts
import type { Category, NewCategoryData } from "@/app/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Strapi'ye kategori ekleriz.
 * @param categoryData - Eklenecek data
 * @param jwt - Yetkilendirme token'ı
 * @returns {Promise<Category>} - Eklenen category
 */
export async function createCategory(categoryData: NewCategoryData, jwt: string): Promise<Category> {
    const createUrl = `${STRAPI_URL}/api/categories`;

    try {
        const res = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            // Strapi, veriyi bir 'data' objesi içinde bekler
            body: JSON.stringify({ data: categoryData }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || 'Kategori oluşturulamadı.');
        }
        return data.data;
    } catch (error) {
        console.error("Error in createQuery:", error);
        throw error;
    }

}
/**
 * Sıralaması değiştirilmiş kategorileri toplu olarak güncellemek için.
 * @param orderedCategories - Sıralı kategoriler
 * @param jwt - Yetkilendirme token'ı
 */
export async function updateCategoryOrder(
    orderedCategories: { id: number; display_order: number }[],
    jwt: string
) {
    const updateUrl = `${STRAPI_URL}/api/categories/batch-update-order`; // Strapide Özel bir endpoint oluşturduk

    const res = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ categories: orderedCategories }),
    });

    if (!res.ok) throw new Error('Kategori sıralaması güncellenemedi.');
    return res.json();
}
/**
 * Strapi'ye bir dosya yükler ve ID'sini döndürür.
 * @param file - Yüklenecek dosya
 * @param jwt - Yetkilendirme token'ı
 * @returns {Promise<number>} - Yüklenen medyanın ID'si
 */
export async function uploadFile(file: File, jwt: string): Promise<number> {
  const uploadUrl = `${STRAPI_URL}/api/upload`;
  console.log(file,jwt);
  // Dosyayı göndermek için FormData kullanıyoruz
  const formData = new FormData();
  formData.append('files', file);

  try {
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Dosya yüklenemedi.');
    }

    // Strapi yüklenen dosyaları bir dizi içinde döndürür, ilk elemanın ID'sini alıyoruz.
    return data[0].id;

  } catch (error) {
    console.error("Error in uploadFile:", error);
    throw error;
  }
}