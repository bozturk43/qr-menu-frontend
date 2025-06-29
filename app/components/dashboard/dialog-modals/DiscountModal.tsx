// app/components/dashboard/DiscountModal.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { applyDiscountToOrder, ApplyDiscountPayload } from '@/app/lib/api';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Percent } from 'lucide-react';
import { useSnackbar } from '@/app/context/SnackBarContext';

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  restaurantId: string | number;
}

export default function DiscountModal({ open, onClose, orderId, restaurantId }: DiscountModalProps) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<ApplyDiscountPayload>({
    defaultValues: { discount_type: 'percentage', discount_value: 0 },
  });

  const discountType = watch('discount_type');

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: ApplyDiscountPayload) => applyDiscountToOrder(orderId, data, Cookies.get('jwt')!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openOrders', restaurantId] });
      showSnackbar('İndirim başarıyla uygulandı.', 'success');
      onClose();
    },
    onError: (err) => showSnackbar((err as Error).message, 'error'),
  });

  const onSubmit = (data: ApplyDiscountPayload) => mutate(data);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Adisyona İndirim Uygula</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}

          <Controller
            name="discount_type"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup {...field} exclusive fullWidth sx={{ mb: 2 }}>
                <ToggleButton value="percentage"><Percent size={18} /> Yüzde</ToggleButton>
                <ToggleButton value="fixed_amount">"TL" Sabit Tutar</ToggleButton>
              </ToggleButtonGroup>
            )}
          />

          <Controller
            name="discount_value"
            control={control}
            rules={{ required: 'Değer girmek zorunludur.', min: {value: 0.01, message: 'Değer 0 dan büyük olmalı'} }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                label="İndirim Değeri"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: discountType === 'percentage' ? '%' : 'TL',
                }}
                error={!!errors.discount_value}
                helperText={errors.discount_value?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" disabled={isPending} variant="contained">
            {isPending ? 'Uygulanıyor...' : 'İndirimi Uygula'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}