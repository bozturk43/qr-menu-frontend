// app/(dashboard)/restaurants/[restaurantId]/RestaurantSettingsForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getThemes, updateRestaurant } from '@/app/lib/api';
import type { Restaurant, StrapiMedia, UpdateRestaurantData } from '@/app/types/strapi';
import { Box, Card, CardHeader, CardContent, TextField, Button, CardActions, Select, MenuItem, FormControl, InputLabel, Typography, Avatar } from '@mui/material';
import { useEffect, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useSnackbar } from '@/app/context/SnackBarContext';
import { getStrapiMedia } from '@/app/lib/utils';
import MediaLibraryModal from '@/app/components/dashboard/dialog-modals/MediaLibraryModal';

interface SettingsFormProps {
  restaurant: Restaurant;
}


export default function RestaurantSettingsForm({ restaurant }: SettingsFormProps) {
  const { showSnackbar } = useSnackbar();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();
  const [isMediaModalOpen, setMediaModalOpen] = useState(false);

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
  const { data: themeData } = useQuery({
    queryKey: ["themes"],
    queryFn: getThemes
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: Partial<UpdateRestaurantData>) => {
      const token = Cookies.get('jwt');
      if (!token) throw new Error('Not authenticated');
      return updateRestaurant(restaurant.id, data, token);
    },
    onSuccess: () => {
      showSnackbar('Ayarlar kaydedildi!', 'success');
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
  // Yeni dosya seçildiğinde state'i ve önizlemeyi güncelleyen fonksiyon
  const handleLogoSelect = (media: StrapiMedia) => {
    // 1. Formun 'logo' alanının değerini seçilen resmin ID'si ile güncelle
    setValue('logo', media.id, { shouldDirty: true });
    // 2. Ekrondaki önizlemeyi güncelle
    setLogoPreview(getStrapiMedia(media));
    // 3. Modalı kapat
  };
  // Mevcut logoyu kaldırma fonksiyonu
  const handleRemoveLogo = () => {
    // 1. Ekrondaki önizlemeyi temizle
    setLogoPreview(null);
    // 2. Formdaki 'logo' alanının değerini null yap ve formu 'kirli' olarak işaretle
    setValue('logo', null, { shouldDirty: true });
  };


  useEffect(() => {
    if (restaurant) {
      setLogoPreview(getStrapiMedia(restaurant.logo));
    }
  }, [restaurant]);


  return (
    <>
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
                    {themeData?.map(item => (
                      <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Typography variant='h6' sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 3 }}>
              Logo ve Markalaşma
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={logoPreview || undefined}
                sx={{ width: 80, height: 80, fontSize: '2.5rem', bgcolor: 'primary.light' }}
              >
                {!logoPreview && restaurant.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                {/* Bu buton artık bizim merkezi modalımızı açıyor */}
                <Button variant="outlined" component="label" startIcon={<ImagePlus />} onClick={() => setMediaModalOpen(true)}>
                  Kütüphaneden Seç / Yükle
                </Button>
                {logoPreview && (
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={handleRemoveLogo}
                  >
                    Kaldır
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
          <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={!isDirty || isPending}>
              {isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </CardActions>
        </Card>
      </form>
      <MediaLibraryModal
        open={isMediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleLogoSelect}
      />
    </>
  );
}