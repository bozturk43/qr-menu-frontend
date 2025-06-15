// src/components/AddProductModal.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { createProduct, uploadFile } from '@/app/lib/api';
import type { Category, NewProductData } from '@/app/types/strapi';

import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useEffect, useState } from 'react';

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
    restaurantId: string;
    categories: Category[]; // Kategori seçimi için dropdown'ı dolduracağız
}

type ProductFormData = {
    name: string;
    description: string;
    price: number;
    category: number; // Sadece ID'sini tutacağız
    images?: FileList;
};

export default function AddProductModal({ open, onClose, restaurantId, categories }: AddProductModalProps) {
    const queryClient = useQueryClient();

    const { control, handleSubmit, reset, watch } = useForm<ProductFormData>();
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const imageField = watch('images');

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (formData: ProductFormData) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            let imageIds: number[] = [];

            // Eğer resimler seçilmişse, hepsini yükle ve ID'lerini topla
            if (formData.images && formData.images.length > 0) {
                const uploadPromises = Array.from(formData.images).map(file => uploadFile(file, token));
                imageIds = await Promise.all(uploadPromises);
            }

            const productData: NewProductData = {
                name: formData.name,
                price: +formData.price, // Sayıya dönüştürdüğümüzden emin olalım
                description: formData.description,
                category: formData.category,
                images: imageIds,
                is_available: true, // Varsayılan olarak mevcut
            };

            return createProduct(productData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            handleClose();
        },
    });

    const handleClose = () => {
        reset(); // Formu sıfırla
        onClose();
        setPreviewUrls([]); // Kapatırken önizlemeleri de sıfırla

    };

    const onSubmit = (data: ProductFormData) => {
        mutate(data);
    };
    useEffect(() => {
        if (imageField && imageField.length > 0) {
            // Seçilen her bir dosya için geçici bir URL oluştur
            const newUrls = Array.from(imageField).map(file => URL.createObjectURL(file));
            setPreviewUrls(newUrls);
            // Component unmount olduğunda veya dosyalar değiştiğinde,
            // hafıza sızıntısını önlemek için oluşturulan tüm URL'leri temizle
            return () => newUrls.forEach(url => URL.revokeObjectURL(url));
        } else {
            setPreviewUrls([]);
        }
    }, [imageField]);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Yeni Ürün Ekle</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}
                    <Controller name="name" control={control} rules={{ required: 'Ürün adı zorunludur.' }} render={({ field, fieldState }) => (<TextField {...field} fullWidth margin="dense" label="Ürün Adı" error={!!fieldState.error} helperText={fieldState.error?.message} />)} />
                    <Controller name="description" control={control} render={({ field }) => (<TextField {...field} fullWidth margin="dense" label="Açıklama" multiline rows={3} />)} />
                    <Controller name="price" control={control} rules={{ required: 'Fiyat zorunludur.' }} render={({ field, fieldState }) => (<TextField {...field} fullWidth margin="dense" label="Fiyat" type="number" error={!!fieldState.error} helperText={fieldState.error?.message} />)} />
                    <Controller name="category" control={control} rules={{ required: 'Kategori seçimi zorunludur.' }} render={({ field, fieldState }) => (
                        <FormControl fullWidth margin="dense" error={!!fieldState.error}>
                            <InputLabel>Kategori</InputLabel>
                            <Select {...field} label="Kategori">
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )} />
                    {previewUrls.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            {previewUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Önizleme ${index + 1}`}
                                    style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            ))}
                        </Box>
                    )}
                    <Controller name="images" control={control} render={({ field: { onChange } }) => (
                        <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                            Resim(ler) Seç
                            <input type="file" hidden multiple accept="image/*" onChange={(e) => onChange(e.target.files)} />
                        </Button>
                    )} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button type="submit" disabled={isPending} variant="contained">
                        {isPending ? 'Ekleniyor...' : 'Ürünü Ekle'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}