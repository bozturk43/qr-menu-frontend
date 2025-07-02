'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { createRestaurant, uploadFile } from '@/app/lib/api';

// MUI ve İkonlar
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box } from '@mui/material';
import { ImagePlus } from 'lucide-react';
import { NewRestaurantData, User } from '@/app/types/strapi';


interface AddRestaurantModalProps {
    open: boolean;
    onClose: () => void;
    user: User;
}

// Form verisinin tipi güncellendi
type RestaurantFormData = {
    name: string;
    logo?: FileList;
};

export default function AddRestaurantModal({ open, onClose,user }: AddRestaurantModalProps) {
    const router = useRouter();

    const { control, handleSubmit, reset, watch } = useForm<RestaurantFormData>({
        defaultValues: { name: '', logo: undefined },
    });

    // Resim önizlemesi için state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const logoField = watch('logo');

    useEffect(() => {
        if (logoField && logoField.length > 0) {
            const file = logoField[0];
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);
            return () => URL.revokeObjectURL(newPreviewUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [logoField]);

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (formData: RestaurantFormData) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            let logoId: number | undefined = undefined;

            // 1. Eğer logo seçilmişse, önce onu yükle
            if (formData.logo && formData.logo.length > 0) {
                const logoMedia = await uploadFile(formData.logo[0], token);
                logoId = logoMedia[0].id;
            }

            // 2. Restoran verisini hazırla (slug YOK, Strapi halledecek)
            const restaurantData: NewRestaurantData = {
                name: formData.name,
                logo: logoId,
                owner:user.id
            };

            // 3. Restoranı oluştur
            return createRestaurant(restaurantData, token);
        },
        onSuccess: () => {
            handleClose();
            // Lobi sayfasındaki restoran listesinin güncellenmesi için sayfayı yeniliyoruz.
            router.refresh();
        },
    });

    const handleClose = () => {
        reset(); // Formu sıfırla
        setPreviewUrl(null); // Önizlemeyi sıfırla
        onClose();
    };

    const onSubmit = (data: RestaurantFormData) => mutate(data);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Yeni Restoran Oluştur</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Restoran adı zorunludur.' }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                autoFocus
                                margin="dense"
                                label="Restoran Adı"
                                fullWidth
                                variant="outlined"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    {previewUrl && (
                        <Box sx={{ my: 2, textAlign: 'center' }}>
                            <img src={previewUrl} alt="Logo önizlemesi" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                        </Box>
                    )}

                    <Controller
                        name="logo"
                        control={control}
                        render={({ field: { onChange } }) => (
                            <Button variant="outlined" component="label" startIcon={<ImagePlus />} fullWidth>
                                {previewUrl ? 'Logoyu Değiştir' : 'Logo Seç'}
                                <input type="file" hidden accept="image/*" onChange={(e) => onChange(e.target.files)} />
                            </Button>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button type="submit" disabled={isPending} variant="contained">
                        {isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}