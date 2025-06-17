// app/(dashboard)/hesap/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/app/lib/api';
import AccountSettingsClientPage from './AccountSettingsClientPage';

export default async function AccountSettingsPage() {
  const token = (await cookies()).get('jwt')?.value;
  if (!token) redirect('/giris-yap');

  // Sunucu tarafında kullanıcı verisini alıyoruz
  const user = await getAuthenticatedUser(token);
  if (!user) redirect('/giris-yap');

  // Veriyi çekip Client Component'e prop olarak gönderiyoruz
  return(
    <AccountSettingsClientPage user={user}/>
  ) 
}