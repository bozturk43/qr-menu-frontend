// app/(dashboard)/restaurants/[restaurantId]/qr-codes/print/page.tsx
import { cookies } from 'next/headers';
import { getRestaurantById } from '@/app/lib/api';
import { notFound, redirect } from 'next/navigation';
import PrintableQrCodesClient from './PrintableQrCodesClient';

// Bu bir Sunucu Bileşenidir, veriyi sunucuda çeker
export default async function PrintQrCodesPage({
  params,
}: {
  params: Promise <{ restaurantId: string }>;
}) {
  const token = (await cookies()).get('jwt')?.value;
  const {restaurantId}= await params;
  if (!token) redirect('/giris-yap');

  const restaurant = await getRestaurantById(restaurantId, token);
  if (!restaurant) notFound();

  // Veriyi, interaktif kısmı yönetecek olan İstemci Bileşenine gönderiyoruz
  return <PrintableQrCodesClient restaurant={restaurant} />;
}