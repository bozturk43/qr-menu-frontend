'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { updateCategory } from '@/app/lib/api';
import type { Category, StrapiMedia, UpdateCategoryData } from '@/app/types/strapi';
import Image from 'next/image';


import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, Typography } from '@mui/material';
import { useSnackbar } from '@/app/context/SnackBarContext';
import { getStrapiMedia } from '@/app/lib/utils';
import { ImagePlus } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: Category; // Düzenlenecek kategoriyi prop olarak alıyoruz
  restaurantId: string;
}

type CategoryFormData = {
  name: string;
  image?: number;
};

export default function EditCategoryModal({ open, category, onClose, restaurantId }: EditCategoryModalProps) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [isMediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<StrapiMedia | null>(null);
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryFormData>();
  // Modal her açıldığında veya kategori prop'u değiştiğinde formu doldur
  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
        image: category.image?.id,
      });
      setSelectedImage(category.image || null);
    }
  }, [category, open, reset]);




  const { mutate, isPending, error } = useMutation({
    mutationFn: (formData: CategoryFormData) => {
      const token = Cookies.get('jwt');
      if (!token) throw new Error('Not authenticated');
      const categoryData: UpdateCategoryData = {
        name: formData.name,
        image: formData.image,
      };
      // createCategory yerine updateCategory'yi kullanıyoruz
      return updateCategory(category.id, categoryData, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      showSnackbar('Kategori başarıyla güncellendi.', 'success');
      onClose();
    },
    onError: (err) => showSnackbar((err as Error).message, 'error'),
  });

  const onSubmit = (data: CategoryFormData) => mutate(data);
  const handleImageSelect = (media: StrapiMedia | StrapiMedia[]) => {
    const singleMedia = Array.isArray(media) ? media[0] : media;
    if (singleMedia) {
      setValue('image', singleMedia.id, { shouldDirty: true });
      setSelectedImage(singleMedia);
    }
    setMediaModalOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Kategoriyi Düzenle</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Kategori adı zorunludur.' }}
              render={({ field }) => <TextField {...field} autoFocus margin="dense" label="Kategori Adı" fullWidth variant="outlined" error={!!errors.name} helperText={errors.name?.message} sx={{ mb: 2 }} />}
            />
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Kategori Resmi</Typography>
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
            <Button onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={isPending} variant="contained">
              {isPending ? 'Güncelleniyor...' : 'Kaydet'}
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