// src/components/Header.tsx
"use client"
import { AppBar, Toolbar, Box, IconButton, Avatar, Typography, Tooltip, Button, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { Bell, LogOut, Settings, UserIcon } from 'lucide-react';
import { Restaurant, User } from '@/app/types/strapi';
import { drawerWidth } from './Sidebar'; // Sidebar'dan genişliği import ediyoruz
import RestaurantSwitcher from './RestaurantSwitcher';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';


interface HeaderProps {
    user: User;
    restaurants: Restaurant[];
}

export default function Header({ user, restaurants }: HeaderProps) {
    const userInitial = user.username.charAt(0).toUpperCase();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const router = useRouter();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        Cookies.remove('jwt');
        handleMenuClose();
        router.push('/giris-yap');
    };
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
                <RestaurantSwitcher restaurants={restaurants} />

                <Box sx={{ flexGrow: 1 }} /> {/* Sağdaki elemanları en sağa iter */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton color="inherit">
                        <Bell size={22} />
                    </IconButton>

                    {/* KULLANICI AVATARI VE İSMİ ARTIK TIKLANABİLİR BİR BUTON */}
                    <Tooltip title="Hesap Ayarları">
                        <Button
                            onClick={handleMenuOpen}
                            sx={{
                                p: '4px',
                                borderRadius: '999px', // Yuvarlak kenarlar
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.875rem', mr: 1 }}>
                                {userInitial}
                            </Avatar>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {user.username}
                            </Typography>
                        </Button>
                    </Tooltip>

                    {/* AÇILIR MENÜ BİLEŞENİ */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                        // Menünün konumunu ayarlamak için
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon>
                                <UserIcon size={16} />
                            </ListItemIcon>
                            Profilim
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon>
                                <Settings size={16} />
                            </ListItemIcon>
                            Hesap Ayarları
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <LogOut size={16} color="red" />
                            </ListItemIcon>
                            Çıkış Yap
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}