'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { updateProduct } from '@/app/lib/api';
import type { Product, StrapiMedia, Category, UpdateProductData } from '@/app/types/strapi';

// MUI & İkonlar
import {
    Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box,
    Select, MenuItem, InputLabel, FormControl, IconButton, Typography,
    Divider,
    Chip,
    Paper
} from '@mui/material';
import { X as XIcon, ImagePlus, Trash2, PlusCircle } from 'lucide-react';
import { getStrapiMedia } from '@/app/lib/utils';
import { useSnackbar } from '@/app/context/SnackBarContext';
import MediaLibraryModal from './MediaLibraryModal';

// Bileşenin alacağı propların tipi
interface EditProductModalProps {
    open: boolean;
    onClose: () => void;
    product: Product;
    categories: Category[];
    initialCategoryId: number; // YENİ PROP
    restaurantId: string;
}

// Form verisinin tipi
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

export default function EditProductModal({ open, onClose, product, categories, initialCategoryId, restaurantId }: EditProductModalProps) {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();
    const [isMediaModalOpen, setMediaModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<StrapiMedia[]>([]);

    const { control, handleSubmit, reset, setValue } = useForm<ProductFormData>();
    const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
        control,
        name: 'variations',
    });


    // Modal her açıldığında veya 'product' prop'u değiştiğinde formu ve state'leri doldur
    useEffect(() => {
        if (product && open) {
            reset({
                name: product.name,
                description: product.description || '',
                price: product.price,
                category: initialCategoryId,
                images: product.images?.map(img => img.id) || [],
                variations: product.variations || [],
            });
            setSelectedImages(product.images || []);
        }
    }, [product, open, reset,initialCategoryId]);

    const { mutate, isPending, error } = useMutation({
        // mutationFn artık sadece form verisini alıyor
        mutationFn: async (formData: ProductFormData) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            // Form verisini doğrudan UpdateProductData tipine uygun hale getiriyoruz.
            const updateData: UpdateProductData = {
                name: formData.name,
                price: +formData.price,
                description: formData.description,
                category: formData.category,
                // Formdan gelen nihai ID listesini doğrudan gönderiyoruz.
                images: formData.images,
                variations: formData.variations.map(v => ({ ...v, options: v.options.map(o => ({ ...o, price_adjustment: +o.price_adjustment })) }))
            };

            return updateProduct(product.id, updateData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            showSnackbar('Ürün başarıyla güncellendi.', 'success');
            onClose();
        },
        onError: (err) => showSnackbar((err as Error).message, 'error'),
    });
    const handleImagesSelect = (media: StrapiMedia | StrapiMedia[]) => {
        const newlySelectedMedia = Array.isArray(media) ? media : [media];
        const combinedImages = [...selectedImages];
        newlySelectedMedia.forEach(newImage => {
            if (!combinedImages.some(existingImage => existingImage.id === newImage.id)) {
                combinedImages.push(newImage);
            }
        });

        // 4. Hem önizleme state'ini hem de form state'ini bu yeni, birleştirilmiş ve
        // tekrarsız diziyle güncelle.
        setSelectedImages(combinedImages);
        setValue('images', combinedImages.map(m => m.id), { shouldDirty: true });
        setMediaModalOpen(false);
    };
    const handleRemoveImage = (imageId: number) => {
        const newSelectedImages = selectedImages.filter(img => img.id !== imageId);
        setSelectedImages(newSelectedImages);
        setValue('images', newSelectedImages.map(m => m.id), { shouldDirty: true });
    };

    // onSubmit fonksiyonunu güncelliyoruz
    const onSubmit = (data: ProductFormData) => mutate(data);


    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Ürünü Düzenle</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* EKSİK OLAN FORM ALANLARI BURADA */}
                                <Controller name="name" control={control} rules={{ required: 'Ürün adı zorunludur.' }} render={({ field, fieldState }) => (<TextField {...field} autoFocus margin="normal" label="Ürün Adı" fullWidth variant="outlined" error={!!fieldState.error} helperText={fieldState.error?.message} />)} />
                                <Controller name="description" control={control} render={({ field }) => (<TextField {...field} fullWidth margin="normal" label="Açıklama" multiline rows={3} variant="outlined" />)} />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Controller name="price" control={control} rules={{ required: 'Fiyat zorunludur.' }} render={({ field, fieldState }) => (<TextField {...field} fullWidth margin="normal" label="Fiyat" type="number" variant="outlined" error={!!fieldState.error} helperText={fieldState.error?.message} />)} />
                                    <Controller name="category"
                                        control={control}
                                        rules={{ required: 'Kategori seçimi zorunludur.' }}
                                        defaultValue={product.category?.id}
                                        render={({ field, fieldState }) => (
                                            <FormControl fullWidth margin="normal" error={!!fieldState.error}>
                                                <InputLabel id="category-select-label">Kategori</InputLabel>
                                                <Select
                                                    {...field}
                                                    labelId="category-select-label"
                                                    label="Kategori"
                                                >
                                                    {categories.map(cat => (
                                                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )} />
                                </Box>
                                {/* FORM ALANLARI BİTTİ */}
                                <Box mt={1}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Ürün Resimleri ({selectedImages.length})
                                    </Typography>
                                    {selectedImages.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                            {selectedImages.map(img => (
                                                <Box key={img.id} sx={{ position: 'relative' }}>
                                                    <Image src={getStrapiMedia(img)} alt={img.name} width={80} height={80} style={{ borderRadius: '8px', objectFit: 'cover' }} />
                                                    <IconButton size="small" onClick={() => handleRemoveImage(img.id)} sx={{ /*...*/ }}>
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
                                <Divider sx={{ my: 3 }}><Chip label="Ürün Varyasyonları" /></Divider>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {variationFields.map((field, index) => (
                                        <Paper key={field.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                            <IconButton onClick={() => removeVariation(index)} color="error" sx={{ position: 'absolute', top: 8, right: 8 }}><Trash2 size={18} /></IconButton>
                                            <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Varyasyon Grubu</Typography>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
                                            {/* İç içe geçmiş Field Array için ayrı bir bileşen kullanmak en temizi */}
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
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <Button onClick={onClose}>İptal</Button>
                        <Button type="submit" disabled={isPending} variant="contained">{isPending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <MediaLibraryModal
                open={isMediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={handleImagesSelect}
                multiple={true}
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