// src/components/marketing/MarketingFooter.tsx
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

export default function MarketingFooter() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} QRMenuApp. Tüm Hakları Saklıdır.
          </Typography>
          <Box>
            <MuiLink component={Link} href="/gizlilik-politikasi" variant="body2" sx={{ mr: 2 }}>
              Gizlilik Politikası
            </MuiLink>
            <MuiLink component={Link} href="/kullanim-kosullari" variant="body2">
              Kullanım Koşulları
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}