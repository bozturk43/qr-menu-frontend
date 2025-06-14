// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // jose kütüphanesinden doğrulama fonksiyonu

const JWT_SECRET = process.env.JWT_SECRET!; // .env.local'den gizli anahtarı alıyoruz

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;
  const loginUrl = new URL('/giris-yap', request.url);

  // Eğer token yoksa, direkt giriş sayfasına yönlendir.
  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  // Token var, şimdi geçerliliğini kontrol edelim.
  try {
    // Token'ı ve gizli anahtarı kullanarak doğrulamayı dene.
    // 'jose' kütüphanesi, süresi dolmuş veya imzası geçersiz token'lar için hata fırlatır.
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    // Eğer buraya kadar geldiyse, token geçerlidir. İsteğin devam etmesine izin ver.
    return NextResponse.next();

  } catch (error:any) {
    // Eğer jwtVerify hata fırlatırsa (süre doldu, imza yanlış vb.),
    // bu, token'ın geçersiz olduğu anlamına gelir.
    console.log('Geçersiz Token:', error.message);
    
    // Kullanıcıyı giriş sayfasına yönlendir ve eski, geçersiz cookie'yi sil.
    loginUrl.searchParams.set('redirected', 'true'); // İsteğe bağlı: Neden yönlendirildiğini belirtmek için
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('jwt', '', { maxAge: 0 }); // Cookie'yi temizle
    
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};