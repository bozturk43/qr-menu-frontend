// app/lib/api/media.api.ts
import type { StrapiMedia } from "@/app/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Sadece o an giriş yapmış olan kullanıcıya ait medya dosyalarını getirir.
 */
export async function getMyMediaFiles(jwt: string): Promise<StrapiMedia[]> {
  const url = `${STRAPI_URL}/api/user-assets/my-files`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store', // Her zaman en güncel listeyi al
    });
    if (!res.ok) throw new Error('Medya dosyaları getirilemedi.');
    return await res.json();
  } catch (error) {
    console.error("Error fetching 'my media' files:", error);
    return [];
  }
}