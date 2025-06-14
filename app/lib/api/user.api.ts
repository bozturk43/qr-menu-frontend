// src/lib/api/user.api.ts

import { cookies } from 'next/headers';
import type { User, Restaurant } from '@/app/types/strapi';
import qs from 'qs';

// Strapi'den dönen user objesi, restoranları da içerecek şekilde genişletildi.
interface UserWithRestaurants extends User {
    restaurants: Restaurant[];
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getAuthenticatedUser(jwt: string): Promise<UserWithRestaurants | null> {
    if (!jwt) return null;

    // populate sorgusunu buradan tamamen kaldırıyoruz.
    const requestUrl = `${STRAPI_URL}/api/users/me`;

    try {
        const res = await fetch(requestUrl, {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error("Failed to fetch user:", res.status, res.statusText);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Error in getAuthenticatedUser:", error);
        return null;
    }
}