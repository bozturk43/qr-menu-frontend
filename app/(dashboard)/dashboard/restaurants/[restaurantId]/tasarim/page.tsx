// app/(dashboard)/restaurants/[restaurantId]/tasarim/page.tsx
import { getRestaurantById } from '@/app/lib/api';
import { cookies } from 'next/headers';
import { Box } from '@mui/material';
import DesignSettingsForm from './DesignSettingsForm';

export default async function DesignPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const token = (await cookies()).get('jwt')?.value;
  if (!token) return null; 
  const {restaurantId} =await params;

  const restaurant = await getRestaurantById(restaurantId, token);
  if (!restaurant) return <div>Restoran bulunamadı.</div>;

  return (
    <Box>
      <DesignSettingsForm restaurant={restaurant} />
    </Box>
  );
}