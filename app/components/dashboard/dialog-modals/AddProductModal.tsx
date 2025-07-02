// src/components/AddProductModal.tsx
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { createProduct, uploadFile } from '@/app/lib/api';
import type { Category, NewProductData } from '@/app/types/strapi';

import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, Select, MenuItem, InputLabel, FormControl, Divider, Chip, Paper, Typography, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

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
    variations: {
        title: string;
        type: 'single' | 'multiple';
        options: {
            name: string;
            price_adjustment: number;
        }[];
    }[];
};

export default function AddProductModal({ open, onClose, restaurantId, categories }: AddProductModalProps) {
    const queryClient = useQueryClient();

    const { control, handleSubmit, reset, watch } = useForm<ProductFormData>();
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const imageField = watch('images');

    const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
        control,
        name: 'variations',
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (formData: ProductFormData) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            let imageIds: number[] = [];

            // Eğer resimler seçilmişse, hepsini yükle ve ID'lerini topla
            if (formData.images && formData.images.length > 0) {
                const uploadPromises = Array.from(formData.images).map(file => uploadFile(file, token));
                const imageList = await Promise.all(uploadPromises);
                imageIds = imageList[0].map(item=>item.id)
            }

            const variationsForApi = formData.variations.map(variation => {
                return {
                    title: variation.title,
                    type: variation.type,
                    options: variation.options.map(option => {
                        return {
                            name: option.name,
                            price_adjustment: +option.price_adjustment, // Sayı olduğundan emin olalım
                        };
                    })
                };
            });

            const productData: NewProductData = {
                name: formData.name,
                price: +formData.price, // Sayıya dönüştürdüğümüzden emin olalım
                description: formData.description,
                category: formData.category,
                images: imageIds,
                is_available: true, // Varsayılan olarak mevcut
                variations: variationsForApi,

            };

            return createProduct(productData as NewProductData, token);
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

                    <Divider sx={{ my: 3 }}><Chip label="Ürün Varyasyonları" /></Divider>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {variationFields.map((field, index) => (
                            <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>Varyasyon Grubu #{index + 1}</Typography>
                                    <IconButton onClick={() => removeVariation(index)} color="error"><Trash2 size={18} /></IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Controller name={`variations.${index}.title`} control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Grup Başlığı (örn: Porsiyon)" size="small" sx={{ flex: 1 }} />} />
                                    <Controller name={`variations.${index}.type`} control={control} defaultValue="single" render={({ field }) => (
                                        <FormControl size="small" sx={{ flex: 1 }}>
                                            <InputLabel>Seçim Tipi</InputLabel>
                                            <Select {...field} label="Seçim Tipi">
                                                <MenuItem value="single">Tekli Seçim</MenuItem>
                                                <MenuItem value="multiple">Çoklu Seçim</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )} />
                                </Box>
                                <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>Seçenekler:</Typography>
                                <OptionsArray nestedIndex={index} control={control} />
                            </Paper>
                        ))}
                    </Box>
                    <Button startIcon={<PlusCircle size={16} />} onClick={() => appendVariation({ title: '', type: 'single', options: [] })} sx={{ mt: 2 }}>
                        Varyasyon Grubu Ekle
                    </Button>

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

function OptionsArray({ nestedIndex, control }: { nestedIndex: number, control: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `variations.${nestedIndex}.options`
    });

    return (
        <Box sx={{ pl: 2, borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {fields.map((field, k) => (
                <Box key={field.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Controller name={`variations.${nestedIndex}.options.${k}.name`} control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Seçenek Adı" size="small" sx={{ flex: 2 }} />} />
                    <Controller name={`variations.${nestedIndex}.options.${k}.price_adjustment`} control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Fiyat Farkı (+/-)" type="number" size="small" sx={{ flex: 1 }} />} />
                    <IconButton onClick={() => remove(k)}><Trash2 size={16} /></IconButton>
                </Box>
            ))}
            <Button size="small" startIcon={<PlusCircle size={16} />} onClick={() => append({ name: '', price_adjustment: 0 })} sx={{ alignSelf: 'flex-start' }}>
                Seçenek Ekle
            </Button>
        </Box>
    )
}