// app/components/dashboard/AdisyonDetayModal.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, Restaurant } from '@/app/types/strapi';
import { closeOrder, deleteOrderItem, payOrderItems } from '@/app/lib/api';
import Cookies from 'js-cookie';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Box, Divider, IconButton, Tooltip, Checkbox } from '@mui/material';
import { Delete, Close, Add } from '@mui/icons-material';
import { useSnackbar } from '@/app/context/SnackBarContext';
import { useState } from 'react';
import AddItemToOrderModal from './AddItemToOrder';

interface AdisyonDetayModalProps {
    order: Order | null;
    onClose: () => void;
    restaurant: Restaurant;

}

export default function AdisyonDetayModal({ order, onClose, restaurant }: AdisyonDetayModalProps) {
    const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());


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
        mutationFn: () => payOrderItems(order!.id, Array.from(selectedItemIds), Cookies.get('jwt')!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openOrders', restaurant.id] });
            setSelectedItemIds(new Set()); // Seçimi sıfırla
            showSnackbar('Seçili ürünler ödendi.', 'success');
        }
    });
    const closeOrderMutation = useMutation({
        mutationFn: () => closeOrder(order!.id, Cookies.get('jwt')!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openOrders', restaurant.id] });
            showSnackbar('Adisyon kapatıldı.', 'success');
            onClose(); // Ana modal'ı kapat
        }
    });
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
                    <Box>
                        {/* YENİ: Parçalı Ödeme Butonu */}
                        <Button variant="outlined" onClick={() => payItemsMutation.mutate()} disabled={selectedItemIds.size === 0 || payItemsMutation.isPending}>
                            Seçilenleri Öde ({selectedTotal.toFixed(2)} TL)
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5">Toplam: {(order.total_price - paidTotal).toFixed(2)} TL</Typography>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => closeOrderMutation.mutate()}
                            disabled={unpaidItems.length === 0 || closeOrderMutation.isPending}
                        >
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
        </>
    );
}