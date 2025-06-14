'use client';
import { useForm, Controller } from 'react-hook-form'; // React Hook Form importları
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/app/lib/api';
import type { UserRegistrationInfo } from '@/app/types/strapi'; // Form verimiz için tip
// MUI Bileşenleri
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import Link from 'next/link';

export default function SignUpPage() {
  const { 
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<UserRegistrationInfo>({
    defaultValues: { // Formun başlangıç değerleri
      username: '',
      email: '',
      password: ''
    }
  });

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: registerUser,
  });

  const onSubmit = (data: UserRegistrationInfo) => {
    mutate(data);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h2" color="primary">
          Hesap Oluştur
        </Typography>
        <Typography component="p" color="text.secondary" sx={{ mt: 1 }}>
          QR Menü dünyasına katılın ve restoranınızı dijitale taşıyın.
        </Typography>
        
        {/* handleSubmit ile kendi onSubmit fonksiyonumuzu sarmalıyoruz */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3, width: '100%' }}>
          
          <Controller
            name="username"
            control={control}
            rules={{ required: 'Kullanıcı adı zorunludur.' }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Kullanıcı Adı"
                autoComplete="username"
                autoFocus
                error={!!errors.username}
                helperText={errors.username?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{ 
              required: 'E-posta adresi zorunludur.',
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Geçersiz e-posta adresi."
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="E-posta Adresi"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ 
              required: 'Şifre zorunludur.',
              minLength: {
                value: 6,
                message: "Şifre en az 6 karakter olmalıdır."
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                type="password"
                label="Şifre"
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error.message}
            </Alert>
          )}

          {isSuccess && (
             <Alert severity="success" sx={{ mt: 2 }}>
              Kayıt başarılı! Lütfen e-postanıza gönderilen onay linkine tıklayın.
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            disabled={isPending}
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            {isPending ? 'Hesap Oluşturuluyor...' : 'Ücretsiz Üye Ol'}
          </Button>
          
          <Typography variant="body2" align="center">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/giris-yap" style={{ color: '#0D253F' }}>
              Giriş Yapın
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}