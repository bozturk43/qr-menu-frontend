'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Typography, Button, Card, CardActionArea, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip, IconButton, Avatar } from '@mui/material'; // Chip'i import ediyoruz
import { Add, StarBorder as UpgradeIcon } from '@mui/icons-material';
import { Restaurant, User } from '@/app/types/strapi';
import AddRestaurantModal from '@/app/components/dashboard/dialog-modals/AddRestauranModal';
import { getStrapiMedia } from '@/app/lib/utils';

interface DashboardClientPageProps {
    restaurants: Restaurant[];
    user: User;
}

export default function DashboardClientPage({ restaurants, user }: DashboardClientPageProps) {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isUpgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

    const handleUpgradeClick = (restaurant: Restaurant) => {
        // Mevcut bir restoranı yükseltmek için de aynı uyarıyı gösterebiliriz
        // İleride bu, direkt o restorana özel bir ödeme sayfasına yönlendirebilir
        setUpgradeDialogOpen(true);
        console.log(`${restaurant.name} için yükseltme işlemi başlatıldı.`);
    };


    const handleAddNewRestaurantClick = () => {
        // Kullanıcının ücretsiz restoran hakkı var mı?
        // (Henüz hiç restoranı yoksa veya olanların hepsi premium ise)
        const hasFreeSlot = restaurants.every(r => r.plan === 'pro');
        if (hasFreeSlot) {
            setAddModalOpen(true);
        } else {
            setUpgradeDialogOpen(true);
        }
    };
    const handleProceedToPayment = () => {
        // TODO: Bu kısım ileride Stripe ödeme sayfasına yönlendirecek.
        // Şimdilik, sadece premium plan ile restoran oluşturma modal'ını açabiliriz.
        setUpgradeDialogOpen(false);
        // Veya direkt bir ödeme/abonelik sayfasına yönlendirebiliriz.
        alert("Ödeme entegrasyonu yapılacak.");
        // router.push('/dashboard/abonelik');
    };


    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
                    Restoranlarınız
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Add />}
                    onClick={handleAddNewRestaurantClick}
                >
                    Yeni Restoran Ekle
                </Button>
            </Box>

            {restaurants && restaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => {
                        const isFree = restaurant.plan === 'free';
                        const isPremiumActive = (restaurant.plan === 'pro' || restaurant.plan === 'bussiness') && restaurant.subscription_status === 'active';
                        const isManageable = isFree || isPremiumActive;

                        const href = isManageable ? `/dashboard/restaurants/${restaurant.id}` : `/dashboard/abonelik/yenile?restaurant_id=${restaurant.id}`;

                        const chipLabel = isFree ? 'Free' : (isPremiumActive ? restaurant.plan : 'Süresi Doldu');
                        const chipColor: "primary" | "success" | "default" = isFree ? 'primary' : (isPremiumActive ? 'success' : 'default');

                        return (
                            // Karta position: 'relative' ekliyoruz ki Chip'i ona göre konumlandıralım
                            <Card key={restaurant.id} sx={{ position: 'relative', display: 'flex', flexDirection: 'column',opacity:isManageable ? 1 : 0.7 }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label={chipLabel}
                                            color={chipColor}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                        {restaurant.plan === 'free' && (
                                            <Tooltip title="Premium'a Yükselt">
                                                <IconButton size="small" onClick={() => handleUpgradeClick(restaurant)} sx={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                                                    <UpgradeIcon fontSize="small" color="secondary" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <Avatar
                                            variant="rounded"
                                            src={restaurant.logo ? getStrapiMedia(restaurant.logo) : undefined}
                                            sx={{ width: 48, height: 48, bgcolor: restaurant.logo ? 'white' : 'primary.main' }}
                                        >
                                            {/* Eğer logo yoksa, baş harfi gösterir */}
                                            {restaurant.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {restaurant.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                /{restaurant.slug}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>

                                <CardActionArea
                                    component={Link}
                                    href={href}
                                >
                                    <Button variant="contained" fullWidth color='secondary' sx={{ fontWeight: 'bold', borderRadius: "0" }}>Yönet</Button>
                                </CardActionArea>
                            </Card>
                        )
                    }


                    )}
                </div>
            ) : (
                <Typography>Henüz bir restoran oluşturmadınız. Başlamak için butona tıklayın.</Typography>
            )}

            <AddRestaurantModal open={isAddModalOpen} onClose={() => setAddModalOpen(false)} user={user} />
            <Dialog
                open={isUpgradeDialogOpen}
                onClose={() => setUpgradeDialogOpen(false)}
            >
                <DialogTitle>Premium Plana Geçin</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ücretsiz restoran oluşturma limitinize ulaştınız.
                        Yeni bir restoran eklemek için Premium Plana geçiş yapmanız gerekmektedir.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpgradeDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleProceedToPayment} variant="contained">
                        Premium Ol
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}