'use client';

import { Box, Paper } from '@mui/material';
import { useEffect, useState } from 'react';

interface PreviewProps {
  // Gösterilecek olan menünün tam URL'i
  url: string;
  // Yeniden yüklemeyi tetikleyecek olan bir sayaç
  reloadKey: number; 
}

export default function MenuPreviewIframe({ url, reloadKey }: PreviewProps) {
  // iframe'in src'sini, reloadKey her değiştiğinde güncelleyerek yeniden yüklenmesini sağlıyoruz.
  // Cache'i atlamak için sonuna bir timestamp ekliyoruz.
  const iframeSrc = `${url}?_t=${reloadKey}`;

  return (
    <Paper 
      elevation={8} 
      sx={{ 
        width: 320, 
        height: 640, 
        borderRadius: '32px', 
        overflow: 'hidden', 
        border: '8px solid #333',
        position: 'sticky',
        top: '100px',
        p: 0 // İç boşluğu sıfırla
      }}
    >
      <iframe
        key={iframeSrc} // key'i değiştirmek de yeniden render'ı tetikler
        src={iframeSrc}
        title="Menü Önizlemesi"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </Paper>
  );
}