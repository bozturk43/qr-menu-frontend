// src/lib/api/landing-page.api.ts

// TODO: Landing Page ve component'leri için tipleri strapi.ts'e ekle
import qs from 'qs';


const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getLandingPageData(): Promise<any> {
    const populateQuery = {
        hero_image: true,
        features: {
            populate: ['icon'], // Feature component'lerinin içindeki icon'ları da getir
        },
        testimonials: {
            populate: ['author_photo'], // Testimonial component'lerinin içindeki fotoğrafları da getir
        }
    };
    // Bu sorgu objesini URL'e uygun bir string'e çeviriyoruz
    const queryString = qs.stringify({ populate: populateQuery }, {
        encodeValuesOnly: true,
    });

    const requestUrl = `${STRAPI_URL}/api/landing-page?${queryString}`;

    try {
        const res = await fetch(requestUrl, {
            next: { revalidate: 3600 } // 1 saat
        });

        if (!res.ok) throw new Error("Landing page verisi getirilemedi.");

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching landing page data:", error);
        return null;
    }
}