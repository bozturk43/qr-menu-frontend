// src/components/Header.tsx
import { AppBar, Toolbar, Box, IconButton, Avatar, Typography } from '@mui/material';
import { Bell, Settings } from 'lucide-react';
import { Restaurant, StrapiAuthResponse, User } from '@/app/types/strapi';
import { drawerWidth } from './Sidebar'; // Sidebar'dan genişliği import ediyoruz
import RestaurantSwitcher from './RestaurantSwitcher';

interface HeaderProps {
    user: User;
    restaurants: Restaurant[];
}

export default function Header({ user, restaurants }: HeaderProps) {
    const userInitial = user.username.charAt(0).toUpperCase();

    return (
        <AppBar
            position="fixed"
            // AppBar'ın Sidebar'ın sağında başlamasını ve onun genişliğini hesaba katmasını sağlıyoruz
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: `${drawerWidth}px`,
                backgroundColor: "primary.main",
                backdropFilter: 'blur(8px)', // Arka planı bulanıklaştırma efekti
                boxShadow: 'none',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <Toolbar>
                <Box sx={{ flexGrow: 1,gap: 4 }} /> {/* Sağdaki elemanları en sağa iter */}
                <RestaurantSwitcher restaurants={restaurants} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton color="inherit">
                        <Bell size={22} />
                    </IconButton>
                    <IconButton color="inherit">
                        <Settings size={22} />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '1rem' }}>
                            {userInitial}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {user.username}
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}