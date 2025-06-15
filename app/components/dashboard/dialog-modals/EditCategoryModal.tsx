'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { updateCategory, uploadFile } from '@/app/lib/api';
import type { Category, UpdateCategoryData } from '@/app/types/strapi';

import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Alert, Box } from '@mui/material';

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: Category; // Düzenlenecek kategoriyi prop olarak alıyoruz
  restaurantId: string;
}

type CategoryFormData = {
  name: string;
  image?: FileList;
};

export default function EditCategoryModal({ open, category, onClose, restaurantId }: EditCategoryModalProps) {
  const queryClient = useQueryClient();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<CategoryFormData>();
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Modal her açıldığında veya kategori prop'u değiştiğinde formu doldur
  useEffect(() => {
    if (category) {
      reset({ name: category.name });
      setPreviewUrl(category.image ? `${STRAPI_URL}${category.image.url}` : null);
    }
  }, [category, reset]);

  // Yeni bir resim seçildiğinde önizlemeyi güncelle
  const imageField = watch('image');
  useEffect(() => {
    if (imageField && imageField.length > 0) {
      const file = imageField[0];
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      return () => URL.revokeObjectURL(newPreviewUrl);
    }
  }, [imageField]);


  const { mutate, isPending, error } = useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      const token = Cookies.get('jwt');
      if (!token) throw new Error('Not authenticated');

      let imageId: number | undefined = category.image?.id;

      // 1. Eğer YENİ bir resim seçilmişse, onu yükle ve ID'sini al
      if (formData.image && formData.image.length > 0) {
        imageId = await uploadFile(formData.image[0], token);
      }

      // 2. Güncellenecek veriyi hazırla
      const updateData: UpdateCategoryData = {
        name: formData.name,
        image: imageId,
      };

      // 3. Kategoriyi güncelle
      return updateCategory(category.id, updateData, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      onClose();
    },
  });
  
  const onSubmit = (data: CategoryFormData) => {
    mutate(data);
  };

  return (
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
          {previewUrl && (
            <Box sx={{ my: 2, textAlign: 'center' }}><img src={previewUrl} alt="Önizleme" style={{ maxHeight: '150px', borderRadius: '8px' }} /></Box>
          )}
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange } }) => (
              <Button variant="outlined" component="label" fullWidth>
                {previewUrl ? 'Resmi Değiştir' : 'Resim Seç'}
                <input type="file" hidden accept="image/*" onChange={(e) => onChange(e.target.files)} />
              </Button>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" disabled={isPending} variant="contained">
            {isPending ? 'Güncelleniyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}