// src/lib/api/auth.api.ts

import type { UserLoginInfo,UserRegistrationInfo, StrapiAuthResponse } from "@/app/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Yeni bir kullanıcıyı Strapi'ye kaydeder.
 * @param userInfo - Kaydolacak kullanıcının bilgileri (username, email, password).
 * @returns {Promise<StrapiAuthResponse>} - Başarılı olursa JWT ve kullanıcı bilgilerini döndürür.
 */
export async function registerUser(userInfo: UserRegistrationInfo): Promise<StrapiAuthResponse> {
  const registerUrl = `${STRAPI_URL}/api/auth/local/register`;

  try {
    const res = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo),
    });

    const data = await res.json();

    // Eğer HTTP status kodu başarılı değilse (örn: 400 Bad Request)
    if (!res.ok) {
      // Strapi'nin detaylı hata mesajını alıp fırlatıyoruz.
      // Bu sayede "Email zaten alınmış" gibi hataları frontend'de gösterebiliriz.
      const errorMessage = data.error?.message || 'Bir hata oluştu.';
      throw new Error(errorMessage);
    }
    
    // Başarılı olursa, Strapi'den gelen JWT ve kullanıcı verisini döndür.
    return data;

  } catch (error) {
    console.error('Kullanıcı kaydı sırasında hata:', error);
    // Hatanın mesajını yukarıya fırlatarak useMutation'ın yakalamasını sağlıyoruz.
    throw error;
  }
}

/**
 * Mevcut bir kullanıcıyı Strapi'ye giriş yaptırır.
 * @param userInfo - Giriş yapacak kullanıcının bilgileri (identifier, password).
 * @returns {Promise<StrapiAuthResponse>} - Başarılı olursa JWT ve kullanıcı bilgilerini döndürür.
 */
export async function loginUser(userInfo: UserLoginInfo): Promise<StrapiAuthResponse> {
  const loginUrl = `${STRAPI_URL}/api/auth/local`;

  try {
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.error?.message || 'Giriş bilgileri hatalı.';
      // Strapi, "Invalid identifier or password" gibi bir mesaj dönecektir.
      throw new Error(errorMessage);
    }
    
    return data;

  } catch (error) {
    console.error('Kullanıcı girişi sırasında hata:', error);
    throw error;
  }
}
/**
 * Verilen JWT'ye ait kullanıcı bilgilerini Strapi'den getirir.
 * @param jwt - Kullanıcının doğrulama token'ı.
 * @returns {Promise<StrapiAuthResponse['user']>} - Kullanıcı objesini döndürür.
 */
export async function getMe(jwt: string): Promise<StrapiAuthResponse['user']> {
  const meUrl = `${STRAPI_URL}/api/users/me`;

  try {
    const res = await fetch(meUrl, {
      headers: {
        // Strapi'ye kim olduğumuzu kanıtlamak için token'ı gönderiyoruz.
        Authorization: `Bearer ${jwt}`,
      },
      // cache: 'no-store' -> Bu, Next.js'in bu isteği önbelleğe almasını engeller,
      // böylece her zaman en güncel kullanıcı verisini alırız.
      cache: 'no-store', 
    });

    if (!res.ok) {
      throw new Error('Kullanıcı bilgileri alınamadı.');
    }

    return await res.json();
    
  } catch (error) {
    console.error('getMe fonksiyonunda hata:', error);
    throw error;
  }
}