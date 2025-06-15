// src/lib/api/category.api.ts
import type { Category, NewCategoryData, UpdateCategoryData } from "@/app/types/strapi";

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
/**
 * Mevcut bir kategoriyi günceller.
 * @param id - Güncellenecek kategori idsi.
 * @param jwt - Yetkilendirme token'ı,
 * @param categoryData - Yeni kategori bilgileri
 * @returns {Promise<Category>} - Güncellenen Category
 */
export async function updateCategory(
    id: number,
    categoryData: UpdateCategoryData,
    jwt: string
): Promise<Category> {
    const updateUrl = `${STRAPI_URL}/api/categories/${id}/custom-update`;

    try {
        const res = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ data: categoryData }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || 'Kategori güncellenemedi.');
        }

        // customUpdate fonksiyonumuz transformResponse kullandığı için,
        // veri yine data sarmalayıcısı içinde gelecektir.
        return data.data;

    } catch (error) {
        console.error("Error in updateCategory:", error);
        throw error;
    }
}
/**
 * Mevcut bir kategoriyi siler.
 * @param id - Silinecek kategori idsi.
 * @param jwt - Yetkilendirme token'ı,
 */
export async function deleteCategory(id: number, jwt: string): Promise<void> {
    const deleteUrl = `${STRAPI_URL}/api/categories/${id}/safe-delete`;


    try {
        const res = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });

        // Eğer yanıt başarılı değilse (4xx, 5xx), hata mesajını oku ve fırlat.
        if (!res.ok) {
            // res.json() bir Promise döndürdüğü için 'await' kullanmalıyız.
            const errorData = await res.json();
            // Strapi'nin hata objesinden asıl mesajı alıyoruz.
            throw new Error(errorData.error?.message || 'Kategori silinemedi.');
        }

        // Eğer yanıt başarılıysa (204 No Content), bir şey döndürmeye gerek yok.
        // Fonksiyon sessizce biter.

    } catch (error) {
        // console.error("Error in deleteCategory:", error);
        // Hatanın tekrar yukarıya, useMutation'a fırlatılmasını sağlıyoruz.
        throw error;
    }
}