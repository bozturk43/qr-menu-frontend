'use client';

import { useRef } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import QRCode from 'react-qr-code';
import { Download } from 'lucide-react';

interface QrCodeCardProps {
  url: string;
  slug: string;
}

export default function QrCodeCard({ url, slug }: QrCodeCardProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const svgElement = qrCodeRef.current?.querySelector('svg');
    if (!svgElement) return;

    // SVG'yi XML string'ine çevir
    const svgXml = new XMLSerializer().serializeToString(svgElement);
    // Base64 formatına kodla
    const svgBase64 = btoa(svgXml);
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    // İndirme için geçici bir link oluştur
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${slug}-qr-code.svg`; // İndirilecek dosyanın adı
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper 
        elevation={3} 
        sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: 2,
        }}
    >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Menü QR Kodu</Typography>
        <Box 
            ref={qrCodeRef}
            sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}
        >
            <QRCode
                value={url}
                size={180}
                viewBox={`0 0 180 180`}
            />
        </Box>
        <Button 
            variant="contained" 
            startIcon={<Download size={18}/>}
            onClick={downloadQRCode}
        >
            SVG İndir
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{wordBreak: 'break-all'}}>
            URL: {url}
        </Typography>
    </Paper>
  );
}