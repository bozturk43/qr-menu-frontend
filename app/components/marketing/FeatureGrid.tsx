// src/components/marketing/FeatureGrid.tsx
'use client';

import { getStrapiMedia } from '@/app/lib/utils';
import { Box, Typography, Paper } from '@mui/material';
import Image from 'next/image';

// Bu bileşenin alacağı propların tipi
interface FeatureGridProps {
    // `any` yerine daha sonra Strapi'den gelen veri için tip oluşturulacak
    blocks: any[];
}

export default function FeatureGrid({ blocks }: FeatureGridProps) {

    return (
        <Box
            sx={{
                display: 'grid',
                // Büyük ekranlarda 3 sütunlu bir grid oluşturuyoruz
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 3,
            }}
        >
            {blocks.map((block) => (
                <Paper
                    key={block.id}
                    elevation={4}
                    sx={{
                        p: 3,
                        borderRadius: '16px',
                        // Strapi'den gelen 'layout_size' bilgisine göre kartın kaplayacağı alanı ayarlıyoruz
                        gridColumn: {
                            xs: 'span 1', // Mobil'de her kart tek sütun kaplar
                            md: block.layout_size === 'large' ? 'span 2' : 'span 1'
                        },
                        // Daha uzun kartlar için
                        gridRow: block.layout_size === 'large' ? 'span 2' : 'span 1',
                        backgroundColor: '#1E293B', // Modern Koyu Mavi
                        color: '#E2E8F0', // Buz Beyazı
                    }}
                >
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {block.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ color: '#94a3b8' }}>
                        {block.description}
                    </Typography>
                    {block.image && (
                        <Box sx={{ mt: 3, borderRadius: '8px', overflow: 'hidden', lineHeight: 0 }}>
                            {/* Strapi'den gelen dosya uzantısını kontrol ediyoruz */}
                            {['.mp4', '.webm'].includes(block.image.ext) ? (
                                // EĞER VİDEO İSE:
                                <video
                                    src={getStrapiMedia(block.image)}
                                    width="100%"
                                    height="auto"
                                    autoPlay // Otomatik başlat
                                    loop     // Sürekli döngüye al
                                    muted    // Sesi kapalı başlat (otomatik oynatma için zorunlu)
                                    playsInline // Mobil cihazlarda tam ekrana geçmeden oynat
                                />
                            ) : (
                                // EĞER RESİM İSE:
                                <Image
                                    src={getStrapiMedia(block.image)}
                                    alt={block.title}
                                    width={block.image.width}
                                    height={block.image.height}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            )}
                        </Box>
                    )}
                </Paper>
            ))}
        </Box>
    );
}