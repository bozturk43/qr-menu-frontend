// app/(dashboard)/abonelik/yenile/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser, getRestaurantById, getRestaurantsByOwner } from '@/app/lib/api';
import type { Restaurant } from '@/app/types/strapi';
import RenewSubscriptionClientPage from './RenewSubscriptionClientPage'; // Yeni istemci bileşenimiz

export default async function RenewSubscriptionPage({
  params
}: {
  params: Promise<{ restaurantId?: string }>
}) {
  const token = (await cookies()).get('jwt')?.value;
  if (!token) redirect('/giris-yap');

  const {restaurantId} = await params;

  let headerText = "Aboneliklerinizin Süresi Doldu";
  let descriptionText = "Yönetim paneline erişmeye devam edebilmek için lütfen en az bir restoranınızın aboneliğini yenileyin.";
  let restaurantsToList: Restaurant[] = [];

  if (restaurantId) {
    const restaurant = await getRestaurantById(restaurantId, token);
    if (restaurant) {
      headerText = `"${restaurant.name}" Aboneliği Sona Erdi`;
      descriptionText = "Bu restoranı tekrar yönetebilmek için lütfen aboneliğinizi yenileyin.";
      restaurantsToList.push(restaurant);
    }
  } else {
    const user = await getAuthenticatedUser(token);
    const restaurants = user && await getRestaurantsByOwner(user?.id,token);
    if(restaurants) {
        // Burada pasif olanları filtreleyerek gösterebiliriz.
        restaurantsToList = restaurants.filter(r => r.subscription_status === 'inactive');
    }
  }

  // Çektiğimiz ve hazırladığımız tüm veriyi Client Component'e prop olarak gönderiyoruz.
  return (
    <RenewSubscriptionClientPage
      headerText={headerText}
      descriptionText={descriptionText}
      restaurantsToList={restaurantsToList}
    />
  );
}