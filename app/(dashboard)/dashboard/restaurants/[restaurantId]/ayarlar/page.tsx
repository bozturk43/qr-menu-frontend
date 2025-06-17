// app/(dashboard)/restaurants/[restaurantId]/ayarlar/page.tsx
import { getRestaurantById } from '@/app/lib/api';
import { cookies } from 'next/headers';
import { Box } from '@mui/material';
import RestaurantSettingsForm from './RestaurantSettingsForm';

export default async function RestaurantSettingsPage({ params }: { params: Promise<{ restaurantId: string }>}) {
  const {restaurantId} = await params;
  const token = ( await cookies()).get('jwt')?.value;
  if (!token) return null; // Veya yönlendirme

  const restaurant = await getRestaurantById(restaurantId, token);
  if (!restaurant) return <div>Restoran bulunamadı.</div>;

  return (
    <Box sx={{ maxWidth: 'md' }}>
      <RestaurantSettingsForm restaurant={restaurant} />
    </Box>
  );
}