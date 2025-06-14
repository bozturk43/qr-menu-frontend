// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Home, User, DollarSign, HelpCircle } from 'lucide-react';

// Menü artık global linkleri içeriyor
const menuItems = [
  { name: 'Tüm Restoranlar', href: '/dashboard', icon: <Home size={20} /> },
  { name: 'Hesap Ayarları', href: '/dashboard/hesap', icon: <User size={20} /> },
  { name: 'Abonelik & Faturalar', href: '/dashboard/abonelik', icon: <DollarSign size={20} /> },
  { name: 'Yardım Merkezi', href: '/dashboard/yardim', icon: <HelpCircle size={20} /> },
];
export const drawerWidth = 260; // Kenar çubuğu genişliğini bir sabit olarak tanımlıyoruz

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <Drawer
            variant="permanent" // Her zaman görünür ve sabit
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    // Temamızdaki ana rengi (Gece Mavisi) arka plan olarak kullanıyoruz
                    backgroundColor: 'primary.main',
                    color: 'common.white',
                },
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', my: 2 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    QR Menü Paneli
                </Typography>
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={item.href}
                            selected={pathname === item.href}
                            sx={{ /* ... önceki stil kodları aynı kalabilir ... */ }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}