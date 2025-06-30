// src/lib/api/user.api.ts

import type { User, Restaurant, UpdateProfileData, ChangePasswordData } from '@/app/types/strapi';

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

export async function updateUserProfile(
    userId: number | string,
    profileData: UpdateProfileData,
    jwt: string
): Promise<User> {
    const updateUrl = `${STRAPI_URL}/api/users/${userId}`;

    try {
        const res = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify(profileData), // Strapi burada 'data' sarmalayıcısı beklemez
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || 'Profil güncellenemedi.');
        }
        return data;
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        throw error;
    }
}
/**
 * Giriş yapmış kullanıcının şifresini değiştirir.
 */
export async function changePassword(
    passwordData: ChangePasswordData,
    jwt: string
): Promise<User> {
    const changePasswordUrl = `${STRAPI_URL}/api/auth/change-password`;

    try {
        const res = await fetch(changePasswordUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify(passwordData),
        });

        const data = await res.json();
        if (!res.ok) {
            // "Incorrect password" gibi hataları yakalamak için
            throw new Error(data.error?.message || 'Şifre değiştirilemedi.');
        }
        return data;
    } catch (error) {
        console.error("Error in changePassword:", error);
        throw error;
    }
}