// app/components/menu/CartDrawer.tsx
'use client';

import { useSnackbar } from '@/app/context/SnackBarContext';
import { submitOrder } from '@/app/lib/api/order.api';
import { useCartStore } from '@/app/stores/cartStore';
import { Box, Drawer, Typography, List, ListItem, ListItemText, IconButton, Button, Divider } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { Plus, Minus, X } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';


interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
    // Zustand store'undan sepetin içeriğini ve fonksiyonları alıyoruz
    const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
    const params = useParams(); // useParams, path'i alır
    const searchParams = useSearchParams(); // useSearchParams, query'yi alır
    const restaurantSlug = params.slug as string; // -> 'abc_restoran'
    const tableIdentifier = searchParams.get('table'); // -> 'masa-1'
    const { showSnackbar } = useSnackbar();

    console.log()
    // Toplam tutarı hesapla
    const totalPrice = items.reduce((total, item) => {
        const itemPrice = item.product.price;
        const variationsPrice = item.selectedVariations.reduce((sum, v) => sum + v.option.price_adjustment, 0);
        return total + (itemPrice + variationsPrice) * item.quantity;
    }, 0);

    // Sipariş gönderme mutation'ı
    const { mutate: sendOrder, isPending } = useMutation({
        mutationFn: submitOrder,
        onSuccess: () => {
            showSnackbar('Siparişiniz başarıyla mutfağa iletildi!', 'success');
            clearCart();
            onClose();
        },
        onError: (error) => {
            showSnackbar((error as Error).message, 'error');
        }
    });

    const handleSubmitOrder = () => {
        // API'ye gönderilecek payload'ı hazırla
        const payload = {
            tableIdentifier: tableIdentifier, // Hangi masadan sipariş verildiği
            items: items.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.price,
                totalPrice: (item.product.price + item.selectedVariations.reduce((s, v) => s + v.option.price_adjustment, 0)) * item.quantity,
                variations: item.selectedVariations.map(v => `${v.groupTitle}: ${v.option.name}`).join(', '),
            })),
            totalPrice: totalPrice,
        };
        sendOrder(payload);
    };



    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: '100%', maxWidth: 400 } }}
        >
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Sepetim</Typography>
                <Divider />
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {items.map(item => (
                        <ListItem key={item.uniqueId} divider>
                            <ListItemText
                                primary={item.product.name}
                                secondary={
                                    <>
                                        {item.selectedVariations.map(v => v.option.name).join(', ')}
                                        <Typography component="span" sx={{ display: 'block', fontWeight: 'bold', mt: 1 }}>
                                            {(item.product.price + item.selectedVariations.reduce((s, v) => s + v.option.price_adjustment, 0))} TL
                                        </Typography>
                                    </>
                                }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton size="small" onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}><Minus size={16} /></IconButton>
                                <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                <IconButton size="small" onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}><Plus size={16} /></IconButton>
                                <IconButton size="small" sx={{ ml: 2 }} onClick={() => removeFromCart(item.uniqueId)}><X size={16} color="red" /></IconButton>
                            </Box>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <Box sx={{ p: 2, mt: 'auto' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Toplam:</span>
                        <span>{totalPrice.toFixed(2)} TL</span>
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        sx={{ mt: 2, py: 1.5 }}
                        onClick={handleSubmitOrder}
                        disabled={items.length === 0}
                    >
                        {isPending ? 'Gönderiliyor...' : 'Siparişi Gönder'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}