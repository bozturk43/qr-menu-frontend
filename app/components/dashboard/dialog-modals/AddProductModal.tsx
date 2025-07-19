// src/components/AddProductModal.tsx
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { createProduct } from '@/app/lib/api';
import Image from 'next/image'
import type { Category, NewProductData, StrapiMedia } from '@/app/types/strapi';

import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, Select, MenuItem, InputLabel, FormControl, Divider, Chip, Paper, Typography, IconButton } from '@mui/material';
import { useState } from 'react';
import { ImagePlus, PlusCircle, Trash2, XIcon } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';
import { getStrapiMedia } from '@/app/lib/utils';

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
    images?: number[];
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

    const { control, handleSubmit, reset, setValue } = useForm<ProductFormData>({
        defaultValues: { name: '', images: [], variations: [] },
    }); const [isMediaModalOpen, setMediaModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<StrapiMedia[]>([]);

    const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
        control,
        name: 'variations',
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (formData: ProductFormData) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

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
                images: formData.images,
                is_available: true, // Varsayılan olarak mevcut
                variations: variationsForApi,

            };
            console.log(productData);
            return createProduct(productData as NewProductData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            handleClose();
        },
    });
    // Medya kütüphanesinden resimler seçildiğinde çalışacak fonksiyon
    const handleImagesSelect = (media: StrapiMedia | StrapiMedia[]) => {
        const mediaArray = Array.isArray(media) ? media : [media];
        // Mevcut seçime yenilerini ekleyerek birleştir (tekrarları önle)
        const newSelectedImages = [...selectedImages];
        mediaArray.forEach(m => {
            if (!newSelectedImages.some(img => img.id === m.id)) {
                newSelectedImages.push(m);
            }
        })
        setSelectedImages(newSelectedImages);
        setValue('images', newSelectedImages.map(m => m.id), { shouldDirty: true });
        setMediaModalOpen(false);
    };
    const handleRemoveImage = (imageId: number) => {
        const newSelectedImages = selectedImages.filter(img => img.id !== imageId);
        setSelectedImages(newSelectedImages);
        setValue('images', newSelectedImages.map(m => m.id), { shouldDirty: true });
    };
    const handleClose = () => {
        reset(); // Formu sıfırla
        onClose();
        setSelectedImages([]);

    };

    const onSubmit = (data: ProductFormData) => {
        mutate(data);
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                <Box mt={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Ürün Resimleri ({selectedImages.length})
                                    </Typography>

                                    {/* YENİ: Seçilen Resimlerin Önizlemesi */}
                                    {selectedImages.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                            {selectedImages.map(img => (
                                                <Box key={img.id} sx={{ position: 'relative' }}>
                                                    <Image src={getStrapiMedia(img)} alt={img.name} width={80} height={80} style={{ borderRadius: '8px', objectFit: 'cover' }} />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveImage(img.id)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -5,
                                                            right: -5,
                                                            bgcolor: 'rgba(0,0,0,0.7)',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                                                        }}
                                                    >
                                                        <XIcon size={14} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    <Button startIcon={<ImagePlus />} onClick={() => setMediaModalOpen(true)}>
                                        Galeriden Seç / Yükle
                                    </Button>
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Divider sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}><Chip label="Ürün Varyasyonları" /></Divider>
                                <Typography variant="h6" sx={{ display: { xs: 'none', md: 'block' }, mb: 2 }}>Ürün Varyasyonları</Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '50vh', overflowY: 'auto', p: 0.5 }}>
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
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>İptal</Button>
                        <Button type="submit" disabled={isPending} variant="contained">
                            {isPending ? 'Ekleniyor...' : 'Ürünü Ekle'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <MediaLibraryModal
                open={isMediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={handleImagesSelect}
                multiple={true} // ÇOKLU SEÇİMİ AKTİF EDİYORUZ
            />
        </>
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