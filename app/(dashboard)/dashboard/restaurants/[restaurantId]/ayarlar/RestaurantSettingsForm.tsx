// app/(dashboard)/restaurants/[restaurantId]/RestaurantSettingsForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { updateRestaurant, uploadFile } from '@/app/lib/api';
import type { Restaurant, UpdateRestaurantData } from '@/app/types/strapi';
import { Box, Card, CardHeader, CardContent, TextField, Button, CardActions, Select, MenuItem, FormControl, InputLabel, Typography, Chip, Popover, Tooltip } from '@mui/material';
import { ChromePicker, ColorResult } from 'react-color';
import { useState } from 'react';

interface SettingsFormProps {
  restaurant: Restaurant;
}

function ColorPickerInput({ value, onChange }: { value: string | null | undefined, onChange: (color: string) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Görüntülenecek rengi belirliyoruz. Eğer bir değer yoksa, beyaz göster.
  const displayColor = value || '#FFFFFF';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button variant="outlined" onClick={handleClick} sx={{ textTransform: 'none', justifyContent: 'flex-start' }}>
        <Box sx={{ width: 24, height: 24, backgroundColor: displayColor, border: '1px solid grey', mr: 1, borderRadius: '4px' }} />
        {/* Değer varsa onu, yoksa "Renk Seç" yazısını göster */}
        {value ? value.toUpperCase() : "Renk Seç"}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <ChromePicker color={displayColor} onChangeComplete={(color: ColorResult) => onChange(color.hex)} />
      </Popover>
    </>
  )
}

export default function RestaurantSettingsForm({ restaurant }: SettingsFormProps) {
  console.log(restaurant);
  const router = useRouter();
  const { control, handleSubmit, setValue, formState: { isDirty, dirtyFields } } = useForm<UpdateRestaurantData>({
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
    mutationFn: (data: Partial<UpdateRestaurantData>) => {
      const token = Cookies.get('jwt');
      if (!token) throw new Error('Not authenticated');
      return updateRestaurant(restaurant.id, data, token);
    },
    onSuccess: () => {
      alert('Ayarlar kaydedildi!');
      router.refresh();
    }
  });

  const onSubmit = (data: UpdateRestaurantData) => {
    // Sadece değiştirilmiş alanları (dirty fields) alıp mutasyona gönderiyoruz.
    const changedData: Partial<UpdateRestaurantData> = {};
    for (const key in dirtyFields) {
      if (dirtyFields[key as keyof UpdateRestaurantData]) {
        (changedData as any)[key] = data[key as keyof UpdateRestaurantData];
      }
    }
    if (Object.keys(changedData).length > 0) {
      mutate(changedData);
    }

  };
  const handleResetColors = () => {
    // setValue ile dört renk alanını da null'a çeviriyoruz.
    // { shouldDirty: true } ayarı, bu değişikliğin bir "form değişikliği"
    // olarak algılanmasını ve "Kaydet" butonunun aktif olmasını sağlar.
    setValue('primary_color_override', null, { shouldDirty: true });
    setValue('secondary_color_override', null, { shouldDirty: true });
    setValue('background_color_override', null, { shouldDirty: true });
    setValue('text_color_override', null, { shouldDirty: true });
  };
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
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 3,
            mt: 4,
            opacity: isPremium ? 1 : 0.6,
            pointerEvents: isPremium ? 'auto' : 'none'
          }} >
            {/* Renk seçiciler, plan 'premium' değilse pasif (disabled) olacak */}
            <Controller name="primary_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <Typography variant="caption">Ana Renk</Typography>
                  <ColorPickerInput {...field} />
                </FormControl>
              }
              disabled={!isPremium} />
            <Controller name="secondary_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <Typography variant="caption">Vurgu Rengi</Typography>
                  <ColorPickerInput {...field} />
                </FormControl>
              }
              disabled={!isPremium} />
            <Controller
              name="background_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <Typography variant="caption">Arka Plan Rengi</Typography>
                  <ColorPickerInput {...field} />
                </FormControl>
              }
              disabled={!isPremium} />
            <Controller
              name="text_color_override"
              control={control}
              render={({ field }) =>
                <FormControl fullWidth>
                  <Typography variant="caption">Metin Rengi</Typography>
                  <ColorPickerInput {...field} />
                </FormControl>
              }
              disabled={!isPremium} />
          </Box>
          <Tooltip title="Tüm renk özelleştirmelerini kaldırıp temanın varsayılan renklerine dön.">
            {/* Butonun tıklanabilirliği de premium durumuna bağlı */}
            <span>
              <Button variant="outlined" size="small" onClick={handleResetColors} disabled={!isPremium}>
                Renkleri Sıfırla
              </Button>
            </span>
          </Tooltip>
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