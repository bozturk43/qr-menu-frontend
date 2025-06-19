// src/components/marketing/MarketingHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import Link from 'next/link';
import { Menu as MenuIcon } from '@mui/icons-material';

const navItems = [
    { name: 'Özellikler', href: '#features' },
    { name: 'Fiyatlandırma', href: '#pricing' },
    { name: 'Hakkımızda', href: '#about' },
];

export default function MarketingHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [headerBg, setHeaderBg] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const changeBackground = () => {
        if (window.scrollY >= 80) {
            setHeaderBg(true);
        } else {
            setHeaderBg(false);
        }
    };

    useEffect(() => {
        // İlk yüklendiğinde de durumu kontrol et
        changeBackground();
        window.addEventListener('scroll', changeBackground);
        return () => {
            window.removeEventListener('scroll', changeBackground);
        };
    }, []);

    const mobileDrawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>QR Menü</Typography>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton component="a" href={item.href} sx={{ textAlign: 'center' }}>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                component="nav"
                elevation={headerBg ? 4 : 0}
                sx={{
                    backgroundColor: headerBg ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                    backdropFilter: headerBg ? 'blur(8px)' : 'none',
                    transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    color: headerBg ? 'text.primary' : 'white',
                }}
            >
                <Toolbar sx={{ maxWidth: 'xl', width: '100%', mx: 'auto' }}>
                    {/* --- SOL GRUP (Logo ve Navigasyon Linkleri) --- */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Typography variant="h6" component="a" href="/" sx={{ fontWeight: 'bold', color: headerBg ? 'text.primary' : 'white', textDecoration: 'none' }}>
                            QRMenuApp
                        </Typography>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}> {/* Linkleri orta ekranlarda göstermeye başla */}
                            {navItems.map((item) => (
                                <Button key={item.name} component="a" href={item.href} sx={{ color: headerBg ? 'text.primary' : 'white' }}>
                                    {item.name}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {/* --- ARA PARÇA (Boşluğu Dolduran Sihirli Kutu) --- */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* --- SAĞ GRUP (Eylem Butonları) --- */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Button component={Link} href="/giris-yap" sx={{ mr: 1 }} variant="outlined">Giriş Yap</Button>
                        <Button component={Link} href="/kayit-ol" variant="contained" color="primary">Ücretsiz Başla</Button>
                    </Box>

                    {/* --- MOBİL GRUP (Hamburger Menü) --- */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end" // Sağa yaslamak için 'end' kullanıyoruz
                        onClick={handleDrawerToggle}
                        sx={{ display: { md: 'none' } }} // Sadece küçük ekranlarda göster
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}
                >
                    {mobileDrawer}
                </Drawer>
            </nav>
        </>
    );
}