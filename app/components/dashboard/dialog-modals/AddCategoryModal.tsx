// src/components/AddCategoryModal.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { createCategory, uploadFile } from '@/app/lib/api';

// MUI & İkonlar
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box } from '@mui/material';
import { NewCategoryData } from '@/app/types/strapi';
import { useEffect, useState } from 'react';

// Bu bileşenin alacağı propların tipi
interface AddCategoryModalProps {
    open: boolean;
    onClose: () => void;
    restaurantId: string;
    currentCategoryCount: number;
}

// Form verisinin tipi
type CategoryFormData = {
    name: string;
    image?: FileList;
};

export default function AddCategoryModal({ open, onClose, restaurantId, currentCategoryCount }: AddCategoryModalProps) {

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Formdaki 'image' alanını izliyoruz
    const queryClient = useQueryClient();

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<CategoryFormData>({
        defaultValues: { name: '', image: undefined },
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (formData: CategoryFormData) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            let image: number | undefined = undefined;

            // 1. Eğer resim seçilmişse, önce onu yükle
            if (formData.image && formData.image.length > 0) {
                const imageList = await uploadFile(formData.image[0], token);
                image = imageList[0].id;

            }

            // 2. Kategori verisini hazırla
            const categoryData: NewCategoryData = {
                name: formData.name,
                restaurant: +restaurantId,
                display_order: currentCategoryCount,
                image: image,
            };

            // 3. Kategoriyi oluştur
            return createCategory(categoryData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            handleClose(); // Başarılı olunca modal'ı kapat
        },
    });

    const handleClose = () => {
        reset(); // Formu sıfırla
        onClose(); // Parent component'e kapatıldığını bildir
    };

    // Form gönderildiğinde çalışacak fonksiyon
    const onSubmit = (data: CategoryFormData) => {
        mutate(data);
    };
    const imageField = watch('image');

    useEffect(() => {
        // Eğer bir dosya seçilmişse...
        if (imageField && imageField.length > 0) {
            const file = imageField[0];
            // Seçilen dosya için geçici bir URL oluştur
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);

            // Component unmount olduğunda veya dosya değiştiğinde,
            // hafıza sızıntısını önlemek için oluşturulan bu URL'i temizle
            return () => URL.revokeObjectURL(newPreviewUrl);
        } else {
            // Eğer dosya seçimi iptal edilirse, önizlemeyi de kaldır
            setPreviewUrl(null);
        }
    }, [imageField]);


    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Yeni Kategori Ekle</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Kategori adı zorunludur.' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                autoFocus
                                margin="dense"
                                label="Kategori Adı"
                                fullWidth
                                variant="outlined"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                    {previewUrl && (
                        <Box sx={{ my: 2, textAlign: 'center' }}>
                            <img
                                src={previewUrl}
                                alt="Seçilen resim önizlemesi"
                                style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '8px' }}
                            />
                        </Box>
                    )}
                    <Controller
                        name="image"
                        control={control}
                        render={({ field: { onChange, onBlur, name, ref } }) => (
                            <Button variant="outlined" component="label" fullWidth>
                                Resim Seç
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onBlur={onBlur}
                                    name={name}
                                    ref={ref}
                                    onChange={(e) => onChange(e.target.files)}
                                />
                            </Button>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button type="submit" disabled={isPending} variant="contained">
                        {isPending ? 'Ekleniyor...' : 'Ekle'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}