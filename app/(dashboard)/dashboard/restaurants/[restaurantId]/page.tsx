// app/(dashboard)/restaurants/[restaurantId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { getRestaurantById } from '@/app/lib/api';

// Bileşenleri ve ikonları import ediyoruz
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import StatCard from '@/app/components/dashboard/StatCard';
import { LayoutGrid, ShoppingBasket } from 'lucide-react';
import { useEffect, useState } from 'react';
import QrCodeCard from '@/app/components/dashboard/QRCodeCard';

export default function SingleRestaurantPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [menuUrl, setMenuUrl] = useState('');


  const { data: restaurant, isLoading, isError, error } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => getRestaurantById(restaurantId, Cookies.get('jwt')!),
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (restaurant) {
      // window.location.origin -> "http://localhost:3000" veya "https://www.siteadi.com"
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setMenuUrl(`${origin}/menu/${restaurant.slug}`);
    }
  }, [restaurant]);

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">{(error as Error).message}</Alert>;
  if (!restaurant) return <Typography sx={{ mt: 2 }}>Restoran bulunamadı.</Typography>;

  // Kategori ve Ürün sayılarını hesaplayalım
  const categoryCount = restaurant.categories?.length || 0;
  const productCount = restaurant.categories?.reduce(
    (total, category) => total + (category.products?.length || 0), 0
  ) || 0;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {restaurant.name} - Genel Bakış
        </Typography>
        <Typography color="text.secondary">
          Restoranınızın genel durumunu buradan takip edebilirsiniz.
        </Typography>
      </Box>

      {/* YENİ KART YERLEŞİMİ (FLEXBOX İLE) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Küçük ekranda alt alta, büyükte yan yana
          gap: 3, // Kartlar arası boşluk
        }}
      >
        <StatCard
          title="Toplam Kategori"
          value={categoryCount}
          icon={<LayoutGrid />}
          color="primary.main"
        />
        <StatCard
          title="Toplam Ürün"
          value={productCount}
          icon={<ShoppingBasket />}
          color="secondary.main"
        />
      </Box>
      <Box sx={{ flex: 1, maxWidth: { xs: '100%', lg: '320px' } }}>
        <QrCodeCard url={menuUrl} slug={restaurant.slug} />
      </Box>

      {/* GELECEK İÇİN YER */}
      <Box mt={6}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Detaylı İstatistikler
        </Typography>
        <Paper variant="outlined" sx={{ p: 8, textAlign: 'center', color: 'text.secondary' }}>
          {restaurant.plan === 'pro' || restaurant.plan === 'bussiness'
            ? 'Premium İstatistik Grafikleri Yakında Burada!'
            : 'Detaylı istatistikler için Premium Plana geçin.'
          }
        </Paper>
      </Box>
    </Box>
  );
}