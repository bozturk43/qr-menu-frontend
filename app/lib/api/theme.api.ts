// src/lib/api/theme.api.ts

import type { Theme } from "@/app/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Strapi'den tüm mevcut temaları getirir.
 * Bu halka açık bir endpoint'tir, yetkilendirme gerektirmez.
 * @returns {Promise<Theme[]>} - Tema dizisini döndürür.
 */
export async function getThemes(): Promise<Theme[]> {
  const url = `${STRAPI_URL}/api/themes`;

  try {
    const res = await fetch(url, {
        // Bu veri sık değişmeyeceği için Next.js'in cache'lemesini sağlayabiliriz.
        // Veya her zaman tazesini istemek için cache: 'no-store' ekleyebiliriz.
        next: { revalidate: 3600 } // 1 saatte bir tazele
    });

    if (!res.ok) {
      throw new Error("Temalar getirilemedi.");
    }

    const data = await res.json();
    return data.data || []; // Strapi v5'te veriler .data içindedir

  } catch (error) {
    console.error("Error in getThemes:", error);
    return []; // Hata durumunda boş dizi döndür
  }
}