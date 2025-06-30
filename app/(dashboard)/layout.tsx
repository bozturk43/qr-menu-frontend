// app/(dashboard)/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser, getRestaurantsByOwner } from '@/app/lib/api';
import Header from '@/app/components/dashboard/Header';
import Sidebar from '@/app/components/dashboard/Sidebar';
import { Box, Toolbar } from '@mui/material'; // Box ve Toolbar'ı import ediyoruz

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = (await cookies()).get('jwt')?.value;

    // Eğer token yoksa, daha ileri gitmeden yönlendir
    if (!token) {
        redirect('/giris-yap');
    }

    // 2. Aldığın token'ı API fonksiyonuna parametre olarak gönder
    const userData = await getAuthenticatedUser(token);

    if (!userData) {
        // Token geçersizse veya bir hata oluştuysa cookie'yi sil ve yönlendir
        (await cookies()).set('jwt', '', { maxAge: -1 });
        redirect('/giris-yap');
    }
    // Eğer kullanıcı bulunamazsa (token yok veya geçersiz), giriş sayfasına yönlendir.
    if (!userData) {
        redirect('/giris-yap');
    }
    const { ...user } = userData;
     const restaurants = await getRestaurantsByOwner(user.id,token);

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default' }} // Temadan arka plan rengi
            >
                {/* Header'ın içeriğiyle çakışmaması için boş bir Toolbar ekliyoruz */}
                <Toolbar />
                <Header user={user} restaurants={restaurants} />
                {children}
            </Box>
        </Box>
    );
}