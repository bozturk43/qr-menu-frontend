// app/(marketing)/page.tsx

import { getLandingPageData } from '@/app/lib/api';
import { Box, Button, Container, Typography, Paper, Card, CardContent, Avatar } from '@mui/material';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image'; // Next.js'in optimize edilmiş resim bileşeni

export default async function LandingPage() {
  const data = await getLandingPageData();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // Eğer veri çekilemezse bir hata mesajı göster
  if (!data) {
    return <Box>Sayfa yüklenirken bir sorun oluştu.</Box>;
  }

  const { hero_title, hero_subtitle, hero_image, features } = data;

  return (
    <Box>
      {/* 1. BÖLÜM: HERO SECTION */}
      <Container maxWidth="xl" sx={{ pt: { xs: 12, md: 16 },mx:{md:0} }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6 }}>
          {/* Sol Taraf: Metinler ve Buton */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography 
              component="h1" 
              sx={{ 
                fontFamily: 'Playfair Display, serif', 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#F8F7F4' 
              }}
            >
              {hero_title || "Menünüzü Saniyeler İçinde Güncelleyin"}
            </Typography>
            <Typography sx={{ mt: 3, mb: 4, fontSize: { xs: '1rem', md: '1.25rem' }, color: '#F8F7F4' }}>
              {hero_subtitle || "Kağıt masraflarına son verin, menünüzü anında güncelleyin ve müşterilerinize modern bir deneyim sunun."}
            </Typography>
            <Button href="/kayit-ol" variant="contained" color="secondary" size="large" sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}>
              Ücretsiz Başlayın
            </Button>
          </Box>
          
          {/* Sağ Taraf: Resim */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {hero_image && (
              <Paper elevation={12} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Image
                  src={`${STRAPI_URL}${hero_image.url}`}
                  alt="QR Menü Uygulaması Ekran Görüntüsü"
                  width={hero_image.width}
                  height={hero_image.height}
                  priority // Bu resmin öncelikli yüklenmesini sağlar
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
      
      {/* 2. BÖLÜM: ÖZELLİKLER */}
      <Box sx={{ py: { xs: 8, md: 16 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 8,color:"#f8f7f4" }}>
            Neden QR Menü?
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
            {features?.map((feature: any) => (
              <Card key={feature.id} variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <CardContent>
                  {feature.icon && (
                    <Avatar sx={{ mx: 'auto', mb: 2, width: 60, height: 60, bgcolor: 'secondary.main' }}>
                      <Image src={`${STRAPI_URL}${feature.icon.url}`} alt={feature.title} width={32} height={32} />
                    </Avatar>
                  )}
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* TODO: Diğer bölümler (Nasıl Çalışır, Fiyatlandırma, Son Çağrı) buraya eklenecek */}
    </Box>
  );
}