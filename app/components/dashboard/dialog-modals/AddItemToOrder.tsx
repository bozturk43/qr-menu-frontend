// src/components/dashboard/AddItemToOrderModal.tsx
'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { addItemsToOrder } from '@/app/lib/api';
import type { Restaurant, Product, Order, Option } from '@/app/types/strapi';

// MUI
import {
    Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box,
    Autocomplete, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup, Typography
} from '@mui/material';
import { useSnackbar } from '@/app/context/SnackBarContext';

interface AddItemModalProps {
    open: boolean;
    onClose: () => void;
    order: Order;
    restaurant: Restaurant;
}

export default function AddItemToOrderModal({ open, onClose, order, restaurant }: AddItemModalProps) {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariations, setSelectedVariations] = useState<Record<string, any>>({});
    const [quantity, setQuantity] = useState(1);

    const allProducts = restaurant.categories?.flatMap(c => c.products || []) || [];

    const { mutate, isPending, error } = useMutation({
        mutationFn: (newItemsPayload: { items: any[] }) =>
            addItemsToOrder(order.id, newItemsPayload, Cookies.get('jwt')!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openOrders', restaurant.id] });
            showSnackbar('Ürün adisyona eklendi.', 'success');
            handleClose();
        },
        onError: (err) => showSnackbar((err as Error).message, 'error'),
    });

    const handleClose = () => {
        setSelectedProduct(null);
        setSelectedVariations({});
        setQuantity(1);
        onClose();
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;

        const variationsSummary = Object.entries(selectedVariations).flatMap(([groupTitle, optionOrOptions]) => {
            if (Array.isArray(optionOrOptions)) return optionOrOptions.map(option => `${groupTitle}: ${option.name}`);
            return `${groupTitle}: ${(optionOrOptions as Option).name}`;
        }).join(', ');

        const variationsPrice = Object.values(selectedVariations).reduce((sum, selection) => {
            if (Array.isArray(selection)) {
                return sum + selection.reduce((s, o) => s + o.price_adjustment, 0);
            }
            return sum + (selection as Option)?.price_adjustment || 0;
        }, 0);

        const itemTotalPrice = (selectedProduct.price + variationsPrice) * quantity;

        const newItem = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: quantity,
            totalPrice: itemTotalPrice,
            variations: variationsSummary,
        };

        mutate({ items: [newItem] });
    };
    const handleSelectionChange = (groupTitle: string, option: Option, type: 'single' | 'multiple') => {
        setSelectedVariations(prev => {
            const newSelections = { ...prev };
            if (type === 'single') {
                newSelections[groupTitle] = option;
            } else {
                const currentGroup = (newSelections[groupTitle] as Option[]) || [];
                const isSelected = currentGroup.some(o => o.id === option.id);
                if (isSelected) {
                    newSelections[groupTitle] = currentGroup.filter(o => o.id !== option.id);
                } else {
                    newSelections[groupTitle] = [...currentGroup, option];
                }
            }
            return newSelections;
        });
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Adisyona Ürün Ekle</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}

                <Autocomplete
                    options={allProducts}
                    groupBy={(option) => option.category?.name || 'Diğer'}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => setSelectedProduct(newValue)}
                    renderInput={(params) => <TextField {...params} label="Ürün Ara" margin="normal" />}
                />

                {selectedProduct && selectedProduct.variations?.map(group => (
                    <Box key={group.id} my={2}>
                        <Typography variant="h6">{group.title}</Typography>
                        {group.type === 'single' ? (
                            <RadioGroup onChange={(e) => handleSelectionChange(group.title, JSON.parse(e.target.value), 'single')}>
                                {group.options.map(option => (
                                    <FormControlLabel key={option.id} value={JSON.stringify(option)} control={<Radio />} label={`${option.name} (+${option.price_adjustment} TL)`} />
                                ))}
                            </RadioGroup>
                        ) : (
                            <FormGroup>
                                {group.options.map(option => (
                                    <FormControlLabel key={option.id} control={<Checkbox onChange={() => handleSelectionChange(group.title, option, 'multiple')} />} label={`${option.name} (+${option.price_adjustment} TL)`} />
                                ))}
                            </FormGroup>
                        )}
                    </Box>
                ))}

                {selectedProduct && <TextField type="number" label="Adet" value={quantity} onChange={e => setQuantity(Math.max(1, +e.target.value))} margin="normal" />}

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>İptal</Button>
                <Button onClick={handleAddItem} disabled={!selectedProduct || isPending} variant="contained">
                    {isPending ? 'Ekleniyor...' : 'Adisyona Ekle'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}