'use client';

import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'; // Yönlendirme için
import { loginUser } from '@/app/lib/api';
import type { UserLoginInfo } from '@/app/types/strapi';
import Cookies from 'js-cookie';

// MUI Bileşenleri
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter(); // Yönlendiriciyi (router) kullanıma hazırlıyoruz

    const { control, handleSubmit, formState: { errors } } = useForm<UserLoginInfo>({
        defaultValues: { identifier: '', password: '' },
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: loginUser,
        // Başarılı girişten SONRA çalışacak fonksiyon
        onSuccess: (data) => {
            // Strapi'den gelen JWT'yi (giriş anahtarı) şimdilik Local Storage'a kaydediyoruz.
            // Not: Production'da bunu httpOnly cookie ile yapmak daha güvenlidir.
            Cookies.set('jwt', data.jwt, { expires: 7, path: '/' });
            localStorage.setItem('jwt', data.jwt);
            router.push('/dashboard');
        },
    });

    const onSubmit = (data: UserLoginInfo) => {
        mutate(data);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h2" color="primary">
                    Giriş Yap
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3, width: '100%' }}>
                    <Controller
                        name="identifier"
                        control={control}
                        rules={{ required: 'Kullanıcı adı veya e-posta zorunludur.' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Kullanıcı Adı veya E-posta"
                                autoComplete="email"
                                autoFocus
                                error={!!errors.identifier}
                                helperText={errors.identifier?.message}
                            />
                        )}
                    />

                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: 'Şifre zorunludur.' }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                type="password"
                                label="Şifre"
                                autoComplete="current-password"
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

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        disabled={isPending}
                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        {isPending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </Button>

                    <Typography variant="body2" align="center">
                        Hesabınız yok mu?{' '}
                        <Link href="/kayit-ol" style={{ color: '#0D253F' }}>
                            Hemen Üye Olun
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}