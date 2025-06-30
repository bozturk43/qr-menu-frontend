// app/(dashboard)/restaurants/[restaurantId]/tasarim/DesignSettingsForm.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { updateRestaurant } from '@/app/lib/api';
import type { Restaurant, UpdateRestaurantData } from '@/app/types/strapi';
import { ChromePicker, ColorResult } from 'react-color';

// MUI & İkonlar
import {
    Box, Card, CardHeader, CardContent, TextField, Button, CardActions, Autocomplete,
    Typography, Switch, FormControlLabel, Paper, Popover, Chip,
    Tooltip
} from '@mui/material';
import { inter, playfair } from '@/app/theme'; // Ana temamızdaki fontları import ediyoruz
import { useSnackbar } from '@/app/context/SnackBarContext';
import MenuPreviewIframe from '@/app/components/dashboard/MenuPreviewIframe';

// Ayarlar Formu için Prop Tipi
interface DesignFormProps {
    restaurant: Restaurant;
}

// Renk Seçici için Yardımcı Bileşen
function ColorPickerInput({ value, onChange }: { value: string | null | undefined, onChange: (color: string) => void }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const displayColor = value || '#FFFFFF';
    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Button variant="outlined" onClick={handleClick} sx={{ textTransform: 'none', justifyContent: 'flex-start', width: '100%' }}>
                <Box sx={{ width: 24, height: 24, backgroundColor: displayColor, border: '1px solid grey', mr: 1, borderRadius: '4px' }} />
                {value ? value.toUpperCase() : "Renk Seç"}
            </Button>
            <Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <ChromePicker color={displayColor} onChangeComplete={(color: ColorResult) => onChange(color.hex)} />
            </Popover>
        </>
    )
}

// Font Seçenekleri Listesi
const fontOptions = [
    { label: 'Inter (Modern ve Okunaklı)', value: inter.style.fontFamily },
    { label: 'Playfair Display (Şık ve Klasik)', value: playfair.style.fontFamily },
];

export default function DesignSettingsForm({ restaurant }: DesignFormProps) {
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const [reloadKey, setReloadKey] = useState(0);


    const { control, handleSubmit, reset, formState: { isDirty, dirtyFields } } = useForm<UpdateRestaurantData>({
        // Formun varsayılan değerlerini sunucudan gelen veriyle dolduruyoruz
        defaultValues: {
            show_restaurant_name: restaurant.show_restaurant_name ?? true,
            font_restaurant_title: restaurant.font_restaurant_title || playfair.style.fontFamily,
            font_category_title: restaurant.font_category_title || playfair.style.fontFamily,
            font_product_title: restaurant.font_product_title || inter.style.fontFamily,

            color_restaurant_title : restaurant.color_restaurant_title || null,
            color_category_title: restaurant.color_category_title || null,
            color_product_title: restaurant.color_product_title || null,
            color_product_description: restaurant.color_product_description || null,

            primary_color_override: restaurant.primary_color_override || null,
            secondary_color_override: restaurant.secondary_color_override || null,
            background_color_override: restaurant.background_color_override || null,
            text_color_override: restaurant.text_color_override || null,

        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: Partial<UpdateRestaurantData>) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');
            return updateRestaurant(restaurant.id, data, token);
        },
        onSuccess: () => {
            showSnackbar('Tasarım ayarları başarıyla kaydedildi!', 'success');
            router.refresh();
            setReloadKey(prevKey => prevKey + 1);

        },
        onError: (error) => showSnackbar((error as Error).message, 'error'),
    });

    const onSubmit = (data: UpdateRestaurantData) => {
        // Sadece gerçekten değiştirilmiş olan alanları API'ye gönderiyoruz
        const changedData: Partial<UpdateRestaurantData> = {};
        Object.keys(dirtyFields).forEach(key => {
            (changedData as any)[key] = data[key as keyof UpdateRestaurantData];
        });

        if (Object.keys(changedData).length > 0) {
            mutate(changedData);
        }
    };

    const handleResetAllSettings = () => {
        const defaultValues = {
            show_restaurant_name: true,
            font_restaurant_title: null,
            font_category_title:null,
            font_product_title:null,
            color_restaurant_title:null,
            color_category_title: null,
            color_product_title: null,
            color_product_description: null,
            primary_color_override: null,
            secondary_color_override: null,
            background_color_override: null,
            text_color_override: null,
        };
        // reset fonksiyonu formu tamamen başlangıç değerlerine döndürür
        reset(defaultValues);
        // Değişikliği kaydetmek için bir mutasyon tetikleyebiliriz
        mutate(defaultValues);
    };

    // Menünün tam URL'ini oluşturalım
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const menuUrl = `${siteUrl}/menu/${restaurant.slug}`;


    const isPremium = restaurant.plan === 'pro' || restaurant.plan === 'bussiness';

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: 'flex-start' }}>
            <Box sx={{ width: { xs: "100%", lg: "65%" } }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader
                            title="Tasarım & Özelleştirme"
                            subheader="Menünüzün görünümünü marka kimliğinize göre özelleştirin."
                            action={
                                <Tooltip title="Tüm tasarım ayarlarını temanın varsayılan haline döndür.">
                                    <span>
                                        <Button variant="outlined" size="small" onClick={handleResetAllSettings} disabled={!isPremium}>
                                            Tüm Ayarları Sıfırla
                                        </Button>
                                    </span>
                                </Tooltip>
                            }
                        />
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Genel Görünüm</Typography>
                                <Controller
                                    name="show_restaurant_name"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel control={<Switch {...field} checked={field.value ?? true} />} label="Menüde Restoran Adı Gösterilsin" />
                                    )}
                                />
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Yazı Tipleri</Typography>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                    <Controller
                                        name="font_restaurant_title"
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                {...field}
                                                options={fontOptions}
                                                getOptionLabel={(option) => option.label}
                                                value={fontOptions.find(f => f.value === field.value) || fontOptions[0]}
                                                onChange={(e, newValue) => field.onChange(newValue?.value)}
                                                renderInput={(params) => <TextField {...params} label="Restoran Başlık Fontu" />}
                                                renderOption={(props, option) => (
                                                    <Box component="li" {...props} sx={{ fontFamily: option.value }}>
                                                        {option.label}
                                                    </Box>
                                                )}
                                                sx={{ flex: 1 }}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="font_category_title"
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                {...field}
                                                options={fontOptions}
                                                getOptionLabel={(option) => option.label}
                                                value={fontOptions.find(f => f.value === field.value) || fontOptions[1]}
                                                onChange={(e, newValue) => field.onChange(newValue?.value)}
                                                renderInput={(params) => <TextField {...params} label="Kategori Başlıkları Fontu" />}
                                                renderOption={(props, option) => (
                                                    <Box component="li" {...props} sx={{ fontFamily: option.value }}>
                                                        {option.label}
                                                    </Box>
                                                )}
                                                sx={{ flex: 1 }}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="font_product_title"
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                {...field}
                                                options={fontOptions}
                                                getOptionLabel={(option) => option.label}
                                                value={fontOptions.find(f => f.value === field.value) || fontOptions[1]}
                                                onChange={(e, newValue) => field.onChange(newValue?.value)}
                                                renderInput={(params) => <TextField {...params} label="Ürün Başlıkları Fontu" />}
                                                renderOption={(props, option) => (
                                                    <Box component="li" {...props} sx={{ fontFamily: option.value }}>
                                                        {option.label}
                                                    </Box>
                                                )}
                                                sx={{ flex: 1 }}
                                            />
                                        )}
                                    />
                                </Box>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant='h6'>
                                        Renk Paleti {!isPremium && <Chip label="Pro Özellik" color="secondary" size="small" sx={{ ml: 1 }} />}
                                    </Typography>
                                    {/* TODO: Renkleri sıfırlama butonu eklenebilir */}
                                </Box>
                                <Box sx={{ opacity: isPremium ? 1 : 0.6, pointerEvents: isPremium ? 'auto' : 'none' }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                                        <Controller name="primary_color_override"
                                            control={control}
                                            render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Ürün Kartları Arkaplan Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />
                                                </Box>
                                            )}
                                        />
                                        <Controller name="secondary_color_override"
                                            control={control}
                                            render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Kategori Kartları Arka Plan Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />
                                                </Box>
                                            )
                                            }
                                        />
                                        <Controller name="background_color_override"
                                            control={control} render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Arka Plan Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />
                                                </Box>

                                            )
                                            }
                                        />
                                        <Controller name="text_color_override"
                                            control={control} render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Metin Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />

                                                </Box>
                                            )
                                            }
                                        />
                                        <Controller name="color_restaurant_title"
                                            control={control} render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Restoran Başlık Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />

                                                </Box>
                                            )
                                            }
                                        />
                                        <Controller name="color_category_title"
                                            control={control} render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Kategori Başlıkları Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />

                                                </Box>
                                            )
                                            }
                                        />
                                         <Controller name="color_product_title"
                                            control={control} render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Ürün Başlıkları Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />

                                                </Box>
                                            )
                                            }
                                        />
                                        <Controller name="color_product_description"
                                            control={control} render={({ field }) => (
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.secondary' }}>
                                                        Ürün Açıklamaları Rengi
                                                    </Typography>
                                                    <ColorPickerInput {...field} />

                                                </Box>
                                            )
                                            }
                                        />
                                    </Box>
                                </Box>
                            </Paper>

                        </CardContent>
                        <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" disabled={!isDirty || isPending}>
                                {isPending ? 'Kaydediliyor...' : 'Tasarımı Kaydet'}
                            </Button>
                        </CardActions>
                    </Card>
                </form>
            </Box>
            <Box sx={{ width: { xs: '100%', lg: '35%' } }}>
                <Box sx={{ position: 'sticky', top: '100px' }}>
                    <MenuPreviewIframe url={menuUrl} reloadKey={reloadKey} />
                </Box>
            </Box>
        </Box>

    );
}