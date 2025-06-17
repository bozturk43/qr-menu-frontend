// app/(dashboard)/restaurants/[restaurantId]/RestaurantSettingsForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { updateRestaurant, uploadFile } from '@/app/lib/api';
import type { Restaurant, UpdateRestaurantData } from '@/app/types/strapi';
import { Box, Card, CardHeader, CardContent, TextField, Button, CardActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface SettingsFormProps {
  restaurant: Restaurant;
}

export default function RestaurantSettingsForm({ restaurant }: SettingsFormProps) {
    console.log(restaurant);
  const router = useRouter();
  const { control, handleSubmit, formState: { isDirty } } = useForm<UpdateRestaurantData>({
    defaultValues: {
      name: restaurant.name || '',
      slug: restaurant.slug || '',
      selected_theme: restaurant.selected_theme?.id || 2,
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