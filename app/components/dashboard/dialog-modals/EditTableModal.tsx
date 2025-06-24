// src/components/dashboard/AddTableModal.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { createTable, updateTable } from '@/app/lib/api';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { NewTableData, Table, UpdateTableData } from '@/app/types/strapi';

interface AddTableModalProps {
    open: boolean;
    onClose: () => void;
    tableToEdit: Table;
    restaurantId:string;
}

export default function EditTableModal({ open, onClose, tableToEdit,restaurantId }: AddTableModalProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, formState: { errors } } = useForm<Omit<UpdateTableData, 'restaurant'>>({
        defaultValues: { name: tableToEdit.name },
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: (data: Omit<UpdateTableData, 'restaurant'>) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            const tableData: UpdateTableData = {
                ...data,
            };
            return updateTable(tableToEdit.id,tableData,token);
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

    const onSubmit = (data: Omit<UpdateTableData, 'restaurant'>) => mutate(data);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Masa Güncelle</DialogTitle>
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
                        {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}