// app/(dashboard)/dashboard/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser, getRestaurantsByOwner } from '@/app/lib/api';
import DashboardClientPage from './DashboardClientPage';

export default async function DashboardPage() {

    const token = (await cookies()).get('jwt')?.value;
    if (!token) {
        redirect('/giris-yap');
    }
    const userData = await getAuthenticatedUser(token);
    if (!userData) redirect('/giris-yap');
    const restaurants = await getRestaurantsByOwner(userData.id, token);
    
    return <DashboardClientPage user={userData} restaurants={restaurants || []} />;
}