'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { updateProduct, uploadFile } from '@/app/lib/api';
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

    const { control, handleSubmit, reset} = useForm<ProductFormData>();
    const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
        control,
        name: 'variations',
    });

    const [existingImages, setExistingImages] = useState<StrapiMedia[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

    // Modal her açıldığında veya 'product' prop'u değiştiğinde formu ve state'leri doldur
    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                description: product.description || '',
                price: product.price,
                category: initialCategoryId,
                variations: product.variations || [],
            });
            setExistingImages(product.images || []);
            setNewImageFiles([]);
        }
    }, [product, open, reset, initialCategoryId]);

    const { mutate, isPending, error } = useMutation({
        // mutationFn artık tüm verileri içeren tek bir obje alıyor
        mutationFn: async ({ formData, currentNewFiles, currentExistingImages }: {
            formData: ProductFormData;
            currentNewFiles: File[];
            currentExistingImages: StrapiMedia[];
        }) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            // 1. Yeni seçilen dosyaları yükle
            const newImageIds = currentNewFiles.length > 0
                ? await Promise.all(currentNewFiles.map(file => uploadFile(file, token)))
                : [];

            // 2. Mevcut (silinmemiş) resimlerin ID'lerini al
            const existingImageIds = currentExistingImages.map(img => img.id);

            // 3. Nihai listeyi oluştur
            const finalImageIds = [...existingImageIds, ...newImageIds];

            const updateData: UpdateProductData = {
                name: formData.name,
                price: +formData.price,
                description: formData.description,
                category: formData.category,
                images: finalImageIds, // Strapi'ye artık doğru ve tam listeyi gönderiyoruz
                variations: formData.variations.map(v => ({ ...v, options: v.options.map(o => ({ ...o, price_adjustment: +o.price_adjustment })) }))

            };

            return updateProduct(product.id, updateData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            onClose();
        },
    });

    // onSubmit fonksiyonunu güncelliyoruz
    const onSubmit = (formData: ProductFormData) => {
        // mutate fonksiyonuna sadece formu değil, tüm gerekli state'leri içeren bir obje gönderiyoruz.
        mutate({
            formData: formData,
            currentNewFiles: newImageFiles,
            currentExistingImages: existingImages
        });
    };
    console.log(product);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Ürünü Düzenle</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}

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

                    <Typography sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Mevcut Resimler</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, minHeight: '118px' }}>
                        {existingImages.map(image => (
                            <Box key={image.id} sx={{ position: 'relative' }}>
                                <img src={getStrapiMedia(image)} alt={image.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                <IconButton size="small" sx={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'white', '&:hover': { backgroundColor: '#eee' } }} onClick={() => setExistingImages(prev => prev.filter(img => img.id !== image.id))}>
                                    <XIcon size={16} color="red" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>

                    <Typography sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Yeni Resim Ekle</Typography>
                    <Button variant="outlined" component="label" startIcon={<ImagePlus />}>
                        Dosya Seç
                        <input type="file" hidden multiple accept="image/*" onChange={(e) => setNewImageFiles(Array.from(e.target.files || []))} />
                    </Button>

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

                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={onClose}>İptal</Button>
                    <Button type="submit" disabled={isPending} variant="contained">{isPending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}</Button>
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