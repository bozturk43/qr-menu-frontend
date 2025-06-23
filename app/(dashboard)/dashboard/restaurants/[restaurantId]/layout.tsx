// app/(dashboard)/restaurants/[restaurantId]/layout.tsx
'use client'

import { Paper, Tabs, Tab, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

export default function RestaurantDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const params = useParams();
    const { restaurantId } = params;

    const tabs = [
        { label: "Genel Bakış", href: `/dashboard/restaurants/${restaurantId}` },
        { label: "Ürünler", href: `/dashboard/restaurants/${restaurantId}/urunler` },
        { label: "Kategoriler", href: `/dashboard/restaurants/${restaurantId}/kategoriler` },
        { label: "Masalar", href: `/dashboard/restaurants/${restaurantId}/masalar` },
        { label: "Restoran Ayarları", href: `/dashboard/restaurants/${restaurantId}/ayarlar` },
    ];

    // Aktif tab'ı bulmak için
    const activeTabIndex = tabs.findIndex(tab => tab.href === pathname);

    return (
        <div>
            <Paper elevation={2}>
                <Tabs value={activeTabIndex === -1 ? 0 : activeTabIndex} aria-label="restoran yönetim sekmeleri">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.href}
                            label={tab.label}
                            component={Link}
                            href={tab.href}
                        />
                    ))}
                </Tabs>
            </Paper>
            <Box sx={{ mt: 4 }}>
                {children} {/* Bu layout'un altındaki sayfa içeriği burada gösterilecek */}
            </Box>
        </div>
    );
}