// app/(dashboard)/restaurants/[restaurantId]/layout.tsx
'use client'

import RestaurantTabs from '@/app/components/dashboard/RestaurantTabs';
import { Box } from '@mui/material';

export default function RestaurantDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <Box>
            {/* Tüm sekme mantığı artık bu bileşenin içinde */}
            <RestaurantTabs />
            <Box sx={{ py: 4 }}>
                {children}
            </Box>
        </Box>
    );
}