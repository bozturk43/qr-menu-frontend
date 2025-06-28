'use client';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantById, getOpenOrdersForRestaurant } from '@/app/lib/api';
import type { Restaurant, Order } from '@/app/types/strapi';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useState } from 'react';
import AdisyonDetayModal from '@/app/components/dashboard/dialog-modals/AdisyonDetayModal';

interface AdisyonClientPageProps {
    initialRestaurant: Restaurant;
    initialOpenOrders: Order[];
    jwt: string;
}

export default function AdisyonClientPage({ initialRestaurant, initialOpenOrders, jwt }: AdisyonClientPageProps) {
    const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);

    console.log(initialRestaurant);
    // TODO: Sayfa ilk yüklendiğinde gelen veriyi kullanmak için TanStack Query'yi
    // initialData ile beslemek en iyi pratiktir. Şimdilik yeniden fetch ediyoruz.

    // Bu sayfanın periyodik olarak kendini yenilemesini veya WebSocket ile güncellenmesini sağlayabiliriz.
    const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
        queryKey: ['restaurant', initialRestaurant.id],
        queryFn: () => getRestaurantById(initialRestaurant.id.toString(), jwt),
        initialData: initialRestaurant,
    });

    const { data: openOrders, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['openOrders', initialRestaurant.id],
        queryFn: () => getOpenOrdersForRestaurant(initialRestaurant.id.toString(), jwt),
        initialData: initialOpenOrders,
        refetchInterval: 15000, // Her 15 saniyede bir açık siparişleri kontrol et
    });

    console.log(openOrders);

    if (isLoadingRestaurant || isLoadingOrders) return <CircularProgress />;
    if(!restaurant) {
        return(
            <h1>Restoran Bulunamadı</h1>
        )
    }

    // Adisyonu olan masaların ID'lerini bir set'e atarak hızlı kontrol sağlıyoruz.
    const tablesWithOpenOrders = new Set(openOrders?.map(order => order.table?.id));
    const viewingOrder = viewingOrderId
        ? (openOrders?.find(order => order.id === viewingOrderId) ?? null)
        : null;
    return (
        <Box sx={{ p: 3, bgcolor: '#121212', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {restaurant?.name} - Adisyon Yönetimi
                </Typography>
                {/* TODO: Kasa raporu, gün sonu gibi butonlar buraya gelebilir */}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 3 }}>
                {restaurant?.tables?.map(table => {
                    const hasOpenOrder = tablesWithOpenOrders.has(table.id);
                    const orderForTable = openOrders?.find(order => order.table?.id === table.id);

                    return (
                        <Paper
                            key={table.id}
                            elevation={hasOpenOrder ? 12 : 3}
                            sx={{
                                p: 2,
                                aspectRatio: '1 / 1', // Kare görünüm
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                // Adisyonu olan masayı farklı bir renkle vurguluyoruz
                                bgcolor: hasOpenOrder ? 'secondary.main' : 'background.paper',
                                color: hasOpenOrder ? 'white' : 'text.primary',
                                border: hasOpenOrder ? '2px solid' : 'none',
                                borderColor: 'secondary.light',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                            // TODO: Tıklandığında o masanın adisyon detayını açan bir modal tetiklenecek
                            onClick={() => {
                                if (orderForTable) {
                                    setViewingOrderId(orderForTable.id);
                                }
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{table.name}</Typography>
                            {hasOpenOrder && (
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {orderForTable?.total_price?.toFixed(2)} TL
                                </Typography>
                            )}
                        </Paper>
                    )
                })}
            </Box>
            <AdisyonDetayModal
                order={viewingOrder}
                onClose={() => setViewingOrderId(null)}
                restaurant={restaurant}
            />
        </Box>
    );
}