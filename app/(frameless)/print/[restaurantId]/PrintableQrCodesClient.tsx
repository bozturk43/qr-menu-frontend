'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Restaurant } from '@/app/types/strapi';
import { Box, Button, Typography, Paper } from '@mui/material'; // Grid importunu kaldırdık
import { Print, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

interface PrintableProps {
  restaurant: Restaurant;
}

export default function PrintableQrCodesClient({ restaurant }: PrintableProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: 4, '@media print': { p: 0 } }}>
      {/* Bu bölüm yazdırma sırasında gizlenecek */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, '@media print': { display: 'none' } }}>
        <Typography variant="h4" component="h1">
          {restaurant.name} - QR Kodları
        </Typography>
        <Box>
          <Button
            variant="outlined"
            component={Link}
            href={`/dashboard/restaurants/${restaurant.id}/masalar`}
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Masa Yönetimine Dön
          </Button>
          <Button variant="contained" onClick={handlePrint} startIcon={<Print />}>
            Yazdır / PDF Olarak Kaydet
          </Button>
        </Box>
      </Box>
      
      {/* --- GRID YERİNE YENİ BOX YAPISI --- */}
      <Box 
        sx={{ 
          display: 'grid',
          // Ekran boyutuna göre sütun sayısını ayarlıyoruz
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // En küçük ekranlarda 2 sütun
            sm: 'repeat(3, 1fr)', // Küçük ekranlarda 3 sütun
            md: 'repeat(4, 1fr)', // Orta ekranlarda 4 sütun
            lg: 'repeat(5, 1fr)', // Geniş ekranlarda 5 sütun
          },
          gap: 4, // Kartlar arası boşluk
        }}
      >
        {restaurant.tables?.sort((a, b) => a.name.localeCompare(b.name)).map((table) => {
          const tableUrl = `${siteUrl}/menu/${restaurant.slug}?table=${table.qr_code_identifier}`;
          
          return (
            // Artık Grid item'a ihtiyacımız yok, doğrudan Paper'ı kullanıyoruz
            <Paper
              key={table.id}
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                breakInside: 'avoid-page', 
              }}
            >
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                <QRCodeSVG value={tableUrl} size={128} />
              </Box>
              <Typography variant="h6" component="p" sx={{ fontWeight: 'bold' }}>
                {table.name}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}