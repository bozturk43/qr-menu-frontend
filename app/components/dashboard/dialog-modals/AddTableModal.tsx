// src/components/dashboard/AddTableModal.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { createTable } from '@/app/lib/api';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { NewTableData } from '@/app/types/strapi';

interface AddTableModalProps {
    open: boolean;
    onClose: () => void;
    restaurantId: string;
}

export default function AddTableModal({ open, onClose, restaurantId }: AddTableModalProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { errors } } = useForm<Omit<NewTableData, 'restaurant'>>({
        defaultValues: { name: '' },
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: (data: Omit<NewTableData, 'restaurant'>) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            const tableData: NewTableData = {
                ...data,
                restaurant: +restaurantId, // Restoran ID'sini ekliyoruz
            };
            return createTable(tableData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            handleClose();
            // Sunucu Bileşeni olan ana sayfanın veriyi yeniden çekmesi için refresh yapıyoruz.
        },
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = (data: Omit<NewTableData, 'restaurant'>) => mutate(data);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Yeni Masa Ekle</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Masa adı veya numarası zorunludur.' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                autoFocus
                                margin="dense"
                                label="Masa Adı (örn: Bahçe 5)"
                                fullWidth
                                variant="outlined"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
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