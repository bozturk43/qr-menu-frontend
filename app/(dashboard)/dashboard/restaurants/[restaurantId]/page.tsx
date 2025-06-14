"use client"
// app/(dashboard)/restaurants/[restaurantId]/page.tsx
import { redirect, useParams } from 'next/navigation';
import { getRestaurantById } from '@/app/lib/api';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie'; // js-cookie kütüphanesini import ediyoruz


// Bu sayfa bir Sunucu Bileşenidir
export default function SingleRestaurantPage() {
    const params = useParams();
    const queryClient = useQueryClient(); // QueryClient'a erişim için
    const restaurantId = params.restaurantId as string;

    const { data: restaurant, isLoading, error } = useQuery({
        queryKey: ['restaurant', restaurantId], // Bu anahtar bu veriyi eşsiz kılar
        queryFn: () => {
            const token = Cookies.get('jwt'); // Cookie'den token'ı alıyoruz
            if (!token) throw new Error('Not authenticated');
            return getRestaurantById(restaurantId, token);
        },
        enabled: !!restaurantId, // restaurantId varsa sorguyu çalıştır
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error.message}</Alert>;
    }
    if (!restaurant) {
        return <Typography sx={{ mt: 2 }}>Restoran bulunamadı.</Typography>;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                {restaurant.name} - Genel Bakış
            </Typography>
            <Typography sx={{ mt: 2 }}>
                Bu alanda restorana ait genel istatistikler ve hızlı işlemler yer alacak.
            </Typography>
            <Typography>Toplam Kategori Sayısı: {restaurant.categories?.length || 0}</Typography>
        </Box>
    );
}