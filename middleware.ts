// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

async function checkUserSubscription(token: string) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me?populate[restaurants][fields][0]=plan&populate[restaurants][fields][1]=subscription_status`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loginUrl = new URL('/giris-yap', request.url);
  const token = request.cookies.get('jwt')?.value;

  // Eğer zaten giriş veya kayıt sayfasındaysa, bir şey yapma
  if (pathname.startsWith('/giris-yap') || pathname.startsWith('/kayit-ol')) {
    return NextResponse.next();
  }
  
  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Token'ı doğrula
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    // Eğer dashboard veya alt sayfalarına gitmeye çalışıyorsa...
    if (pathname.startsWith('/dashboard')) {
        // ...abonelik durumunu kontrol et
        const user = await checkUserSubscription(token);
        const restaurants = user?.restaurants || [];

        const hasRestaurants = restaurants.length > 0;
        const hasManageableRestaurant = hasRestaurants && restaurants.some(
            (r: any) => r.plan === 'free' || r.subscription_status === 'active'
        );

        // Eğer restoranları var ama yönetilebilir olanı yoksa VE zaten yenileme sayfasında değilse...
        if (hasRestaurants && !hasManageableRestaurant && !pathname.startsWith('/dashboard/abonelik/yenile')) {
            return NextResponse.redirect(new URL('/dashboard/abonelik/yenile', request.url));
        }
    }

    // Token geçerliyse ve yönlendirme gerekmiyorsa, devam et
    return NextResponse.next();

  } catch (error) {
    loginUrl.searchParams.set('redirected', 'true');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('jwt', '', { maxAge: 0 }); 
    return response;
  }
}

export const config = {
  // Middleware'i, marketing sayfaları hariç, panel ve menü gibi alanlarda çalıştır
  matcher: ['/dashboard/:path*', '/dashboard/abonelik/:path*','/print/:path*'],
};