// app/lib/api/stock-image.api.ts
import qs from 'qs';
import type { StrapiMedia } from '@/app/types/strapi'; // StrapiMedia tipini import ediyoruz

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Stok görselleri, etiketlere göre arayarak getirir.
 * Doğrudan kullanılabilir StrapiMedia objeleri dizisi döndürür.
 */
export async function getStockImages(searchTerm: string = ''): Promise<StrapiMedia[]> {
  const query = qs.stringify({
    populate: ['image'],
    filters: {
      tags: {
        $containsi: searchTerm,
      },
    },
  });

  const url = `${STRAPI_URL}/api/stock-images?${query}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Stok görseller getirilemedi.');
    const responseData = await res.json();
    
    // DEĞİŞİKLİK BURADA:
    // Gelen ham veriyi (StockImage[] dizisi) işliyoruz.
    const mediaFiles = responseData.data
      ?.map((stockImage: any) => stockImage.image) // Her birinin içindeki 'image' objesini al
      .filter(Boolean); // Eğer bir stockImage'in resmi yoksa (null/undefined), onu listeden çıkar
    
    return mediaFiles || [];
  } catch (error) {
    console.error("Error fetching stock images:", error);
    return [];
  }
}