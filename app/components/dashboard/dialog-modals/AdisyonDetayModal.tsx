// app/components/dashboard/AdisyonDetayModal.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, Restaurant } from '@/app/types/strapi';
import { closeOrder, deleteOrderItem, payOrderItems } from '@/app/lib/api';
import Cookies from 'js-cookie';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Box, IconButton, Tooltip, Checkbox, DialogContentText } from '@mui/material';
import { Delete, Close, Add, Discount } from '@mui/icons-material';
import { useSnackbar } from '@/app/context/SnackBarContext';
import { useState } from 'react';
import AddItemToOrderModal from './AddItemToOrder';
import DiscountModal from './DiscountModal';

interface AdisyonDetayModalProps {
    order: Order | null;
    onClose: () => void;
    restaurant: Restaurant;

}

export default function AdisyonDetayModal({ order, onClose, restaurant }: AdisyonDetayModalProps) {
    const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
    const [paymentAction, setPaymentAction] = useState<'paySelected' | 'closeAll' | null>(null);
    const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);




    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    console.log(order);

    const deleteItemMutation = useMutation({
        mutationFn: (orderItemId: number) => deleteOrderItem(orderItemId, Cookies.get('jwt')!),
        onSuccess: () => {
            // Adisyon listesini tazelemek için openOrders sorgusunu geçersiz kıl
            queryClient.invalidateQueries({ queryKey: ['openOrders', order?.restaurant?.id] });
            showSnackbar('Ürün adisyondan başarıyla silindi.', 'success');
        },
        onError: (error) => showSnackbar((error as Error).message, 'error'),
    });
    const payItemsMutation = useMutation({
        mutationFn: ({ itemIds, paymentMethod }: { itemIds: number[], paymentMethod: string }) => payOrderItems(order!.id, { itemIds, paymentMethod }, Cookies.get('jwt')!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openOrders', restaurant.id] });
            setSelectedItemIds(new Set()); // Seçimi sıfırla
            showSnackbar('Seçili ürünler ödendi.', 'success');
            setPaymentAction(null); // Onay modalını kapat

        }
    });
    const closeOrderMutation = useMutation({
        mutationFn: (paymentMethod: string) => closeOrder(order!.id, { paymentMethod }, Cookies.get('jwt')!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openOrders', restaurant.id] });
            showSnackbar('Adisyon kapatıldı.', 'success');
            setPaymentAction(null); // Onay modalını kapat
            onClose(); // Ana modal'ı kapat
        }
    });

    const handlePaymentConfirm = (paymentMethod: 'cash' | 'card' | 'other') => {
        if (paymentAction === 'paySelected') {
            payItemsMutation.mutate({ itemIds: Array.from(selectedItemIds), paymentMethod });
        } else if (paymentAction === 'closeAll') {
            closeOrderMutation.mutate(paymentMethod);
        }
    };
    if (!order) return null;


    const unpaidItems = order.order_items?.filter(item => item.order_item_status !== 'paid') || [];
    const paidTotal = order.order_items?.filter(item => item.order_item_status === 'paid').reduce((sum, item) => sum + item.total_price, 0) || 0;
    const selectedTotal = unpaidItems.filter(item => selectedItemIds.has(item.id)).reduce((sum, item) => sum + item.total_price, 0);

    const handleItemSelect = (itemId: number) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) newSet.delete(itemId);
            else newSet.add(itemId);
            return newSet;
        });
    };


    return (
        <>
            <Dialog open={!!order} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {order.table?.name} - Adisyon Detayı
                    <IconButton onClick={onClose}><Close /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <List>
                        {unpaidItems?.map(item => (
                            <ListItem key={item.id} secondaryAction={
                                <Tooltip title="Ürünü İptal Et">
                                    <IconButton edge="end" color="error" onClick={() => deleteItemMutation.mutate(item.id)}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            }>
                                <Checkbox edge="start" checked={selectedItemIds.has(item.id)} onChange={() => handleItemSelect(item.id)} />

                                <ListItemText
                                    primary={`${item.quantity}x ${item.product_name}`}
                                    secondary={item.selected_variations || 'Standart'}
                                />
                                <Typography sx={{ fontWeight: 'bold' }}>{item.total_price.toFixed(2)} TL</Typography>
                            </ListItem>
                        ))}
                        {paidTotal > 0 && <ListItem><ListItemText primary="Ödenen Tutar" primaryTypographyProps={{ color: 'success.main', fontWeight: 'bold' }} secondary={`${paidTotal.toFixed(2)} TL`} /></ListItem>}
                    </List>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    {/* YENİ ÜRÜN EKLE BUTONU */}
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setAddItemModalOpen(true)}
                    >
                        Ürün Ekle
                    </Button>
                    <Button variant="outlined" startIcon={<Discount />} onClick={() => setDiscountModalOpen(true)} color="info">
                        İndirim Uygula
                    </Button>
                    <Box>
                        {/* YENİ: Parçalı Ödeme Butonu */}
                        <Button variant="outlined" onClick={() => setPaymentAction('paySelected')} disabled={selectedItemIds.size === 0 || payItemsMutation.isPending}>
                            Seçilenleri Öde ({selectedTotal.toFixed(2)} TL)
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5">Toplam: {(order.total_price - paidTotal).toFixed(2)} TL</Typography>
                        <Button variant="contained" color="success" onClick={() => setPaymentAction('closeAll')} disabled={unpaidItems.length === 0 || closeOrderMutation.isPending}>

                            {closeOrderMutation.isPending ? "Kapatılıyor..." : "Tüm Hesabı Kapat"}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
            <AddItemToOrderModal
                open={isAddItemModalOpen}
                onClose={() => setAddItemModalOpen(false)}
                order={order}
                restaurant={restaurant}
            />
            <Dialog
                open={!!paymentAction}
                onClose={() => setPaymentAction(null)}
            >
                <DialogTitle>Ödeme Yöntemini Seçin</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {paymentAction === 'paySelected'
                            ? `${selectedTotal.toFixed(2)} TL tutarındaki kısmi ödeme hangi yöntemle yapılıyor?`
                            : "Adisyonun kalan tutarını hangi yöntemle kapatmak istiyorsunuz?"
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentAction(null)}>İptal</Button>
                    <Button onClick={() => handlePaymentConfirm('cash')} variant="outlined" disabled={payItemsMutation.isPending || closeOrderMutation.isPending}>Nakit</Button>
                    <Button onClick={() => handlePaymentConfirm('card')} variant="contained" disabled={payItemsMutation.isPending || closeOrderMutation.isPending}>Kart</Button>
                </DialogActions>
            </Dialog>
            <DiscountModal
                open={isDiscountModalOpen}
                onClose={() => setDiscountModalOpen(false)}
                orderId={order.id}
                restaurantId={restaurant.id}
            />
        </>
    );
}