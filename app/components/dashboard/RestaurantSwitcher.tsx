'use client';

import { useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Box, Button, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { ChevronsUpDown, PlusCircle, Building } from 'lucide-react';
import type { Restaurant } from '@/app/types/strapi';

interface RestaurantSwitcherProps {
  restaurants: Restaurant[];
}

export default function RestaurantSwitcher({ restaurants }: RestaurantSwitcherProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // URL'den gelen restaurantId'yi alıyoruz (string olabilir)
  const activeRestaurantId = params.restaurantId as string;
  
  // Mevcut aktif restoranı buluyoruz.
  const activeRestaurant = restaurants?.find(r => r.id.toString() === activeRestaurantId);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // Sadece restoran varsa menüyü aç
    if (restaurants && restaurants.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectRestaurant = (newRestaurantId: number) => {
    handleClose();
    // Eğer hali hazırda bir restoranın detay sayfasındaysak (URL'de ID varsa),
    // URL'deki ID'yi yenisiyle değiştirerek yönlendir.
    if (activeRestaurantId) {
      const newPath = pathname.replace(activeRestaurantId, newRestaurantId.toString());
      router.push(newPath);
    } else {
      // Eğer ana dashboard (lobi) sayfasındaysak, direkt olarak yeni restoranın ana sayfasına git.
      router.push(`/dashboard/restaurants/${newRestaurantId}`);
    }
  };
  
  // DURUM 1: Kullanıcının hiç restoranı yok.
  if (!restaurants || restaurants.length === 0) {
    return (
        <Button variant="outlined" color="inherit" startIcon={<PlusCircle size={18}/>}>
            Öncelikle Restoran Ekleyin
        </Button>
    );
  }

  // DURUM 2 ve 3: Kullanıcının restoranları var.
  return (
    <Box>
      <Button
        id="restaurant-switcher-button"
        onClick={handleClick}
        variant="outlined"
        color="inherit"
        startIcon={<Building size={18}/>}
        disabled={!restaurants || restaurants.length === 0}
        endIcon={<ChevronsUpDown size={16} />}
        sx={{ textTransform: 'none', minWidth: '220px', justifyContent: 'space-between', textAlign: 'left' }}
      >
        {/* Eğer aktif bir restoran varsa adını, yoksa "Restoran Seç" yazısını göster */}
        {!restaurants || restaurants.length === 0 && "Öncelikle Restoran Ekleyin"}
        {activeRestaurant ? activeRestaurant.name : "Restoran Seçin"}
      </Button>
      <Menu
        id="restaurant-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'restaurant-switcher-button' }}
        PaperProps={{
          sx: {
            width: '220px',
          }
        }}
      >
        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary' }}>Restoranlarım</Typography>
        {restaurants.map(restaurant => (
          <MenuItem
            key={restaurant.id}
            selected={restaurant.id === activeRestaurant?.id}
            onClick={() => handleSelectRestaurant(restaurant.id)}
          >
            {restaurant.name}
          </MenuItem>
        ))}
        <MenuItem component="a" href="/dashboard" sx={{color: 'primary.main', mt: 1}}>
          <ListItemIcon>
            <PlusCircle size={16} />
          </ListItemIcon>
          Yeni Restoran Ekle
        </MenuItem>
      </Menu>
    </Box>
  );
}