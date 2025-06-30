// app/lib/utils.ts
import type { StrapiMedia } from "@/app/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Strapi'den gelen bir medya objesini alır ve her ortamda çalışacak
 * tam ve doğru bir URL döndürür.
 * @param {StrapiMedia | null | undefined} media - Strapi'nin medya objesi.
 * @returns {string} - Resmin tam URL'i veya bulunamazsa varsayılan bir resim.
 */
export function getStrapiMedia(media: StrapiMedia | null | undefined): string {
  // Eğer medya objesi veya url'i yoksa, varsayılan bir resim döndür
  if (!media?.url) {
    return "https://via.placeholder.com/150"; // Projenizin public klasöründe bir placeholder resmi olabilir
  }

  // Eğer URL zaten tam bir URL ise (http ile başlıyorsa), olduğu gibi döndür
  if (media.url.startsWith('http')) {
    return media.url;
  }

  // Eğer URL göreceli bir yol ise (/uploads/... gibi), başına STRAPI_URL'i ekle
  return `${STRAPI_URL}${media.url}`;
}