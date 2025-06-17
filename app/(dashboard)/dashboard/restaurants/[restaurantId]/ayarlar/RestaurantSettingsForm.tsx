// app/(dashboard)/restaurants/[restaurantId]/RestaurantSettingsForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { updateRestaurant, uploadFile } from '@/app/lib/api';
import type { Restaurant, UpdateRestaurantData } from '@/app/types/strapi';
import { Box, Card, CardHeader, CardContent, TextField, Button, CardActions, Select, MenuItem, FormControl, InputLabel, Typography, Chip, Popover } from '@mui/material';
import { ChromePicker, ColorResult } from 'react-color';
import { useState } from 'react';

interface SettingsFormProps {
  restaurant: Restaurant;
}

const ColorPickerInput = ({ value, onChange }: { value: string, onChange: (color: string) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button variant="outlined" onClick={handleClick} sx={{ textTransform: 'none', justifyContent: 'flex-start' }}>
        <Box sx={{ width: 24, height: 24, backgroundColor: value, border: '1px solid grey', mr: 1, borderRadius: '4px' }} />
        {value}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <ChromePicker color={value} onChangeComplete={(color: ColorResult) => onChange(color.hex)} />
      </Popover>
    </>
  )
}

export default function RestaurantSettingsForm({ restaurant }: SettingsFormProps) {
  console.log(restaurant);
  const router = useRouter();
  const { control, handleSubmit, formState: { isDirty } } = useForm<UpdateRestaurantData>({
    defaultValues: {
      name: restaurant.name || '',
      slug: restaurant.slug || '',
      selected_theme: restaurant.selected_theme?.id || 2,
      primary_color_override: restaurant?.primary_color_override || '',
      secondary_color_override: restaurant?.secondary_color_override || '',
      background_color_override: restaurant?.background_color_override || '',
      text_color_override: restaurant?.text_color_override || '',
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateRestaurantData) => {
      const token = Cookies.get('jwt');
      if (!token) throw new Error('Not authenticated');
      return updateRestaurant(restaurant.id, data, token);
    },
    onSuccess: () => {
      alert('Ayarlar kaydedildi!');
      router.refresh();
    }
  });

  const onSubmit = (data: UpdateRestaurantData) => mutate(data);
  const isPremium = restaurant.plan === 'premium';


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title="Restoran Ayarları" subheader="Restoranınızın genel bilgilerini ve görünümünü buradan yönetin." />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Controller name="name" control={control} render={({ field }) => <TextField {...field} label="Restoran Adı" fullWidth />} />
          <Controller name="slug" control={control} render={({ field }) => <TextField {...field} label="URL Kısayolu (Slug)" fullWidth helperText="menuyap.com/menu/[slug]" />} />
          <Controller
            name="selected_theme"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Menü Teması</InputLabel>
                <Select {...field} label="Menü Teması">
                  <MenuItem value={4}>Modern Tema</MenuItem>
                  <MenuItem value={2}>Klasik Tema</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Typography variant='h6' sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 3 }}>
            Renk Özelleştirme {!isPremium && <Chip label="Premium Özellik" color="secondary" size="small" />}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 3, mt: 4 }}>
            {/* Renk seçiciler, plan 'premium' değilse pasif (disabled) olacak */}
            <Controller name="primary_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <InputLabel shrink>Ana Renk</InputLabel>
                  <ColorPickerInput
                    value={field.value || '#FFFFFF'} // Eğer değer tanımsızsa, varsayılan olarak beyaz kullan
                    onChange={field.onChange} />
                </FormControl>
              }
              disabled={!isPremium} />
            <Controller name="secondary_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <InputLabel shrink>Vurgu Rengi</InputLabel>
                  <ColorPickerInput
                    value={field.value || '#FFFFFF'} // Eğer değer tanımsızsa, varsayılan olarak beyaz kullan
                    onChange={field.onChange} />
                </FormControl>
              }
              disabled={!isPremium} />
            <Controller
              name="background_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <InputLabel shrink>Arka Plan Rengi</InputLabel>
                  <ColorPickerInput
                    value={field.value || '#FFFFFF'}
                    onChange={field.onChange} />
                </FormControl>
              }
              disabled={!isPremium} />
            <Controller
              name="text_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <InputLabel shrink>Metin Rengi</InputLabel>
                  <ColorPickerInput
                    value={field.value || '#FFFFFF'}
                    onChange={field.onChange} />
                </FormControl>
              }
              disabled={!isPremium} />
          </Box>
          {/* TODO: Logo güncelleme alanı eklenecek */}
        </CardContent>
        <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={!isDirty || isPending}>
            {isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}