// src/lib/api/restaurant.api.ts

import { RestaurantAttributes, StrapiCollection } from "@/app/types/strapi";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getRestaurantBySlug(slug: string): Promise<StrapiCollection<RestaurantAttributes> | null> {
    
    // Strapi v5 için gelişmiş populate nesnesi
    const populateQuery = {
        // Doğrudan bağlı alanlar
        logo: true,
        selected_theme: true,
        // İlişkili koleksiyonlar ve onların içindeki ilişkiler
        categories: {
            populate: {
                image: true,
                products: {
                    populate: {
                        images: true,
                        allergens: {
                            populate: ['icon']
                        }
                    }
                }
            }
        }
    };

    // qs.stringify ile bu nesneyi URL'e uygun hale getiriyoruz
    const queryString = qs.stringify({
        filters: {
            slug: {
                $eq: slug,
            },
        },
        populate: populateQuery,
    }, {
        encodeValuesOnly: true, // RFC 3986'ya uygun kodlama için
    });

    const apiUrl = `${STRAPI_URL}/api/restaurants?${queryString}`;

    try {
        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch restaurant: ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.data || data.data.length === 0) {
            return null;
        }
        
        // v5 ile veri artık istediğimiz gibi { id, attributes } formatında gelecek
        return data.data[0];

    } catch (error) {
        console.error('An error occurred in getRestaurantBySlug:', error);
        return null;
    }
}