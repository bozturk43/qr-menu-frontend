import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getRestaurantById, getOpenOrdersForRestaurant } from '@/app/lib/api';
import AdisyonClientPage from './AdisyonClientPage';

export default async function AdisyonPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const token = (await cookies()).get('jwt')?.value;
  if (!token) redirect('/giris-yap');

  const { restaurantId } = await params;

  // Hem restoranın genel bilgilerini (tüm masaları içerir)
  // hem de sadece açık olan siparişleri (adisyonları) iki ayrı istekle çekiyoruz.
  const [restaurant, openOrders] = await Promise.all([
    getRestaurantById(restaurantId, token),
    getOpenOrdersForRestaurant(restaurantId, token)
  ]);

  if (!restaurant) {
    return <div>Restoran bulunamadı.</div>;
  }

  // Veriyi, tüm interaktif mantığı yönetecek olan Client Component'e gönderiyoruz.
  return <AdisyonClientPage initialRestaurant={restaurant} initialOpenOrders={openOrders || []} jwt={token} />;
}