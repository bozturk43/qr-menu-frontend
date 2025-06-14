// app/(dashboard)/dashboard/page.tsx

import { Box, Typography, Button, Card, CardActionArea, CardContent } from '@mui/material';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Add } from '@mui/icons-material';
import { getAuthenticatedUser, getRestaurantsByOwner } from '@/app/lib/api';

export default async function DashboardPage() {

    const token = (await cookies()).get('jwt')?.value;
    if (!token) {
        redirect('/giris-yap');
    }
    const userData = await getAuthenticatedUser(token);
    if (!userData) redirect('/giris-yap');
    const  restaurants  = await getRestaurantsByOwner(userData.id,token);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
                    Restoranlarınız
                </Typography>
                <Button
                    component={Link}
                    href="/dashboard/restaurants/new" // Yeni restoran oluşturma sayfası
                    variant="contained"
                    color="secondary"
                    startIcon={<Add />}
                >
                    Yeni Restoran Ekle
                </Button>
            </Box>

            {restaurants && restaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant: any) => (
                        <Card key={restaurant.id}>
                            <CardActionArea component={Link} href={`/dashboard/restaurants/${restaurant.id}`}>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {restaurant.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {restaurant.slug}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </div>
            ) : (
                <Typography>Henüz bir restoran oluşturmadınız.</Typography>
            )}
        </Box>
    );
}