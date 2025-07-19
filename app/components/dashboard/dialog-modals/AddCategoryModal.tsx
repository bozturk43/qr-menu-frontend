// src/components/AddCategoryModal.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { createCategory } from '@/app/lib/api';
import Image from 'next/image'

// MUI & İkonlar
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, Typography } from '@mui/material';
import { NewCategoryData, StrapiMedia } from '@/app/types/strapi';
import { useState } from 'react';
import { useSnackbar } from '@/app/context/SnackBarContext';
import { getStrapiMedia } from '@/app/lib/utils';
import { ImagePlus } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

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
    image?: number;
};

export default function AddCategoryModal({ open, onClose, restaurantId, currentCategoryCount }: AddCategoryModalProps) {

    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();
    const [isMediaModalOpen, setMediaModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<StrapiMedia | null>(null);
    const { control, handleSubmit, reset, setValue,formState: { errors } } = useForm<CategoryFormData>({
        defaultValues: { name: '', image: undefined },
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (formData: CategoryFormData) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            const categoryData: NewCategoryData = {
                name: formData.name,
                restaurant: +restaurantId,
                display_order: currentCategoryCount,
                image: formData.image,
            };
            return createCategory(categoryData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            showSnackbar('Kategori başarıyla eklendi.', 'success');
            handleClose();
        },
        onError: (err) => showSnackbar((err as Error).message, 'error'),
    });

    const handleClose = () => {
        reset();
        setSelectedImage(null);
        onClose();
    };

    // Form gönderildiğinde çalışacak fonksiyon
    const onSubmit = (data: CategoryFormData) => mutate(data);
    const handleImageSelect = (media: StrapiMedia | StrapiMedia[]) => {
        // Kategori için sadece tek resim seçilebilir
        const singleMedia = Array.isArray(media) ? media[0] : media;
        if (singleMedia) {
            setValue('image', singleMedia.id, { shouldDirty: true });
            setSelectedImage(singleMedia);
        }
        setMediaModalOpen(false);
    };


    return (
        <>
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
                        <Box mt={2}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Kategori Resmi
                            </Typography>
                            {selectedImage && (
                                <Box sx={{ my: 1 }}>
                                    <Image
                                        src={getStrapiMedia(selectedImage)}
                                        alt={selectedImage.name}
                                        width={100}
                                        height={100}
                                        style={{ borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                </Box>
                            )}
                            <Button
                                startIcon={<ImagePlus />}
                                onClick={() => setMediaModalOpen(true)}
                                variant="outlined"
                            >
                                {selectedImage ? 'Resmi Değiştir' : 'Galeriden Seç / Yükle'}
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>İptal</Button>
                        <Button type="submit" disabled={isPending} variant="contained">
                            {isPending ? 'Ekleniyor...' : 'Ekle'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <MediaLibraryModal
                open={isMediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={handleImageSelect}
                multiple={false} // Kategori için TEKLİ SEÇİM
            />
        </>
    );
}