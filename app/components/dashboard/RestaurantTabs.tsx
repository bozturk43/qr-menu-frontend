'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { getRestaurantById } from '@/app/lib/api';
import { Tabs, Tab, Box, Paper, Chip } from '@mui/material'; // Chip'i import ediyoruz
import Link from 'next/link';

export default function RestaurantTabs() {
    const params = useParams();
    const pathname = usePathname();
    const restaurantId = params.restaurantId as string;

    const { data: restaurant } = useQuery({
        queryKey: ['restaurant', restaurantId],
        queryFn: () => getRestaurantById(restaurantId, Cookies.get('jwt')!),
        enabled: !!restaurantId,
    });

    const allTabs = [
        { name: "Genel Bakış", href: `/dashboard/restaurants/${restaurantId}`, requiredPlans: ['free', 'pro', 'business'] },
        { name: "Kategoriler", href: `/dashboard/restaurants/${restaurantId}/kategoriler`, requiredPlans: ['free', 'pro', 'business'] },
        { name: "Ürünler", href: `/dashboard/restaurants/${restaurantId}/urunler`, requiredPlans: ['free', 'pro', 'business'] },
        { name: "Tasarım & Özelleştirme", href: `/dashboard/restaurants/${restaurantId}/tasarim`, requiredPlans: ['pro', 'business'] },
        { name: "Masalar", href: `/dashboard/restaurants/${restaurantId}/masalar`, requiredPlans: ['business'] },
        { name: "Adisyon Yönetimi", href: `/adisyonlar/${restaurantId}`, requiredPlans: ['business'] },
        { name: "Restoran Ayarları", href: `/dashboard/restaurants/${restaurantId}/ayarlar`, requiredPlans: ['free', 'pro', 'business'] },
    ];

    // Aktif olan sekmeyi bulmak için
    const activeTab = allTabs.find(tab => pathname === tab.href)?.href || false;

    const userPlan = restaurant?.plan || 'free';

    return (
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                value={activeTab}
                indicatorColor="secondary"
                textColor="secondary"
                variant="scrollable" // Mobil'de sekmelerin kaydırılabilmesini sağlar
                scrollButtons="auto" // Gerekirse oklar çıkar
                allowScrollButtonsMobile
            >
                {allTabs.map((tab) => {
                    const isLocked = !tab.requiredPlans.includes(userPlan);

                    let chipLabel = null;
                    if (isLocked) {
                        if (tab.requiredPlans.includes('pro')) {
                            chipLabel = 'Pro';
                        }
                        else if (tab.requiredPlans.includes('business')) {
                            chipLabel = 'Business';
                        }
                    }

                    return (
                        <Tab
                            key={tab.href}
                            // Sekmenin etiketini, adını ve (varsa) kilitli plan çipini içerecek şekilde güncelliyoruz
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {tab.name}
                                    {isLocked && chipLabel && <Chip label={chipLabel} color="secondary" size="small" variant="outlined" />}
                                </Box>
                            }
                            value={tab.href}
                            component={Link}
                            // Eğer kilitliyse, abonelik sayfasına yönlendir, değilse kendi sayfasına gitsin
                            href={isLocked ? '/dashboard/abonelik/yenile' : tab.href}
                            // Kilitliyse, stilini biraz soluklaştır
                            sx={{
                                opacity: isLocked ? 0.6 : 1,
                            }}
                        />
                    );
                })}
            </Tabs>
        </Paper>
    );
}