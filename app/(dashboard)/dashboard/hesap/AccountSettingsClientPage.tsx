'use client';

import { useForm, Controller } from 'react-hook-form';
import { Box, Typography, Card, CardHeader, CardContent, TextField, Button, CardActions, Alert } from '@mui/material';
import type { User, UpdateProfileData, ChangePasswordData } from '@/app/types/strapi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { changePassword, updateUserProfile } from '@/app/lib/api';
import { useRouter } from 'next/navigation'; // useRouter'ı import ediyoruz
import { useSnackbar } from '@/app/context/SnackBarContext';
import { error } from 'console';



// Bu bileşen, user verisini prop olarak alacak
interface ClientPageProps {
  user: User;
}


export default function AccountSettingsClientPage({ user }: ClientPageProps) {
  const queryClient = useQueryClient();
  const router = useRouter(); // Router'ı kullanıma hazırlıyoruz
  const { showSnackbar } = useSnackbar();



  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfileForm, formState: { errors: profileErrors, isDirty } } = useForm<UpdateProfileData>({
    defaultValues: { username: user?.username || '', email: user?.email || '' }
  });
  const { mutate: updateProfileMutate, isPending: isProfilePending, isSuccess: isProfileSuccess, error: profileError } = useMutation({
    mutationFn: (data: UpdateProfileData) => updateUserProfile(user.id, data, Cookies.get('jwt')!),
    onSuccess: () => {
      router.refresh();
      resetProfileForm();
      showSnackbar('Profil bilgileri başarıyla güncellendi.', 'success');

    },
    onError: (error) => {
      showSnackbar((error as Error).message, 'error');
    }
  });
  const onProfileSubmit = (data: UpdateProfileData) => updateProfileMutate(data);

  const { control: passwordControl, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, getValues, reset: resetPasswordForm } = useForm<ChangePasswordData>({
    defaultValues: { currentPassword: '', password: '', passwordConfirmation: '' }
  });
  const { mutate: changePasswordMutate, isPending: isPasswordPending, isSuccess: isPasswordSuccess, error: passwordError } = useMutation({
    mutationFn: (data: ChangePasswordData) => changePassword(data, Cookies.get('jwt')!),
    onSuccess: () => {
      resetPasswordForm(); // Formu temizle
      showSnackbar('Şifreniz başarıyla değiştirildi!', 'success', 4000); // 4 saniye göster
    },
    onError: (error) => {
      showSnackbar((error as Error).message, 'error');
    }
  });
  const onPasswordSubmit = (data: ChangePasswordData) => changePasswordMutate(data);


  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        Hesap Ayarları
      </Typography>

      {/* --- GRID YERİNE YENİ FLEXBOX YAPISI --- */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Küçük ekranlarda alt alta, orta ve büyük ekranlarda yan yana
          gap: 4, // İki kart arasındaki boşluk
        }}
      >
        {/* Sol Sütun (Profil Bilgileri) */}
        <Box sx={{ flex: 1 }}> {/* Her iki sütunun da eşit yer kaplamasını sağlar */}
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Profil Bilgileri" subheader="Kullanıcı adınızı ve e-posta adresinizi güncelleyin." />
              <CardContent>
                <Controller name="username" control={profileControl} rules={{ required: 'Kullanıcı adı zorunludur' }} render={({ field }) => (<TextField {...field} label="Kullanıcı Adı" fullWidth margin="normal" error={!!profileErrors.username} helperText={profileErrors.username?.message} />)} />
                <Controller name="email" control={profileControl} rules={{ required: 'E-posta zorunludur' }} render={({ field }) => (<TextField {...field} label="E-posta" type="email" fullWidth margin="normal" disabled error={!!profileErrors.email} helperText={profileErrors.email?.message} />)} />
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button type="submit" variant="contained" disabled={!isDirty || isProfilePending}>
                  {isProfilePending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
              </CardActions>
            </Card>
          </form>
        </Box>

        {/* Sağ Sütun (Şifre Değiştirme) */}
        <Box sx={{ flex: 1 }}>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Şifre Değiştir" subheader="Güvenliğiniz için yeni bir şifre belirleyin." />
              <CardContent>
                <Controller
                  name='currentPassword'
                  control={passwordControl}
                  rules={{ required: "Lütfen Mevcut Sifre Alanını Doldurun !" }}
                  render={({ field }) => (
                    <TextField {...field} type='password' label="Mevcut Şifre" margin='normal' required fullWidth error={!!passwordErrors.currentPassword} helperText={passwordErrors.currentPassword?.message} />
                  )}
                />
                <Controller
                  name='password'
                  control={passwordControl}
                  rules={{ required: "Lütfen Yeni Sifre Alanını Doldurun !", minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır.' } }}
                  render={({ field }) => (
                    <TextField {...field} required label="Yeni Şifre" type="password" fullWidth margin="normal" error={!!passwordErrors.password} helperText={passwordErrors.password?.message} />

                  )}
                />
                <Controller
                  name='passwordConfirmation'
                  control={passwordControl}
                  rules={{ required: "Lütfen Sifre Onay Alanını Doldurun !", validate: (value) => value === getValues("password") || "Şifreler eşleşmiyor." }}
                  render={({ field }) => (
                    <TextField {...field} required label="Yeni Şifre (Tekrar)" type="password" fullWidth margin="normal" error={!!passwordErrors.passwordConfirmation} helperText={passwordErrors.passwordConfirmation?.message} />

                  )}
                />
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button type="submit" variant="contained" disabled={isPasswordPending}>
                  {isPasswordPending ? "Güncelleniyor..." : "Şifreyi Değiştir"}

                </Button>
              </CardActions>
            </Card>
          </form>
        </Box>
      </Box>
    </Box>
  );
}